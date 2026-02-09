import json
import logging
from pathlib import Path
import re
from mftool import Mftool

# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]
SUMMARY_JSON_DIR = BASE_DIR / "data" / "scheme_summary_extract"
OUTPUT_FILE = BASE_DIR / "data" / "parent_masterlist.json"

# ---------------------------------------------------------
# Logging
# ---------------------------------------------------------

logger = logging.getLogger("mf_advisor.masterlist")
logger.setLevel(logging.INFO)

if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)

# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------

def classify_variant_from_name(name: str):
    name_l = name.lower()

    # PLAN
    if "direct" in name_l:
        plan = "Direct"
    elif "regular" in name_l:
        plan = "Regular"
    else:
        plan = "Unknown"

    # OPTION (robust IDCW detection)
    idcw_keywords = [
        "idcw",
        "dividend",
        "income distribution",
        "income payout",
        "monthly income",
        "quarterly income",
        "capital withdrawal"
    ]

    if any(k in name_l for k in idcw_keywords):
        option = "IDCW"
    else:
        option = "Growth"

    return f"{plan} {option}".strip()


def select_canonical_code(variants):
    """
    Rules:
    1. Prefer Direct Growth
    2. Else if only one variant → that
    3. Else return None
    """
    for v in variants:
        temp_label = classify_variant_from_name(v["scheme_name"])
        if temp_label.lower() == "direct growth":
            return v["amfi_code"]

    if len(variants) == 1:
        return variants[0]["amfi_code"]

    return None

# ---------------------------------------------------------
# Core Builder
# ---------------------------------------------------------

def build_parent_masterlist():
    mf = Mftool()

    master = {}

    files = sorted(SUMMARY_JSON_DIR.glob("*.json"))
    logger.info("Found %d summary files", len(files))

    for file in files:
        with open(file, "r", encoding="utf-8") as f:
            data = json.load(f)

        parent = data.get("parent_scheme_name")
        raw_amfi_list = data.get("data", {}).get("amfi_codes", [])

        # 1) FILTER NULL / EMPTY AMFI
        amfi_list = [a for a in raw_amfi_list if a and str(a).strip()]

        if not parent or not amfi_list:
            logger.warning("Skipping %s (missing parent or valid amfi)", file.name)
            continue

        if parent not in master:
            master[parent] = {
                "parent_scheme_name": parent,
                "canonical_code": None,
                "variants": []
            }

        for amfi in amfi_list:
            try:
                details = mf.get_scheme_details(amfi)
                scheme_name = details.get("scheme_name")

                if not scheme_name:
                    logger.warning("AMFI %s returned empty scheme name", amfi)
                    continue

                variant_record = {
                    "scheme_name": scheme_name,
                    "amfi_code": amfi
                }

                master[parent]["variants"].append(variant_record)

                logger.info(
                    "Resolved | %s | %s | %s",
                    parent,
                    amfi,
                    scheme_name
                )

            except Exception as e:
                logger.error("Failed resolving AMFI %s", amfi)
                logger.error(str(e))

    # -------------------------------------------------
    # Deduplicate + set canonical_code
    # -------------------------------------------------

    for parent in master:
        seen = set()
        unique = []
        for v in master[parent]["variants"]:
            if v["amfi_code"] not in seen:
                seen.add(v["amfi_code"])
                unique.append(v)

        master[parent]["variants"] = unique

        canonical = select_canonical_code(unique)
        master[parent]["canonical_code"] = canonical

        logger.info(
            "Canonical selected | %s | %s",
            parent,
            canonical
        )

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(master, f, indent=2, ensure_ascii=False)

    logger.info("Saved master list → %s", OUTPUT_FILE)

# ---------------------------------------------------------
# Entry
# ---------------------------------------------------------

if __name__ == "__main__":
    build_parent_masterlist()
