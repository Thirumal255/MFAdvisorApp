import os
import sys
import json
import time
import requests
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

BASE_LIST_URL = "https://api.mfapi.in/mf"
BASE_SCHEME_URL = "https://api.mfapi.in/mf/{code}"

SLEEP_BETWEEN_CALLS = 0.05
BATCH_SIZE = 100
PER_REQUEST_TIMEOUT = 20
MAX_RETRIES_PER_SCHEME = 3
RETRY_BACKOFF_SECONDS = [120, 240, 360]  # 2, 4, 6 minutes
MAX_WORKERS = 8
BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
FINAL_JSON = os.path.join(DATA_DIR, "all_scheme_full_details.json")
TEMP_JSON = os.path.join(DATA_DIR, "all_scheme_full_details_temp.json")
FAILED_CODES_FILE = os.path.join(DATA_DIR, "failed_scheme_codes.json")


def fetch_all_schemes():
    resp = requests.get(BASE_LIST_URL, timeout=PER_REQUEST_TIMEOUT)
    resp.raise_for_status()
    return resp.json()


def fetch_scheme_details_with_retry(code, name):
    url = BASE_SCHEME_URL.format(code=code)
    last_exc = None

    for attempt in range(1, MAX_RETRIES_PER_SCHEME + 1):
        try:
            resp = requests.get(url, timeout=PER_REQUEST_TIMEOUT)
            resp.raise_for_status()
            js = resp.json()
            js["_list_schemeCode"] = code
            js["_list_schemeName"] = name
            return js
        except (requests.exceptions.ConnectTimeout,
                requests.exceptions.ReadTimeout,
                requests.exceptions.ConnectionError) as e:
            last_exc = e
            print(f"[WARN] Network/timeout for scheme {code} "
                  f"(attempt {attempt}/{MAX_RETRIES_PER_SCHEME}): {e}")
            if attempt < MAX_RETRIES_PER_SCHEME:
                wait_sec = RETRY_BACKOFF_SECONDS[attempt - 1]
                print(f"[INFO] Waiting {wait_sec/60:.1f} minutes before retry of {code}...")
                time.sleep(wait_sec)
        except requests.exceptions.HTTPError as e:
            print(f"[WARN] HTTP error for scheme {code}: {e}")
            return None

    print(f"[ERROR] Giving up on scheme {code} after {MAX_RETRIES_PER_SCHEME} attempts: {last_exc}")
    return None


def backup_existing_final():
    if not os.path.exists(FINAL_JSON):
        return
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = os.path.join(DATA_DIR, f"all_scheme_full_details_{ts}.json")
    print(f"[INFO] Backing up existing file to {backup_name}")
    os.rename(FINAL_JSON, backup_name)


def write_failed_codes(codes):
    codes_sorted = sorted(set(codes))
    if codes_sorted:
        with open(FAILED_CODES_FILE, "w", encoding="utf-8") as f:
            json.dump(codes_sorted, f, ensure_ascii=False, indent=2)
        print(f"[INFO] Failed codes file updated with {len(codes_sorted)} codes: {FAILED_CODES_FILE}")
    else:
        if os.path.exists(FAILED_CODES_FILE):
            os.remove(FAILED_CODES_FILE)
            print("[INFO] All schemes succeeded; failed codes file removed")


