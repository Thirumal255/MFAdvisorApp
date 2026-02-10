import json
import logging
from pathlib import Path

# ---------------------------------------------------
# Paths
# ---------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"

METRICS_FILE = DATA_DIR / "all_scheme_metrics.json"
SUMMARIES_FILE = DATA_DIR / "scheme_summary_extract" / "all_scheme_summaries.json"
MASTERLIST_FILE = DATA_DIR / "parent_masterlist.json"
OUTPUT_FILE = DATA_DIR / "scheme_metrics_merged.json"

# ---------------------------------------------------
# Logging
# ---------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------
# Category Display Helpers
# ---------------------------------------------------

def get_category_display_name(main_category, sub_category=None):
    """
    Get display name for UI
    
    Examples:
        ("Equity", "Large & Mid Cap Fund") -> "Equity • Large & Mid Cap"
        ("Debt", "Liquid Fund") -> "Debt • Liquid"
        ("Income", None) -> "Income"
    """
    if sub_category:
        # Shorten common sub-category names
        sub_short = sub_category.replace(" Fund", "").replace(" Scheme", "").strip()
        return f"{main_category} • {sub_short}"
    else:
        return main_category


def get_category_emoji(main_category):
    """Get emoji for category"""
    emojis = {
        "Equity": "📈",
        "Debt": "🏦",
        "Hybrid": "⚖️",
        "Income": "💰",
        "Solution Oriented": "🎯",
        "Other": "📊"
    }
    return emojis.get(main_category, "📊")


# ---------------------------------------------------
# Normalization Functions
# ---------------------------------------------------

def normalize_fund_managers(value):
    """
    Convert fund_managers to string for consistent rendering
    Input: Array, string, or None
    Output: Comma-separated string or None
    """
    if value is None:
        return None
    
    if isinstance(value, list):
        # Array of manager objects or strings
        manager_names = []
        for mgr in value:
            if isinstance(mgr, dict):
                name = mgr.get('name', '')
                if name:
                    manager_names.append(name)
            elif isinstance(mgr, str):
                manager_names.append(mgr)
        
        return ", ".join(manager_names) if manager_names else None
    
    elif isinstance(value, str):
        # Already a string
        return value
    
    else:
        # Unknown type, convert to string
        return str(value)


def normalize_asset_allocation(value):
    """
    Convert asset_allocation to string for consistent rendering
    Input: String, dict, array, or None
    Output: Formatted string or None
    """
    if value is None:
        return None
    
    if isinstance(value, str):
        # Already a string
        return value
    
    elif isinstance(value, dict):
        # Convert dict to readable string
        parts = []
        for key, val in value.items():
            parts.append(f"{key}: {val}")
        return " | ".join(parts)
    
    elif isinstance(value, list):
        # Convert array to string
        return ", ".join(str(item) for item in value)
    
    else:
        # Unknown type
        return str(value)


def normalize_annual_expense(value):
    """
    Ensure annual_expense is an object with string values
    Input: Object, string, or None
    Output: {"Regular": "X.XX", "Direct": "Y.YY"} or {}
    """
    if value is None:
        return {}
    
    if isinstance(value, dict):
        # Ensure all values are strings
        normalized = {}
        for key, val in value.items():
            if val is not None:
                # Remove % symbol if present and ensure string
                val_str = str(val).replace('%', '').strip()
                normalized[key] = val_str
        return normalized
    
    elif isinstance(value, str):
        # Try to parse string format "Regular: 1.5%, Direct: 0.5%"
        import re
        result = {}
        matches = re.findall(r'(Regular|Direct|Retail)[\s:]*([0-9.]+)', value, re.IGNORECASE)
        for plan, rate in matches:
            result[plan.capitalize()] = rate
        return result if result else {}
    
    else:
        return {}


def normalize_exit_load(value):
    """
    Ensure exit_load is a string
    """
    if value is None or value == 'null' or value == '':
        return None
    
    return str(value)


def normalize_benchmark(value):
    """
    Ensure benchmark is a string
    """
    if value is None:
        return None
    
    if isinstance(value, list):
        return ", ".join(str(item) for item in value)
    
    return str(value)


def normalize_isins(value):
    """
    Ensure ISINs is an array of strings
    """
    if value is None:
        return []
    
    if isinstance(value, list):
        return [str(item) for item in value if item]
    
    if isinstance(value, str):
        # Split comma-separated string
        return [isin.strip() for isin in value.split(',') if isin.strip()]
    
    return []


# ---------------------------------------------------
# Core Merge Function
# ---------------------------------------------------

