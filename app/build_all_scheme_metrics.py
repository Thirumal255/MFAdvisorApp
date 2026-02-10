import json
import logging
from pathlib import Path
import pandas as pd
from app.metrics import compute_metrics_for_nav

# ---------------------------------------------------
# Category Classification Helper
# ---------------------------------------------------

def parse_scheme_category(scheme_category):
    """
    Parse scheme_category into main_category and sub_category
    
    Examples:
        "Equity Scheme - Large & Mid Cap Fund" -> ("Equity", "Large & Mid Cap Fund")
        "Debt Scheme - Liquid Fund" -> ("Debt", "Liquid Fund")
        "Income" -> ("Income", None)
    
    Returns:
        Tuple of (main_category, sub_category)
    """
    if not scheme_category or not isinstance(scheme_category, str):
        return ("Other", None)
    
    category = scheme_category.strip()
    
    # Check if it has a separator
    if " - " in category:
        parts = category.split(" - ", 1)
        main_part = parts[0].strip()
        sub_part = parts[1].strip()
        
        # Extract main category name
        if "Equity" in main_part:
            main_category = "Equity"
        elif "Debt" in main_part:
            main_category = "Debt"
        elif "Hybrid" in main_part:
            main_category = "Hybrid"
        elif "Solution" in main_part or "FOF" in main_part or "Income" in main_part:
            main_category = "Solution Oriented"
        else:
            main_category = "Other"
        
        return (main_category, sub_part)
    
    else:
        # No separator - just main category
        category_lower = category.lower()
        
        if "equity" in category_lower:
            return ("Equity", None)
        elif "debt" in category_lower:
            return ("Debt", None)
        elif "hybrid" in category_lower or "balanced" in category_lower:
            return ("Hybrid", None)
        elif "solution" in category_lower or "fof" in category_lower or "fund of fund" in category_lower or "income" in category_lower:
            return ("Solution Oriented", None)
        else:
            return ("Other", None)


# ---------------------------------------------------
# Paths
# ---------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"

MASTERLIST_FILE = DATA_DIR / "parent_masterlist.json"
NAV_DATA_FILE = DATA_DIR / "parent_scheme_nav.json"
OUTPUT_FILE = DATA_DIR / "all_scheme_metrics.json"

# Minimum NAV records required for reliable metrics
MIN_NAV_RECORDS_REQUIRED = 50

# ---------------------------------------------------
# Logging
# ---------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------
# Helper: Create Empty Metrics
# ---------------------------------------------------

def create_empty_metrics(reason: str) -> dict:
    """
    Create metrics structure with all null values
    Used when insufficient data
    """
    return {
        # Core return metrics
        "cagr": None,
        "rolling_1y": None,
        "rolling_3y": None,
        "rolling_5y": None,
        
        # Absolute returns
        "abs_return_1m": None,
        "abs_return_3m": None,
        "abs_return_6m": None,
        "abs_return_1y": None,
        "abs_return_2y": None,
        "abs_return_3y": None,
        "abs_return_5y": None,
        "abs_return_7y": None,
        "abs_return_10y": None,
        
        # Risk metrics
        "volatility": None,
        "downside_deviation": None,
        "max_drawdown": None,
        "ulcer_index": None,
        "value_at_risk_95": None,
        "conditional_var_95": None,
        
        # Risk-adjusted returns
        "sharpe": None,
        "sortino": None,
        "calmar_ratio": None,
        "gain_to_pain_ratio": None,
        
        # Consistency metrics
        "consistency_score": None,
        "positive_months_pct": None,
        "pain_index": None,
        
        # Recovery metrics
        "avg_drawdown_duration_days": None,
        "max_recovery_time_days": None,
        "current_drawdown_pct": None,
        "days_since_peak": None,
        
        # Distribution metrics
        "skewness": None,
        "kurtosis": None,
        
        # Fund metadata
        "fund_age_years": None,
        "is_statistically_reliable": False,
        "data_quality": "insufficient",
        "data_quality_reason": reason,
        
        # Phase 2 placeholders
        "alpha": None,
        "beta": None,
        "r_squared": None,
        "correlation": None,
        "information_ratio": None,
        "treynor_ratio": None,
        "tracking_error": None,
        "up_capture": None,
        "down_capture": None,
        "win_rate": None,
        "excess_return": None
    }


# ---------------------------------------------------
# Helper: Load NAV Data Indexed by Scheme Code
# ---------------------------------------------------