def load_failed_codes():
    if not os.path.exists(FAILED_CODES_FILE):
        return []
    with open(FAILED_CODES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def run_full():
    print("[INFO] FULL mode: processing all schemes and recreating main file")

    schemes = fetch_all_schemes()
    total = len(schemes)
    print(f"[INFO] Total schemes: {total}")

    backup_existing_final()

    with open(TEMP_JSON, "w", encoding="utf-8") as f:
        f.write("[\n")

    written = 0
    batch = []
    failed_codes = set()

    try:
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_code = {}

            for s in schemes:
                code = s.get("schemeCode")
                name = s.get("schemeName", "")
                if not code:
                    continue
                fut = executor.submit(fetch_scheme_details_with_retry, code, name)
                future_to_code[fut] = code

            total_tasks = len(future_to_code)

            for idx, future in enumerate(as_completed(future_to_code), start=1):
                code = future_to_code[future]
                details = future.result()
                if not details:
                    failed_codes.add(code)
                else:
                    batch.append(details)

                if len(batch) >= BATCH_SIZE or idx == total_tasks:
                    with open(TEMP_JSON, "a", encoding="utf-8") as f:
                        for i, rec in enumerate(batch):
                            if written > 0 or i > 0:
                                f.write(",\n")
                            json.dump(rec, f, ensure_ascii=False)
                            written += 1
                    print(f"[INFO] Written {written} scheme objects so far...")
                    batch.clear()
                    time.sleep(SLEEP_BETWEEN_CALLS)

        with open(TEMP_JSON, "a", encoding="utf-8") as f:
            f.write("\n]\n")

        # Save failed codes (single file)
        write_failed_codes(list(failed_codes))

        # Promote temp -> final
        if os.path.exists(FINAL_JSON):
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            extra_backup = os.path.join(DATA_DIR, f"all_scheme_full_details_extra_{ts}.json")
            print(f"[INFO] Extra backup of unexpected final file to {extra_backup}")
            os.rename(FINAL_JSON, extra_backup)

        os.rename(TEMP_JSON, FINAL_JSON)
        print(f"[INFO] Done. Final JSON written to {FINAL_JSON}")

    except Exception as e:
        print(f"[ERROR] Run failed: {e}")
        print(f"[INFO] Leaving temp file at {TEMP_JSON} for inspection.")
        raise


def append_batch_to_final(batch, appended_count):
    """Append a batch of scheme objects to existing FINAL_JSON (JSON array)."""
    if not batch:
        return appended_count

    with open(FINAL_JSON, "r+", encoding="utf-8") as f:
        f.seek(0, os.SEEK_END)
        pos = f.tell()

        # Find last non-whitespace char
        while pos > 0:
            pos -= 1
            f.seek(pos, os.SEEK_SET)
            ch = f.read(1)
            if not ch.isspace():
                break

        if ch != ']':
            raise RuntimeError("Unexpected JSON format in final file; expected array ending with ']'")

        # Truncate closing bracket
        f.seek(pos, os.SEEK_SET)
        f.truncate()

        # Check if there is at least one element already
        f.seek(0)
        content = f.read().strip()
        has_content = len(content) > 1  # at least '[' + something

        # Append new elements
        f.seek(0, os.SEEK_END)
        for i, rec in enumerate(batch):
            if has_content or i > 0 or appended_count > 0:
                f.write(",\n")
            json.dump(rec, f, ensure_ascii=False)
            appended_count += 1

        f.write("\n]\n")

    return appended_count


def run_retry():
    print("[INFO] RETRY mode: processing only failed scheme codes and appending to existing output")

    if not os.path.exists(FINAL_JSON):
        raise RuntimeError(f"Main output {FINAL_JSON} does not exist. Run in 'full' mode first.")

    failed_codes = load_failed_codes()
    if not failed_codes:
        print("[INFO] No failed codes found. Nothing to retry.")
        return

    print(f"[INFO] Retrying {len(failed_codes)} previously failed schemes")

    # Build code->name map from master list
    schemes = fetch_all_schemes()
    code_to_name = {s.get("schemeCode"): s.get("schemeName", "") for s in schemes}

    batch = []
    appended = 0
    still_failed = set(failed_codes)  # start with all; remove successes

    try:
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_code = {}

            for code in failed_codes:
                name = code_to_name.get(code, "")
                fut = executor.submit(fetch_scheme_details_with_retry, code, name)
                future_to_code[fut] = code

            total_tasks = len(future_to_code)

            for idx, future in enumerate(as_completed(future_to_code), start=1):
                code = future_to_code[future]
                details = future.result()
                if details:
                    batch.append(details)
                    # success: remove from still_failed
                    if code in still_failed:
                        still_failed.remove(code)

                if len(batch) >= BATCH_SIZE or idx == total_tasks:
                    appended = append_batch_to_final(batch, appended)
                    print(f"[INFO] Appended {appended} retried scheme objects so far...")
                    batch.clear()
                    time.sleep(SLEEP_BWEEN_CALLS)

        # Update failed codes file: only remaining failed
        write_failed_codes(list(still_failed))
        print("[INFO] Retry run completed")

    except Exception as e:
        print(f"[ERROR] Retry run failed: {e}")
        raise


def main():
    if len(sys.argv) < 2 or sys.argv[1].lower() not in ("full", "retry"):
        print("Usage: python get_scheme_details.py [full|retry]")
        sys.exit(1)

    mode = sys.argv[1].lower()
    if mode == "full":
        run_full()
    else:
        run_retry()


if __name__ == "__main__":
    main()
