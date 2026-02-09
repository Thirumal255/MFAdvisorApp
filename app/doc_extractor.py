import json
import logging
from pathlib import Path
from typing import Dict, Any
import traceback
import re
from datetime import datetime, timezone

from pypdf import PdfReader
from app.openai_client import OpenAIClient

# -------------------------------------------------------------------
# Paths & Configuration
# -------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_SUMMARY_PDF_DIR = BASE_DIR / "data" / "summary_scheme_pdf"
OUTPUT_SUMMARY_DIR = BASE_DIR / "data" / "scheme_summary_extract"

OUTPUT_SUMMARY_DIR.mkdir(parents=True, exist_ok=True)

MAX_DOC_CHARS = 12000

# -------------------------------------------------------------------
# Logging
# -------------------------------------------------------------------

logger = logging.getLogger("mf_advisor.doc_extractor")
logger.setLevel(logging.INFO)

if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)

# -------------------------------------------------------------------
# Safe JSON loader
# -------------------------------------------------------------------

def safe_json_loads(text: str) -> Dict[str, Any]:
    text = text.strip()
    if "{" in text and "}" in text:
        text = text[text.find("{"): text.rfind("}") + 1]
    try:
        return json.loads(text)
    except Exception:
        logger.error("Unparseable LLM output:\n%s", text)
        raise


def normalize_annual_expense(value):
    if value is None:
        return {}

    if isinstance(value, dict):
        out = {}
        for k, v in value.items():
            if isinstance(v, str):
                num = re.findall(r"\d+\.?\d*", v)
                if num:
                    out[k.title()] = num[0]
        return out

    if isinstance(value, str):
        pairs = re.findall(r"(Regular|Direct|Retail)\s*[:\-]?\s*(\d+\.?\d*)", value, re.IGNORECASE)
        return {k.title(): v for k, v in pairs}

    return {}

# -------------------------------------------------------------------
# FUND OPTION NORMALIZATION (existing)
# -------------------------------------------------------------------

def normalize_fund_options(value):
    
    if isinstance(value, list):
        logger.info("Fund options already structured from LLM: %s", value)
        return value
    
    if not value or not isinstance(value, str):
        return []

    text = value.replace("IDCWPayout", "IDCW Payout")

    has_regular = bool(re.search(r"\bRegular\b", text, re.IGNORECASE))
    has_direct = bool(re.search(r"\bDirect\b", text, re.IGNORECASE))

    if has_regular or has_direct:
        pattern = r"(Regular|Direct)\s+Plan\s*-\s*(Growth|IDCW Payout|IDCW Reinvestment)"
        matches = re.findall(pattern, text, flags=re.IGNORECASE)
        options = [f"{p.title()} Plan - {o}" for p, o in matches]
        logger.info("Normalized fund options (explicit): %s", options)
        return options

    base_options = re.findall(
        r"(Growth Option|Growth|Payout of IDCW|IDCW Payout|IDCW Reinvestment)",
        text,
        flags=re.IGNORECASE
    )

    base_options = list(dict.fromkeys([o.title() for o in base_options]))

    expanded = []
    for opt in base_options:
        expanded.append(f"Regular {opt}")
        expanded.append(f"Direct {opt}")

    logger.info("Normalized fund options (inferred): %s", expanded)
    return expanded

# -------------------------------------------------------------------
# NEW: Extract variants from ISIN text (ADDITIVE)
# -------------------------------------------------------------------

def extract_from_isin_block(full_text: str):
    """
    Extract variants, ISINs, AMFI from ISIN section itself.
    Works for Aditya & Canara patterns.
    """
    match = re.search(r"ISINs(.*?)(AMFI|SEBI|Minimum|$)", full_text, re.DOTALL | re.IGNORECASE)
    if not match:
        return [], [], []

    block = match.group(1)

    # variants
    var_pattern = r"(Regular|Direct|Retail)[^\n]*?(Growth|IDCW|Monthly IDCW|Quarterly IDCW|IDCW Reinvestment)"
    variants = re.findall(var_pattern, block, flags=re.IGNORECASE)
    variants = [f"{p.title()} {o.title()}" for p, o in variants]
    variants = list(dict.fromkeys(variants))

    # ISINs from same block
    isins = re.findall(r"\bINF[A-Z0-9]{9}\b", block)

    # AMFI from following block
    amfi_match = re.search(r"AMFI Codes(.*?)(SEBI|Minimum|$)", full_text, re.DOTALL | re.IGNORECASE)
    amfi_block = amfi_match.group(1) if amfi_match else ""
    amfi = re.findall(r"\b\d{6}\b", amfi_block)

    if variants:
        logger.info("Extracted from ISIN block → Variants:%s ISIN:%s AMFI:%s",
                    variants, isins, amfi)

    return variants, isins, amfi


