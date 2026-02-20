import os
import re
import csv
import json
import time
import argparse
import requests
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_DIR = "./data"
CSV_DIR = os.path.join(BASE_DIR, "bse_indices_csv")
JSON_FILE = os.path.join(BASE_DIR, "bse_indices.json")
PROGRESS_FILE = os.path.join(BASE_DIR, "bse_progress.json")

FROM_DATE = "01/01/2010"
TO_DATE = datetime.today().strftime("%d/%m/%Y")

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://www.bseindia.com/",
    "Origin": "https://www.bseindia.com"
}

os.makedirs(CSV_DIR, exist_ok=True)
os.makedirs(BASE_DIR, exist_ok=True)


# ==============================
# Load progress
# ==============================
def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return set(json.load(f))
    return set()


def save_progress(done):
    with open(PROGRESS_FILE, "w") as f:
        json.dump(sorted(done), f)


# ==============================
# Fetch index list
# ==============================
def get_indices():

    url = "https://api.bseindia.com/BseIndiaAPI/api/FillddlIndex/w?fmdt=&todt="
    r = requests.get(url, headers=HEADERS, timeout=30)

    try:
        data = r.json()
        table = data.get("Table", [])
        return [(i["Indx_cd"], i["shortalias"]) for i in table]
    except:
        text = r.text
        matches = re.findall(r'"Indx_cd":"(.*?)".*?"shortalias":"(.*?)"', text)
        return matches


# ==============================
# Download CSV
# ==============================
def download_csv(code, name, retries=3):

    safe_name = name.replace(" ", "_").replace("/", "_")
    path = os.path.join(CSV_DIR, f"{safe_name}.csv")

    if os.path.exists(path):
        return True

    url = (
        "https://api.bseindia.com/BseIndiaAPI/api/ProduceCSVForDate/w"
        f"?strIndex={code}&dtFromDate={FROM_DATE}&dtToDate={TO_DATE}"
    )

    for attempt in range(1, retries+1):
        try:
            r = requests.get(url, headers=HEADERS, timeout=60)

            if "Date" in r.text:
                with open(path, "w", encoding="utf-8", newline="") as f:
                    f.write(r.text)
                print(f"[LOG] Saved: {safe_name}.csv")
                return True

        except Exception:
            pass

        time.sleep(1 + attempt)

    print(f"[LOG] Failed: {name}")
    return False


# ==============================
# Date parser
# ==============================
def parse_date(s):

    s = s.strip()

    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y"):
        try:
            return datetime.strptime(s, fmt)
        except:
            pass

    month_map = {
        "january":1,"february":2,"march":3,"april":4,
        "may":5,"june":6,"july":7,"august":8,
        "september":9,"october":10,"november":11,"december":12
    }

    parts = re.split(r"[-\s]", s)

    if len(parts) == 3:
        d, m, y = parts
        m = m.lower()
        if m in month_map:
            try:
                return datetime(int(y), month_map[m], int(d))
            except:
                pass

    return None


# ==============================
# Fill missing dates safely
# ==============================
def fill_missing_dates(rows):

    if not rows:
        return rows

    date_key = [k for k in rows[0] if "date" in k.lower()][0]

    parsed = {}

    for r in rows:
        d = parse_date(r[date_key])
        if d:
            parsed[d] = r

    if not parsed:
        return rows

    # Remove duplicates + sort
    parsed = dict(sorted(parsed.items()))

    start = min(parsed.keys())
    end = max(parsed.keys())

    filled = []
    prev = None
    cur = start

    while cur <= end:

        if cur in parsed:
            row = parsed[cur]
            prev = row
        else:
            if prev is None:
                cur += timedelta(days=1)
                continue
            row = prev.copy()
            row[date_key] = f"{cur.day}-{cur.strftime('%B')}-{cur.year}"

        filled.append(row)
        cur += timedelta(days=1)

    return filled


# ==============================
# Merge CSV → JSON (atomic write)
# ==============================
def merge_csv_to_json():

    merged = []

    for file in os.listdir(CSV_DIR):

        if not file.endswith(".csv"):
            continue

        path = os.path.join(CSV_DIR, file)
        index_name = file.replace(".csv","").replace("_"," ")

        with open(path, encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        rows = fill_missing_dates(rows)

        merged.append({
            "code": index_name,
            "index_name": index_name,
            "data": rows
        })

    tmp = JSON_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(merged, f, indent=2)

    os.replace(tmp, JSON_FILE)
    print(f"[LOG] JSON saved → {JSON_FILE}")


# ==============================
# MAIN
# ==============================
def main():

    parser = argparse.ArgumentParser()
    parser.add_argument("--workers", type=int, default=8)
    args = parser.parse_args()

    print("=== BSE INDEX DOWNLOADER STARTED ===")

    indices = get_indices()
    total = len(indices)

    done = load_progress()
    remaining = [(c,n) for c,n in indices if n not in done]

    print(f"[LOG] Total indices: {total}")
    print(f"[LOG] Remaining: {len(remaining)}")

    start_time = time.time()

    with ThreadPoolExecutor(max_workers=args.workers) as ex:

        futures = {
            ex.submit(download_csv, code, name): (code, name)
            for code, name in remaining
        }

        for i, f in enumerate(as_completed(futures), 1):
            code, name = futures[f]

            if f.result():
                done.add(name)
                save_progress(done)

            # ETA
            elapsed = time.time() - start_time
            speed = i / elapsed if elapsed else 0
            remaining_jobs = len(remaining) - i
            eta = remaining_jobs / speed if speed else 0

            print(f"[PROGRESS] {i}/{len(remaining)} | ETA {int(eta)}s")

    print("[LOG] Download phase complete")

    merge_csv_to_json()

    print("\n========== SUMMARY ==========")
    print(f"Total indices   : {total}")
    print(f"Completed       : {len(done)}")
    print(f"JSON output     : {JSON_FILE}")
    print("================================")


if __name__ == "__main__":
    main()