def merge_all_data():
    """
    Merge metrics with summaries and masterlist into final output
    All keyed by parent_scheme_name
    WITH DATA NORMALIZATION for React Native rendering
    AND CATEGORY CLASSIFICATION
    """
    
    logger.info("="*60)
    logger.info("MERGING ALL DATA WITH NORMALIZATION & CATEGORIES")
    logger.info("="*60)
    
    # Load metrics (keyed by parent_scheme_name)
    logger.info("Loading all_scheme_metrics.json...")
    with open(METRICS_FILE, "r", encoding="utf-8") as f:
        metrics_data = json.load(f)
    logger.info(f"✓ Loaded {len(metrics_data)} parent schemes with metrics")
    
    # Load summaries (keyed by parent_scheme_name)
    logger.info("Loading all_scheme_summaries.json...")
    with open(SUMMARIES_FILE, "r", encoding="utf-8") as f:
        summaries_data = json.load(f)
    logger.info(f"✓ Loaded {len(summaries_data)} parent scheme summaries")
    
    # Load masterlist (keyed by parent_scheme_name)
    logger.info("Loading parent_masterlist.json...")
    with open(MASTERLIST_FILE, "r", encoding="utf-8") as f:
        masterlist_data = json.load(f)
    logger.info(f"✓ Loaded {len(masterlist_data)} parent schemes from masterlist")
    
    output = {}
    stats = {
        'total_in_masterlist': len(masterlist_data),
        'merged_successfully': 0,
        'missing_metrics': 0,
        'missing_summary': 0,
        'insufficient_data': 0,
        'reliable_data': 0,
        'normalized_managers': 0,
        'normalized_assets': 0,
        'categories': {}
    }
    
    # Iterate through masterlist (source of truth)
    for idx, (parent_name, parent_data) in enumerate(masterlist_data.items(), 1):
        canonical_code = parent_data.get("canonical_code")
        variants = parent_data.get("variants", [])
        
        if idx % 50 == 0:
            logger.info(f"Progress: {idx}/{len(masterlist_data)} schemes processed...")
        
        if not canonical_code:
            logger.debug(f"No canonical_code for {parent_name}")
        
        # Get metrics for this parent
        metrics_info = metrics_data.get(parent_name)
        
        if not metrics_info:
            logger.debug(f"No metrics found for {parent_name} - Skipping")
            stats['missing_metrics'] += 1
            continue
        
        # Get summary for this parent
        summary_info = summaries_data.get(parent_name, {})
        summary_data = summary_info.get("data", {})
        
        if not summary_data:
            stats['missing_summary'] += 1
        
        # Check if metrics are reliable
        is_reliable = metrics_info.get("metrics", {}).get("is_statistically_reliable", False)
        if not is_reliable:
            stats['insufficient_data'] += 1
        else:
            stats['reliable_data'] += 1
        
        # Get category info from metrics
        main_category = metrics_info.get("main_category", "Other")
        sub_category = metrics_info.get("sub_category")
        
        # Track category stats
        stats['categories'][main_category] = stats['categories'].get(main_category, 0) + 1
        
        # ===== NORMALIZE DATA FOR REACT NATIVE =====
        
        raw_managers = summary_data.get("fund_managers")
        normalized_managers = normalize_fund_managers(raw_managers)
        if isinstance(raw_managers, list):
            stats['normalized_managers'] += 1
        
        raw_asset = summary_data.get("asset_allocation")
        normalized_asset = normalize_asset_allocation(raw_asset)
        if isinstance(raw_asset, (dict, list)):
            stats['normalized_assets'] += 1
        
        # Merge everything with normalized data
        merged = {
            "parent_scheme_name": parent_name,
            "canonical_code": canonical_code,
            "scheme_start_date": metrics_info.get("data_start_date"),
            "variants": variants,
            
            # CATEGORY INFORMATION (NEW)
            "main_category": main_category,
            "sub_category": sub_category,
            "category_display": get_category_display_name(main_category, sub_category),
            "category_emoji": get_category_emoji(main_category),
            
            # From summary (NORMALIZED for React Native)
            "fund_type": summary_data.get("fund_type"),
            "riskometer": summary_data.get("riskometer"),
            "investment_objective": summary_data.get("investment_objective"),
            "asset_allocation": normalized_asset,
            "benchmark": normalize_benchmark(summary_data.get("benchmark")),
            "fund_managers": normalized_managers,
            "annual_expense": normalize_annual_expense(summary_data.get("annual_expense")),
            "exit_load": normalize_exit_load(summary_data.get("exit_load")),
            "isins": normalize_isins(summary_data.get("isins")),
            
            # From metrics (required)
            "metrics": metrics_info.get("metrics", {}),
            
            # Metadata from metrics_info
            "total_nav_records": metrics_info.get("total_nav_records", 0),
            "fund_house": metrics_info.get("fund_house"),
            "scheme_type": metrics_info.get("scheme_type"),
            "scheme_category": metrics_info.get("scheme_category"),
            "scheme_name_full": metrics_info.get("scheme_name_full"),
            "data_start_date": metrics_info.get("data_start_date"),
            "data_end_date": metrics_info.get("data_end_date")
        }
        
        output[parent_name] = merged
        stats['merged_successfully'] += 1
    
    # Save output
    logger.info(f"\nSaving normalized data to {OUTPUT_FILE}...")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    # Print summary
    logger.info("\n" + "="*60)
    logger.info("MERGE COMPLETE WITH NORMALIZATION & CATEGORIES")
    logger.info("="*60)
    logger.info(f"Total in masterlist: {stats['total_in_masterlist']}")
    logger.info(f"✅ Merged successfully: {stats['merged_successfully']}")
    logger.info(f"  → With reliable metrics: {stats['reliable_data']}")
    logger.info(f"  → With insufficient data: {stats['insufficient_data']}")
    logger.info(f"⚠️  Missing metrics: {stats['missing_metrics']}")
    logger.info(f"⚠️  Missing summary: {stats['missing_summary']}")
    logger.info(f"\n🔧 Data Normalization:")
    logger.info(f"  → Managers converted to strings: {stats['normalized_managers']}")
    logger.info(f"  → Assets converted to strings: {stats['normalized_assets']}")
    logger.info(f"\n📊 Category Breakdown:")
    for category, count in sorted(stats['categories'].items(), key=lambda x: x[1], reverse=True):
        logger.info(f"  {get_category_emoji(category)} {category}: {count}")
    logger.info(f"\nSuccess rate: {stats['merged_successfully']/stats['total_in_masterlist']*100:.1f}%")
    logger.info(f"Output saved to: {OUTPUT_FILE}")
    logger.info("="*60)


# ---------------------------------------------------
# Entry
# ---------------------------------------------------

if __name__ == "__main__":
    merge_all_data()
