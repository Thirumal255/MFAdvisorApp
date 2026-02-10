#!/usr/bin/env python3

import json
import logging
from sys import audit
import ijson
from datetime import datetime, timedelta
from pathlib import Path
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm


# ---------------------------------------------------------
# CONFIG
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"

PARENT_MASTER_FILE = DATA_DIR / "parent_masterlist.json"
FULL_NAV_FILE = DATA_DIR / "all_scheme_full_details.json"
OUTPUT_FILE = DATA_DIR / "parent_scheme_nav.json"

THREADS = 6   # ← Adjust based on CPU cores


# ---------------------------------------------------------
# Logging
# ---------------------------------------------------------

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

DATE_FMT = "%d-%m-%Y"


# ---------------------------------------------------------
# Canonical Audit
# ---------------------------------------------------------

def audit_and_load_canonical_codes():

    with open(PARENT_MASTER_FILE, "r", encoding="utf-8") as f:
        master = json.load(f)

    all_codes = [p.get("canonical_code") for p in master.values()]
    missing = [c for c in all_codes if not c]

    counts = Counter(all_codes)
    duplicates = [k for k,v in counts.items() if v>1 and k]

    usable = {str(c) for c in all_codes if c}

    return {
        "total": len(all_codes),
        "valid": len(all_codes) - len(missing),
        "missing": missing,
        "duplicates": duplicates,
        "usable": usable
    }


# ---------------------------------------------------------
# NAV Fill (Worker Task)
# ---------------------------------------------------------

def process_scheme(scheme):

    data = scheme.get("data", [])

    if not data:
        return scheme

    parsed = [
        (datetime.strptime(r["date"], DATE_FMT), r["nav"])
        for r in data
    ]
    parsed.sort(key=lambda x: x[0])

    filled = []
    cur_date, cur_nav = parsed[0]
    filled.append((cur_date, cur_nav))

    for next_date, next_nav in parsed[1:]:

        d = cur_date + timedelta(days=1)
        while d < next_date:
            filled.append((d, cur_nav))
            d += timedelta(days=1)

        filled.append((next_date, next_nav))
        cur_date, cur_nav = next_date, next_nav

    scheme["data"] = [
        {"date": d.strftime(DATE_FMT), "nav": nav}
        for d, nav in reversed(filled)
    ]

    return scheme


# ---------------------------------------------------------
# Main Processing
# ---------------------------------------------------------

def build_dataset():

    audit = audit_and_load_canonical_codes()
    canonical_codes = audit["usable"]

    found = set()
    failed = []
    duplicate_nav = []

    futures = []

    with ThreadPoolExecutor(max_workers=THREADS) as executor:
        with open(OUTPUT_FILE, "w", encoding="utf-8") as out:

            out.write("[\n")

            with open(FULL_NAV_FILE, "rb") as f:

                # Submit work
                for scheme in ijson.items(f, "item"):

                    code = str(scheme.get("meta", {}).get("scheme_code"))

                    if code not in canonical_codes:
                        continue

                    if code in found:
                        duplicate_nav.append(code)
                        continue

                    future = executor.submit(process_scheme, scheme)
                    futures.append((code, future))
                    found.add(code)

                # Collect results with progress bar
                first = True
                with tqdm(total=len(futures),
                          desc="Processing Parents",
                          unit="scheme") as bar:

                    for code, future in futures:
                        try:
                            scheme = future.result()

                            if not first:
                                out.write(",\n")

                            json.dump(scheme, out)
                            first = False

                        except Exception:
                            failed.append(code)

                        bar.update(1)

            out.write("\n]")


    not_found = canonical_codes - found

    # -----------------------------------------------------
    # SUMMARY
    # -----------------------------------------------------

    logger.info("\n---- Canonical Audit ----")
    logger.info(f"Total Parent Entries      : {audit['total']}")
    logger.info(f"Valid Canonicals          : {audit['valid']}")
    logger.info(f"Missing Canonicals        : {len(audit['missing'])}")
    logger.info(f"Duplicate Canonicals      : {len(audit['duplicates'])}")
    logger.info(f"Usable Canonicals         : {len(canonical_codes)}")

    # 🔹 Print Lists
    if audit['missing']:
        logger.info("\nMissing Canonical Codes:")
        logger.info(sorted(audit['missing']))

    if audit['duplicates']:
        logger.info("\nDuplicate Canonical Codes:")
        logger.info(sorted(audit['duplicates']))


    logger.info("\n---- Processing ----")
    logger.info(f"Written Successfully      : {len(found)}")
    logger.info(f"Not Found In NAV          : {len(not_found)}")
    logger.info(f"Failed Processing         : {len(failed)}")
    logger.info(f"Duplicate In NAV          : {len(duplicate_nav)}")

    # 🔹 Print Lists
    if not_found:
        logger.info("\nParents NOT found in NAV dataset:")
        logger.info(sorted(not_found))

    if failed:
        logger.info("\nProcessing Failures:")
        logger.info(sorted(failed))

    if duplicate_nav:
        logger.info("\nDuplicate NAV Entries Encountered:")
        logger.info(sorted(duplicate_nav))



# ---------------------------------------------------------
# Entry
# ---------------------------------------------------------

if __name__ == "__main__":
    build_dataset()
