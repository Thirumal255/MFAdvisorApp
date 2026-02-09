import json
import logging
from pathlib import Path
from app.metrics import compute_metrics_for_nav
from mftool import Mftool
import pandas as pd

# ---------------------------------------------------
# Paths
# ---------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

MASTER_FILE = BASE_DIR / "data" / "parent_masterlist.json"
SUMMARY_DIR = BASE_DIR / "data" / "scheme_summary_extract"
OUTPUT_FILE = BASE_DIR / "data" / "scheme_metrics_merged.json"

# ---------------------------------------------------
# Logging
# ---------------------------------------------------

logger = logging.getLogger("mf_advisor.scheme_metrics")
logger.setLevel(logging.INFO)

if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)

# ---------------------------------------------------
# Core
# ---------------------------------------------------

def load_summary_json(parent_name):
    file_name = f"SUMMARY_{parent_name}.json"
    file_path = SUMMARY_DIR / file_name

    if not file_path.exists():
        logger.warning("Summary JSON not found for %s", parent_name)
        return {}

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    return data.get("data", {})


def build_all_scheme_metrics():
    mf = Mftool()

    with open(MASTER_FILE, "r", encoding="utf-8") as f:
        master = json.load(f)

    output = {}

    for parent, data in master.items():
        canonical_code = data.get("canonical_code")
        variants = data.get("variants", [])

        if not canonical_code:
            logger.warning("Skipping %s (no canonical code)", parent)
            continue

        try:
            # ---------------- NAV ----------------

            nav_data = mf.get_scheme_historical_nav(canonical_code)

            if not nav_data or "data" not in nav_data:
                logger.warning("No NAV for %s", parent)
                continue

            scheme_start_date = None
            if isinstance(nav_data.get("scheme_start_date"), dict):
                scheme_start_date = nav_data["scheme_start_date"].get("date")

            nav_records = [
                {
                    "date": row["date"],
                    "nav": float(row["nav"])
                }
                for row in nav_data["data"]
                if row.get("nav")
            ]

            if len(nav_records) < 50:
                logger.warning("Too little NAV data for %s", parent)
                continue

            nav_df = pd.DataFrame(nav_records)
            metrics = compute_metrics_for_nav(nav_df)

            # ---------------- SUMMARY ----------------

            summary = load_summary_json(parent)

            merged = {
                "parent_scheme_name": parent,
                "canonical_code": canonical_code,
                "scheme_start_date": scheme_start_date,
                "variants": variants,
                "fund_type": summary.get("fund_type"),
                "riskometer": summary.get("riskometer"),
                "investment_objective": summary.get("investment_objective"),
                "asset_allocation": summary.get("asset_allocation"),
                "benchmark": summary.get("benchmark"),
                "fund_managers": summary.get("fund_managers"),
                "annual_expense": summary.get("annual_expense"),
                "exit_load": summary.get("exit_load"),
                "isins": summary.get("isins"),
                "metrics": metrics
            }

            output[parent] = merged

            logger.info("Computed & merged | %s | %s", parent, canonical_code)

        except Exception as e:
            logger.error("Failed metrics for %s", parent)
            logger.error(str(e))

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    logger.info("Saved merged scheme file → %s", OUTPUT_FILE)

# ---------------------------------------------------
# Entry
# ---------------------------------------------------

if __name__ == "__main__":
    build_all_scheme_metrics()
