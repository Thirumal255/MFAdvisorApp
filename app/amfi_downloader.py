import os
import time
import json
import requests
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_URL = "https://www.amfiindia.com/otherdata/scheme-details"

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"

SID_DIR = DATA_DIR / "sid_pdfs"
SUMMARY_DIR = DATA_DIR / "summary_pdfs"
LOG_FILE = DATA_DIR / "amfi_downloader_errors.log"

AMC_FUNDS_JSON = DATA_DIR / "amc_funds.json"
AMC_SUMMARY_JSON = DATA_DIR / "amc_summary.json"
FAILURES_JSON = DATA_DIR / "amfi_failures.json"

os.makedirs(SID_DIR, exist_ok=True)
os.makedirs(SUMMARY_DIR, exist_ok=True)

RETRY_MODE = "--retry" in sys.argv


# ---------------- Logging ----------------

def log_error(msg):
    print("[ERROR]", msg)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(msg + "\n")


# ---------------- Utils ----------------

def safe_filename(name: str) -> str:
    return (
        name.replace("/", "-")
        .replace("\\", "-")
        .replace(":", "-")
        .replace("*", "")
        .replace("?", "")
        .replace("\"", "")
        .replace("<", "")
        .replace(">", "")
        .replace("|", "")
        .strip()
    )


def reveal_all_options(page):
    seen = set()
    stable_rounds = 0

    while stable_rounds < 25:
        options = page.query_selector_all("li[role='option']")
        current = set(o.inner_text().strip() for o in options)

        before = len(seen)
        seen |= current

        if len(seen) == before:
            stable_rounds += 1
        else:
            stable_rounds = 0

        page.keyboard.press("ArrowDown")
        page.wait_for_timeout(80)

    return list(seen)


# ---------------- Downloads ----------------

def download_pdf(url, path):
    if path.exists():
        return True

    try:
        r = requests.get(
            url,
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=60
        )
        r.raise_for_status()

        with open(path, "wb") as f:
            f.write(r.content)

        print("Saved:", path.name)
        return True

    except Exception as e:
        log_error(f"Download failed: {url} | {e}")
        return False


# ---------------- State ----------------

def load_existing_state():
    if AMC_FUNDS_JSON.exists():
        with open(AMC_FUNDS_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)
        total = sum(len(v) for v in data.values())
        return data, total
    return {}, 0


def load_completed_amcs():
    if not AMC_SUMMARY_JSON.exists():
        return set()

    try:
        with open(AMC_SUMMARY_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)
        return set(data.get("by_amc", {}).keys())
    except:
        return set()


def dump_amc_progress(amc_funds_map, total_funds):
    with open(AMC_FUNDS_JSON, "w", encoding="utf-8") as f:
        json.dump(amc_funds_map, f, indent=2, ensure_ascii=False)

    amc_summary = {
        "total_amcs": len(amc_funds_map),
        "total_funds": total_funds,
        "by_amc": {k: len(v) for k, v in amc_funds_map.items()}
    }

    with open(AMC_SUMMARY_JSON, "w", encoding="utf-8") as f:
        json.dump(amc_summary, f, indent=2, ensure_ascii=False)


# ---------------- Failures ----------------

