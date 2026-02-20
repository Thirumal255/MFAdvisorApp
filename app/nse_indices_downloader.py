import os
import json
import time
import random
import requests
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

# ============================================================
# CONFIG
# ============================================================
BASE = Path("./data")
CACHE = BASE / "nse_cache"
FINAL_JSON = BASE / "nse_indices.json"
PROGRESS_FILE = BASE / "nse_progress.json"

CACHE.mkdir(parents=True, exist_ok=True)
BASE.mkdir(exist_ok=True)

WORKERS = 8          # faster but still safe
RETRIES = 3

TODAY = datetime.today()
TODAY_STR = TODAY.strftime("%Y-%m-%d")

# ============================================================
# SESSION (KEEPING YOUR WORKING LOGIC)
# ============================================================
def create_session():
    s = requests.Session()

    s.headers.update({
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
        "Referer": "https://www.nseindia.com/",
        "Origin": "https://www.nseindia.com",
        "Connection": "keep-alive"
    })

    for _ in range(3):
        try:
            s.get("https://www.nseindia.com/api/quote-equity?symbol=INFY", timeout=20)
            return s
        except:
            time.sleep(2)

    raise RuntimeError("NSE session bootstrap failed")

# ============================================================
# GET INDEX LIST
# ============================================================
def get_indices():
    s = create_session()
    r = s.get("https://www.nseindia.com/api/allIndices", timeout=30)
    js = r.json()
    return sorted(set(i["index"] for i in js["data"]))

# ============================================================
# FETCH BLOCK
# ============================================================
def fetch_block(session, index, start, end):

    url = "https://www.nseindia.com/api/historicalOR/indicesHistory"

    params = {
        "indexType": index,
        "from": start.strftime("%d-%m-%Y"),
        "to": end.strftime("%d-%m-%Y"),
    }

    for _ in range(RETRIES):
        try:
            r = session.get(url, params=params, timeout=30)
            if r.status_code == 200:
                return r.json().get("data", [])
        except:
            time.sleep(1)

    return []

# ============================================================
# CONVERT ROWS
# ============================================================
def convert_rows(rows):

    df = pd.DataFrame(rows)

    df = df.rename(columns={
        "EOD_TIMESTAMP": "Date",
        "EOD_OPEN_INDEX_VAL": "Open",
        "EOD_HIGH_INDEX_VAL": "High",
        "EOD_LOW_INDEX_VAL": "Low",
        "EOD_CLOSE_INDEX_VAL": "Close"
    })

    df = df[["Date", "Open", "High", "Low", "Close"]]
    df["Date"] = pd.to_datetime(df["Date"], format="%d-%b-%Y")

    return df

# ============================================================
# CACHE
# ============================================================
def cache_file(index):
    return CACHE / f"{index.replace(' ', '_').replace('/', '_')}.json"

def load_cache(index):
    f = cache_file(index)
    if not f.exists():
        return None
    return json.loads(f.read_text())

def save_cache(index, obj):
    cache_file(index).write_text(json.dumps(obj, indent=2))

# ============================================================
# PROGRESS SAVE / LOAD (CRASH RESUME)
# ============================================================
def load_progress():
    if PROGRESS_FILE.exists():
        return set(json.loads(PROGRESS_FILE.read_text()))
    return set()

def save_progress(done):
    PROGRESS_FILE.write_text(json.dumps(sorted(done)))

# ============================================================
# FETCH INDEX
# ============================================================
def fetch_index(session, index):

    print(f"[LOG] Processing {index}")
    cache = load_cache(index)

    # ------------------------------
    # INCREMENTAL UPDATE
    # ------------------------------
    if cache:

        last_date = pd.to_datetime(cache["data"][-1]["Date"], format="%d-%B-%Y")
        start = last_date - timedelta(days=5)
        end = TODAY

        rows = fetch_block(session, index, start, end)

        if not rows:
            print(f"[LOG] No update needed: {index}")
            return cache

        df_old = pd.DataFrame(cache["data"])
        df_old["Date"] = pd.to_datetime(df_old["Date"], format="%d-%B-%Y")

        df_new = convert_rows(rows)

        df = pd.concat([df_old, df_new])

    # ------------------------------
    # FULL DOWNLOAD
    # ------------------------------
    else:

        print(f"[LOG] Full fetch: {index}")

        end = TODAY
        start = end - timedelta(days=60)

        rows = []

        while True:
            block = fetch_block(session, index, start, end)
            if not block:
                break

            rows.extend(block)

            end = start - timedelta(days=1)
            start = end - timedelta(days=60)

            time.sleep(random.uniform(0.2, 0.6))

        if not rows:
            print(f"[LOG] Skipped: {index}")
            return None

        df = convert_rows(rows)

    # ------------------------------
    # FIX DUPLICATE DATE CRASH
    # ------------------------------
    df = df.drop_duplicates("Date")

    # ------------------------------
    # FILL MISSING DATES
    # ------------------------------
    df = df.sort_values("Date")

    full = pd.date_range(df["Date"].min(), df["Date"].max())
    df = (
        df.set_index("Date")
        .reindex(full)
        .ffill()
        .reset_index()
        .rename(columns={"index": "Date"})
    )

    df["Date"] = df["Date"].dt.strftime("%d-%B-%Y")

    obj = {
        "code": index,
        "index_name": index,
        "last_updated": TODAY_STR,
        "data": df.to_dict("records")
    }

    save_cache(index, obj)
    print(f"[LOG] Done: {index} ({len(df)} rows)")
    return obj

# ============================================================
# MERGE FINAL
# ============================================================
def merge_final():

    all_data = []

    for f in CACHE.glob("*.json"):
        all_data.append(json.loads(f.read_text()))

    FINAL_JSON.write_text(json.dumps(all_data, indent=2))

# ============================================================
# MAIN
# ============================================================
def main():

    print("=== NSE PRODUCTION DOWNLOADER ===\n")

    indices = get_indices()
    print(f"[LOG] Found {len(indices)} indices\n")

    done = load_progress()
    total = len(indices)

    sessions = [create_session() for _ in range(WORKERS)]

    start_time = time.time()
    processed = 0

    with ThreadPoolExecutor(max_workers=WORKERS) as ex:

        futures = {}

        for i, idx in enumerate(indices):
            if idx in done:
                continue
            futures[ex.submit(fetch_index, sessions[i % WORKERS], idx)] = idx

        for f in as_completed(futures):
            idx = futures[f]

            try:
                res = f.result()
                if res:
                    done.add(idx)
                    save_progress(done)
            except Exception as e:
                print(f"[ERROR] {idx}: {e}")

            processed += 1

            # ETA
            elapsed = time.time() - start_time
            rate = processed / elapsed if elapsed else 0
            remain = total - len(done)
            eta = remain / rate if rate else 0

            print(f"[PROGRESS] {len(done)}/{total} | ETA: {int(eta)}s")

    merge_final()

    print("\n========== SUMMARY ==========")
    print(f"Total indices   : {total}")
    print(f"Processed       : {len(done)}")
    print(f"JSON output     : {FINAL_JSON}")
    print("================================\n")

if __name__ == "__main__":
    main()