# -------------------------------------------------------------------
# Prompt
# -------------------------------------------------------------------

SUMMARY_EXTRACTION_PROMPT = """
You are a financial document extraction engine for Indian Mutual Funds.

Your job is to extract structured data from the SUMMARY PDF.

Follow these strict rules in order:

--------------------------------------------------
FUND VARIANTS, ISIN, AMFI (MOST IMPORTANT)
--------------------------------------------------

1. FIRST check the ISIN / AMFI section.

   If variant names are present there (for example:
   "Direct Plan-Growth INFxxxx" or
   "Regular - Monthly IDCW 119xxx"),

   then extract:
     - fund_options
     - isins
     - amfi_codes

   ONLY from that same section.

   Do NOT use the Option Names table in this case.
   Do NOT mix sources.

2. If ISIN / AMFI section contains only codes
   (no variant names, only INFxxxx / 6-digit numbers),

   then extract fund_options from the Option Names table.

3. If Option Names table is scope-based
   (for example "Option Names (Regular & Direct)" with base options),

   then return only the base options exactly as written.
   Do NOT invent variants.

4. If neither ISIN nor Option Names contain variant information,
   return null for fund_options, isins, amfi_codes.

--------------------------------------------------
OUTPUT RULES FOR VARIANTS
--------------------------------------------------

- fund_options must always be a LIST of full variant names
  (e.g. "Direct Monthly IDCW", "Regular Growth").

- isins must be a LIST aligned in the same order as fund_options.

- amfi_codes must be a LIST aligned in the same order as fund_options.

- Never mix sources for these three fields.

--------------------------------------------------
ANNUAL EXPENSE RULE
--------------------------------------------------

- annual_expense must be returned as:
  {
    "Regular": "number",
    "Direct": "number",
    "Retail": "number"
  }

- Strip % symbol.
- Return only numeric strings.
- Do not include any text.

--------------------------------------------------
RISKOMETER RULE (VERY IMPORTANT)
--------------------------------------------------

- If multiple riskometers are present,
  always select the one that contains:
    "As on"
    "As on Date"
    or an explicit date like "As on 31-Dec-2024".

- Ignore any riskometer labelled:
  "At the time of Launch".

- Return only the current applicable riskometer.

--------------------------------------------------
ETF/Index RULES
--------------------------------------------------


ETF rule:
- If fund_type is ETF or Exchange Traded Fund or FoF ETF:
    fund_options must be exactly ["Growth"].
    Do NOT include Regular or Direct.
    Do NOT include IDCW or dividend variants.

Index Fund rule:
- If fund_type is Index Fund (but not ETF):
    treat it like a normal mutual fund.
    It may have Regular/Direct and Growth/IDCW variants.

ETF expense rule:
- If fund_type is ETF or Exchange Traded Fund or FoF ETF:
    annual_expense must be returned under "Direct".
    Do NOT use "Regular".


--------------------------------------------------
GENERAL RULES
--------------------------------------------------

- Preserve original ordering of variants.
- Do not hallucinate or infer data.
- If a field is not found, return null.
- Return STRICT JSON only (no explanation text).

--------------------------------------------------
FIELDS TO EXTRACT
--------------------------------------------------

- fund_name
- fund_type
- fund_options
- riskometer
- investment_objective
- asset_allocation
- benchmark
- fund_managers
- annual_expense
- exit_load
- amfi_codes
- isins
"""

# -------------------------------------------------------------------
# PDF Utilities
# -------------------------------------------------------------------