def load_nav_data_lookup():
    """
    Load all_scheme_full_details.json and index by scheme_code
    Returns: dict {scheme_code: scheme_data}
    """
    logger.info("Loading parent_scheme_nav.json...")
    
    with open(NAV_DATA_FILE, "r", encoding="utf-8") as f:
        all_schemes = json.load(f)
    
    logger.info(f"Found {len(all_schemes)} total schemes (including closed funds)")
    
    # Create lookup dictionary
    nav_lookup = {}
    for scheme_data in all_schemes:
        scheme_code = scheme_data.get("meta", {}).get("scheme_code")
        if scheme_code:
            nav_lookup[str(scheme_code)] = scheme_data
    
    logger.info(f"Created lookup index with {len(nav_lookup)} schemes")
    return nav_lookup


# ---------------------------------------------------
# Core: Calculate Metrics for Parent Schemes Only
# ---------------------------------------------------

def build_all_scheme_metrics():
    """
    Calculate metrics ONLY for parent schemes in parent_masterlist.json
    Includes schemes with insufficient data (with null metrics)
    """
    
    # Load parent masterlist
    logger.info("="*60)
    logger.info("BUILDING SCHEME METRICS WITH CATEGORY CLASSIFICATION")
    logger.info("="*60)
    logger.info("Loading parent_masterlist.json...")
    
    with open(MASTERLIST_FILE, "r", encoding="utf-8") as f:
        masterlist = json.load(f)
    
    logger.info(f"Found {len(masterlist)} parent schemes")
    
    # Load NAV data lookup
    nav_lookup = load_nav_data_lookup()
    
    output = {}
    stats = {
        'total_parents': len(masterlist),
        'processed_with_metrics': 0,
        'insufficient_data': 0,
        'no_nav_data': 0,
        'calculation_failed': 0,
        'categories': {}
    }
    
    # Process each parent scheme
    for idx, (parent_name, parent_data) in enumerate(masterlist.items(), 1):
        canonical_code = parent_data.get("canonical_code")
        variants = parent_data.get("variants", [])
        
        logger.info(f"\n[{idx}/{len(masterlist)}] Processing: {parent_name}")
        
        # Validation: No canonical code
        if not canonical_code:
            logger.warning(f"  ⚠️ No canonical_code - Creating entry with null metrics")
            
            output[parent_name] = {
                "parent_scheme_name": parent_name,
                "canonical_code": None,
                "scheme_name_full": None,
                "fund_house": None,
                "scheme_type": None,
                "scheme_category": None,
                "main_category": "Other",
                "sub_category": None,
                "data_start_date": None,
                "data_end_date": None,
                "total_nav_records": 0,
                "total_variants": len(variants),
                "metrics": create_empty_metrics("no_canonical_code")
            }
            stats['no_nav_data'] += 1
            continue
        
        # Find NAV data for canonical scheme
        scheme_data = nav_lookup.get(str(canonical_code))
        
        if not scheme_data:
            logger.warning(f"  ⚠️ No NAV data for code {canonical_code} - Creating entry with null metrics")
            
            output[parent_name] = {
                "parent_scheme_name": parent_name,
                "canonical_code": canonical_code,
                "scheme_name_full": None,
                "fund_house": None,
                "scheme_type": None,
                "scheme_category": None,
                "main_category": "Other",
                "sub_category": None,
                "data_start_date": None,
                "data_end_date": None,
                "total_nav_records": 0,
                "total_variants": len(variants),
                "metrics": create_empty_metrics("nav_data_not_found")
            }
            stats['no_nav_data'] += 1
            continue
        
        nav_data = scheme_data.get("data", [])
        meta = scheme_data.get("meta", {})
        
        # Parse category
        raw_category = meta.get("scheme_category")
        main_category, sub_category = parse_scheme_category(raw_category)
        
        # Track category stats
        stats['categories'][main_category] = stats['categories'].get(main_category, 0) + 1
        
        logger.info(f"  📂 Category: {main_category}" + (f" → {sub_category}" if sub_category else ""))
        
        # Check if sufficient NAV data
        if not nav_data or len(nav_data) < MIN_NAV_RECORDS_REQUIRED:
            logger.warning(f"  ⚠️ Insufficient NAV data ({len(nav_data)} records, need {MIN_NAV_RECORDS_REQUIRED})")
            
            output[parent_name] = {
                "parent_scheme_name": parent_name,
                "canonical_code": canonical_code,
                "scheme_name_full": meta.get("scheme_name"),
                "fund_house": meta.get("fund_house"),
                "scheme_type": meta.get("scheme_type"),
                "scheme_category": raw_category,
                "main_category": main_category,
                "sub_category": sub_category,
                "data_start_date": nav_data[0]["date"] if nav_data else None,
                "data_end_date": nav_data[-1]["date"] if nav_data else None,
                "total_nav_records": len(nav_data),
                "total_variants": len(variants),
                "metrics": create_empty_metrics(f"insufficient_data_{len(nav_data)}_records")
            }
            stats['insufficient_data'] += 1
            continue
        
        # Try to calculate metrics
        try:
            # Convert to DataFrame
            nav_records = [
                {
                    "date": row["date"],
                    "nav": float(row["nav"])
                }
                for row in nav_data
                if row.get("nav")
            ]
            
            if len(nav_records) < MIN_NAV_RECORDS_REQUIRED:
                logger.warning(f"  ⚠️ Too few valid NAV records ({len(nav_records)} after filtering)")
                
                output[parent_name] = {
                    "parent_scheme_name": parent_name,
                    "canonical_code": canonical_code,
                    "scheme_name_full": meta.get("scheme_name"),
                    "fund_house": meta.get("fund_house"),
                    "scheme_type": meta.get("scheme_type"),
                    "scheme_category": raw_category,
                    "main_category": main_category,
                    "sub_category": sub_category,
                    "data_start_date": nav_records[0]["date"] if nav_records else None,
                    "data_end_date": nav_records[-1]["date"] if nav_records else None,
                    "total_nav_records": len(nav_records),
                    "total_variants": len(variants),
                    "metrics": create_empty_metrics(f"insufficient_valid_data_{len(nav_records)}_records")
                }
                stats['insufficient_data'] += 1
                continue
            
            nav_df = pd.DataFrame(nav_records)
            
            # Calculate metrics
            logger.info(f"  ✓ Calculating metrics ({len(nav_records)} NAV records)")
            metrics = compute_metrics_for_nav(nav_df)
            
            # Store result
            output[parent_name] = {
                "parent_scheme_name": parent_name,
                "canonical_code": canonical_code,
                "scheme_name_full": meta.get("scheme_name"),
                "fund_house": meta.get("fund_house"),
                "scheme_type": meta.get("scheme_type"),
                "scheme_category": raw_category,
                "main_category": main_category,
                "sub_category": sub_category,
                "data_start_date": nav_records[0]["date"],
                "data_end_date": nav_records[-1]["date"],
                "total_nav_records": len(nav_records),
                "total_variants": len(variants),
                "metrics": metrics
            }
            
            stats['processed_with_metrics'] += 1
            cagr = metrics.get('cagr')
            cagr_display = f"{cagr*100:.2f}%" if cagr is not None else "N/A"
            logger.info(f"  ✅ Success - CAGR: {cagr_display}")
            
        except Exception as e:
            logger.error(f"  ❌ Failed to calculate metrics: {str(e)}")
            
            output[parent_name] = {
                "parent_scheme_name": parent_name,
                "canonical_code": canonical_code,
                "scheme_name_full": meta.get("scheme_name"),
                "fund_house": meta.get("fund_house"),
                "scheme_type": meta.get("scheme_type"),
                "scheme_category": raw_category,
                "main_category": main_category,
                "sub_category": sub_category,
                "data_start_date": nav_records[0]["date"] if nav_records else None,
                "data_end_date": nav_records[-1]["date"] if nav_records else None,
                "total_nav_records": len(nav_records) if nav_records else 0,
                "total_variants": len(variants),
                "metrics": create_empty_metrics(f"calculation_error: {str(e)[:50]}")
            }
            stats['calculation_failed'] += 1
    
    # Save output
    logger.info(f"\nSaving metrics to {OUTPUT_FILE}...")
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    # Print summary
    logger.info("\n" + "="*60)
    logger.info("METRICS CALCULATION COMPLETE")
    logger.info("="*60)
    logger.info(f"Total parent schemes: {stats['total_parents']}")
    logger.info(f"✅ Processed with metrics: {stats['processed_with_metrics']}")
    logger.info(f"⚠️  Insufficient data: {stats['insufficient_data']}")
    logger.info(f"⚠️  No NAV data found: {stats['no_nav_data']}")
    logger.info(f"❌ Calculation failed: {stats['calculation_failed']}")
    logger.info(f"\n📊 Category Breakdown:")
    for category, count in sorted(stats['categories'].items(), key=lambda x: x[1], reverse=True):
        logger.info(f"  {category}: {count}")
    logger.info(f"\nSuccess rate: {stats['processed_with_metrics']/stats['total_parents']*100:.1f}%")
    logger.info(f"Included rate: {(stats['total_parents']-0)/stats['total_parents']*100:.1f}%")
    logger.info(f"\nOutput saved to: {OUTPUT_FILE}")
    logger.info("="*60)


# ---------------------------------------------------
# Entry
# ---------------------------------------------------

if __name__ == "__main__":
    build_all_scheme_metrics()