def load_failures():
    if not FAILURES_JSON.exists():
        return {}
    with open(FAILURES_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


def record_failure(amc, scheme):
    failures = load_failures()
    failures.setdefault(amc, [])
    if scheme not in failures[amc]:
        failures[amc].append(scheme)

    with open(FAILURES_JSON, "w", encoding="utf-8") as f:
        json.dump(failures, f, indent=2)


def remove_failure(amc, scheme):
    failures = load_failures()
    if amc in failures and scheme in failures[amc]:
        failures[amc].remove(scheme)
        if not failures[amc]:
            del failures[amc]

    with open(FAILURES_JSON, "w", encoding="utf-8") as f:
        json.dump(failures, f, indent=2)


# ---------------- Main ----------------

def main():
    amc_funds_map, total_funds = load_existing_state()
    completed_amcs = load_completed_amcs()
    failures = load_failures()

    print("[MODE]", "RETRY" if RETRY_MODE else "NORMAL")
    print("[STATE] Completed AMCs:", len(completed_amcs))
    print("[STATE] Pending failures:", sum(len(v) for v in failures.values()))

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(BASE_URL)
        page.wait_for_timeout(3000)

        # Load AMC list
        inputs = page.query_selector_all("input.MuiAutocomplete-input")
        mf_input = inputs[0]
        mf_input.click()
        page.keyboard.press("ArrowDown")
        page.wait_for_selector("li[role='option']")
        amc_list = reveal_all_options(page)
        page.keyboard.press("Escape")

        for amc in amc_list:

            if not RETRY_MODE and amc in completed_amcs:
                print("[RESUME] Skipping already completed AMC:", amc)
                continue

            if RETRY_MODE and amc not in failures:
                continue

            print("\n=== AMC:", amc, "===")
            amc_funds_map.setdefault(amc, [])
            mf_input = page.locator("input[placeholder='Select Mutual Fund']")
            mf_input.fill("")        
            mf_input.type(amc, delay=40)
            page.keyboard.press("ArrowDown")
            page.keyboard.press("Enter")
            page.wait_for_timeout(1200)

            # Load scheme list
            inputs = page.query_selector_all("input.MuiAutocomplete-input")
            scheme_input = inputs[1]
            scheme_input.click()
            page.keyboard.press("ArrowDown")
            page.wait_for_selector("li[role='option']", timeout=15000)
            scheme_list = reveal_all_options(page)
            page.keyboard.press("Escape")

            print("Schemes:", len(scheme_list))

            for scheme in scheme_list:

                if RETRY_MODE and scheme not in failures.get(amc, []):
                    continue

                scheme_clean = safe_filename(scheme)

                scheme_input.fill("")
                scheme_input.type(scheme, delay=30)
                page.keyboard.press("ArrowDown")
                page.keyboard.press("Enter")
                page.wait_for_timeout(800)

                go_button = page.locator("button:has-text('Go')")

                if go_button.count() == 0:
                    msg = f"[SKIP] GO button not found: {amc} | {scheme}"
                    print(msg)
                    log_error(msg)
                    record_failure(amc, scheme)
                    continue

                page.wait_for_timeout(3000)

                if go_button.is_disabled():
                    msg = f"[SKIP] GO button disabled: {amc} | {scheme}"
                    print(msg)
                    log_error(msg)
                    record_failure(amc, scheme)
                    continue

                go_button.click()
                page.wait_for_timeout(2000)

                page_text = page.inner_text("body").lower()
                is_open_ended = "open ended" in page_text

                print(f"[INFO] Processing scheme: {scheme} | Open Ended = {is_open_ended}")

                if not is_open_ended:
                    msg = f"[SKIP] Not Open Ended, skipping: {amc} | {scheme}"
                    print(msg)
                    log_error(msg)
                    continue

                links = page.query_selector_all("a")
                sid_path = SID_DIR / f"SID_{scheme_clean}.pdf"
                summary_path = SUMMARY_DIR / f"SUMMARY_{scheme_clean}.pdf"

                sid_ok = False
                summary_ok = False

                for link in links:
                    text = link.inner_text().lower()
                    href = link.get_attribute("href")
                    if not href:
                        continue

                    if "scheme information" in text:
                        sid_ok = download_pdf(href, sid_path)

                    if "summary document" in text and "pdf" in href.lower():
                        summary_ok = download_pdf(href, summary_path)

                if sid_ok and summary_ok:
                    amc_funds_map[amc].append(scheme)
                    total_funds += 1
                    remove_failure(amc, scheme)
                    print(f"[OK] Downloaded: {amc} | {scheme}")
                else:
                    msg = f"[ERROR] Missing docs: {amc} | {scheme} | SID={sid_ok} SUMMARY={summary_ok}"
                    print(msg)
                    log_error(msg)
                    record_failure(amc, scheme)

            dump_amc_progress(amc_funds_map, total_funds)
            print(f"[JSON] Progress saved after AMC: {amc}")

        browser.close()

    dump_amc_progress(amc_funds_map, total_funds)

    print("\nDONE.")
    print("AMC map written to:", AMC_FUNDS_JSON)
    print("AMC summary written to:", AMC_SUMMARY_JSON)
    print("Failures file:", FAILURES_JSON)


if __name__ == "__main__":
    main()