def extract_pdf_text(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    text = []
    for page in reader.pages:
        try:
            t = page.extract_text()
            if t:
                text.append(t)
        except Exception:
            pass
    return "\n".join(text)

# -------------------------------------------------------------------
# Regex fallback extractors
# -------------------------------------------------------------------

def extract_amfi_from_text(text: str):
    codes = sorted(set(re.findall(r"\b\d{6}\b", text)))
    return codes if codes else []

def extract_isin_from_text(text: str):
    codes = sorted(set(re.findall(r"\bINF[A-Z0-9]{9}\b", text)))
    return codes if codes else []

# -------------------------------------------------------------------
# Normalization helpers (unchanged)
# -------------------------------------------------------------------

def normalize_code_field(value):
    if value is None:
        return []

    if isinstance(value, dict):
        return value.get("ALL", [])

    if isinstance(value, list):
        return value

    if isinstance(value, str):
        return re.findall(r"\b[A-Z0-9]{6,12}\b", value)

    return []

# -------------------------------------------------------------------
# Fund Option Inference (UPGRADED, NOT REPLACED)
# -------------------------------------------------------------------

def infer_fund_options(raw_options, amfi_codes, isins, full_text):
    
    # Tier 1: LLM already gave structured data
    if isinstance(raw_options, list) and raw_options:
        logger.info("Using LLM structured fund options")
        return raw_options, isins, amfi_codes

    # Tier 2: ISIN block semantic extraction
    isin_variants, isin_list, amfi_list = extract_from_isin_block(full_text)
    if isin_variants:
        return isin_variants, isin_list, amfi_list

    # Tier 3: Option table
    options = normalize_fund_options(raw_options)
    if options:
        return options, isins, amfi_codes

    # Tier 4: Scope fallback
    logger.warning("LLM did not return fund options, falling back to scope inference")
    expanded = []
    for opt in ["Growth", "Payout of IDCW"]:
        expanded.append(f"Regular {opt}")
        expanded.append(f"Direct {opt}")
    return expanded, isins, amfi_codes

# -------------------------------------------------------------------
# Core Processing
# -------------------------------------------------------------------

def process_single_summary_pdf(pdf_path: Path):
    output_path = OUTPUT_SUMMARY_DIR / f"{pdf_path.stem}.json"
    logger.info("Processing summary PDF: %s", pdf_path.name)

    text = extract_pdf_text(pdf_path)
    if not text.strip():
        raise RuntimeError("No text extracted")

    client = OpenAIClient().client
    prompt = SUMMARY_EXTRACTION_PROMPT + "\n\n" + text[:MAX_DOC_CHARS]

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        temperature=0,
        messages=[
            {"role": "system", "content": "Return strict JSON only"},
            {"role": "user", "content": prompt},
        ],
    )

    extracted = safe_json_loads(response.choices[0].message.content)

    extracted["annual_expense"] = normalize_annual_expense(
        extracted.get("annual_expense")
    )

    extracted["amfi_codes"] = normalize_code_field(
        extracted.get("amfi_codes") or extract_amfi_from_text(text)
    )

    extracted["isins"] = normalize_code_field(
        extracted.get("isins") or extract_isin_from_text(text)
    )

    fund_options, extracted["isins"], extracted["amfi_codes"] = infer_fund_options(
    extracted.get("fund_options"),
    extracted["amfi_codes"],
    extracted["isins"],
    text
   )


    output = {
        "parent_scheme_name": extracted.get("fund_name"),
        "source_file": pdf_path.name,
        "source": "summary_pdf",
        "data": extracted,
        "fund_options_inferred": fund_options,
        "extracted_at": datetime.now(timezone.utc).isoformat(),
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    logger.info("Saved → %s", output_path.name)

# -------------------------------------------------------------------
# Batch Runner
# -------------------------------------------------------------------

def run_summary_extraction():
    pdfs = sorted(INPUT_SUMMARY_PDF_DIR.glob("*.pdf"))

    total, processed, skipped, failed = 0, 0, 0, 0

    logger.info("Found %d summary PDFs", len(pdfs))

    for pdf in pdfs:
        total += 1
        out = OUTPUT_SUMMARY_DIR / f"{pdf.stem}.json"
        try:
            if out.exists() and out.stat().st_mtime >= pdf.stat().st_mtime:
                skipped += 1
                continue
            process_single_summary_pdf(pdf)
            processed += 1
        except Exception:
            failed += 1
            logger.error("Failed processing %s", pdf.name)
            traceback.print_exc()

    logger.info(
        "Summary extraction completed | total=%d | processed=%d | skipped=%d | failed=%d",
        total, processed, skipped, failed
    )

# -------------------------------------------------------------------
# Entry Point
# -------------------------------------------------------------------

if __name__ == "__main__":
    run_summary_extraction()
