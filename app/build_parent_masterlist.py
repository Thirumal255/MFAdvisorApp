import json
import logging
from pathlib import Path
import re
from collections import defaultdict

# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"

SUMMARIES_FILE = DATA_DIR / "scheme_summary_extract" / "all_scheme_summaries.json"
ALL_NAV_FILE = DATA_DIR / "all_scheme_full_details.json"
OUTPUT_FILE = DATA_DIR / "parent_masterlist.json"

# ---------------------------------------------------------
# Logging
# ---------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------
# Helper: Normalize Parent Name for Matching
# ---------------------------------------------------------

def normalize_for_matching(name: str) -> str:
    """
    Aggressive normalization for fuzzy matching
    """
    if not name:
        return ""
    
    name = name.lower().strip()
    
    # Remove common words
    remove_words = [
        'fund', 'plan', 'scheme', 'mutual', 'direct', 'regular', 
        'growth', 'idcw', 'dividend', 'option', '-', '(', ')', 'the'
    ]
    
    for word in remove_words:
        name = name.replace(word, ' ')
    
    # Clean spaces
    name = re.sub(r'\s+', ' ', name).strip()
    
    return name


def names_match(name1: str, name2: str) -> bool:
    """
    Check if two names refer to same parent scheme
    """
    if not name1 or not name2:
        return False
    
    norm1 = normalize_for_matching(name1)
    norm2 = normalize_for_matching(name2)
    
    if not norm1 or not norm2:
        return False
    
    # Check if one contains the other (handles slight variations)
    return norm1 in norm2 or norm2 in norm1


# ---------------------------------------------------------
# Helper: Classify Variant
# ---------------------------------------------------------

def classify_variant(scheme_name: str) -> dict:
    """
    Classify a scheme variant into Plan and Option
    """
    if not scheme_name:
        return {
            'plan': 'Unknown',
            'option': 'Unknown',
            'full_label': 'Unknown',
            'is_direct_growth': False
        }
    
    name_lower = scheme_name.lower()
    
    # Determine PLAN
    if 'direct' in name_lower:
        plan = 'Direct'
    elif 'regular' in name_lower:
        plan = 'Regular'
    else:
        plan = 'Unknown'
    
    # Determine OPTION
    idcw_keywords = [
        'idcw', 'dividend', 'income distribution', 
        'income payout', 'monthly income', 'quarterly income',
        'capital withdrawal', 'div', 'payout', 'reinvestment'
    ]
    
    if any(keyword in name_lower for keyword in idcw_keywords):
        option = 'IDCW'
    elif 'growth' in name_lower:
        option = 'Growth'
    else:
        option = 'Unknown'
    
    full_label = f"{plan} {option}".strip()
    is_direct_growth = (plan == 'Direct' and option == 'Growth')
    
    return {
        'plan': plan,
        'option': option,
        'full_label': full_label,
        'is_direct_growth': is_direct_growth
    }


# ---------------------------------------------------------
# Helper: Select Canonical Code
# ---------------------------------------------------------

def select_canonical_code(variants: list) -> str:
    """
    Select the best canonical code from variants
    
    Priority:
    1. Direct Growth (most preferred)
    2. Direct IDCW
    3. Regular Growth
    4. First variant (fallback)
    """
    if not variants:
        return None
    
    # Try to find Direct Growth
    for variant in variants:
        classification = classify_variant(variant.get('scheme_name', ''))
        if classification['is_direct_growth']:
            logger.info(f"    → Selected Direct Growth: {variant['amfi_code']}")
            return variant['amfi_code']
    
    # Try to find Direct IDCW
    for variant in variants:
        classification = classify_variant(variant.get('scheme_name', ''))
        if classification['plan'] == 'Direct' and classification['option'] == 'IDCW':
            logger.info(f"    → Selected Direct IDCW: {variant['amfi_code']}")
            return variant['amfi_code']
    
    # Try to find Regular Growth
    for variant in variants:
        classification = classify_variant(variant.get('scheme_name', ''))
        if classification['plan'] == 'Regular' and classification['option'] == 'Growth':
            logger.info(f"    → Selected Regular Growth: {variant['amfi_code']}")
            return variant['amfi_code']
    
    # Fallback to first variant
    logger.warning(f"    → No ideal variant, using first: {variants[0]['amfi_code']}")
    return variants[0]['amfi_code']


# ---------------------------------------------------------
# Helper: Load NAV Data
# ---------------------------------------------------------

def load_nav_data():
    """
    Load all_scheme_full_details.json
    Returns: 
    - lookup: {code: scheme_info}
    - all_schemes: full list for name searching
    """
    logger.info("Loading all_scheme_full_details.json...")
    
    with open(ALL_NAV_FILE, 'r', encoding='utf-8') as f:
        all_schemes = json.load(f)
    
    logger.info(f"Loaded {len(all_schemes)} schemes from NAV data")
    
    # Create code lookup
    lookup = {}
    for scheme in all_schemes:
        code = scheme.get('meta', {}).get('scheme_code')
        name = scheme.get('meta', {}).get('scheme_name')
        if code and name:
            lookup[str(code)] = {
                'scheme_name': name,
                'fund_house': scheme.get('meta', {}).get('fund_house'),
                'scheme_type': scheme.get('meta', {}).get('scheme_type'),
                'scheme_category': scheme.get('meta', {}).get('scheme_category')
            }
    
    logger.info(f"Created lookup index with {len(lookup)} codes")
    
    return lookup, all_schemes


# ---------------------------------------------------------
# Helper: Search NAV Data by Parent Name
# ---------------------------------------------------------

def search_nav_by_parent_name(parent_name: str, all_schemes: list) -> list:
    """
    Search all_scheme_full_details for schemes matching parent name
    Returns list of matching variants with codes
    """
    logger.info(f"  🔍 Searching NAV data by name: {parent_name}")
    
    matches = []
    
    for scheme in all_schemes:
        meta = scheme.get('meta', {})
        scheme_name = meta.get('scheme_name', '')
        scheme_code = meta.get('scheme_code')
        
        if not scheme_name or not scheme_code:
            continue
        
        # Check if scheme name matches parent name
        if names_match(parent_name, scheme_name):
            matches.append({
                'scheme_name': scheme_name,
                'amfi_code': str(scheme_code),
                'fund_house': meta.get('fund_house'),
                'match_type': 'name_search'
            })
    
    if matches:
        logger.info(f"  ✓ Found {len(matches)} matching variants by name search")
        for match in matches:
            logger.info(f"    - {match['amfi_code']}: {match['scheme_name']}")
    else:
        logger.warning(f"  ✗ No matches found in NAV data for: {parent_name}")
    
    return matches


# ---------------------------------------------------------
# Core Builder
# ---------------------------------------------------------

def build_parent_masterlist():
    """
    Build parent masterlist with intelligent fallback logic
    """
    
    logger.info("="*60)
    logger.info("BUILDING PARENT MASTERLIST")
    logger.info("="*60)
    
    # Load NAV data
    nav_lookup, all_nav_schemes = load_nav_data()
    
    # Load summaries
    logger.info("\nLoading all_scheme_summaries.json...")
    with open(SUMMARIES_FILE, 'r', encoding='utf-8') as f:
        summaries_data = json.load(f)
    
    logger.info(f"Found {len(summaries_data)} parent schemes in summaries")
    
    output = {}
    stats = {
        'total_in_summary': len(summaries_data),
        'successfully_processed': 0,
        'amfi_from_summary': 0,
        'amfi_from_name_search': 0,
        'partial_fallback': 0,  # NEW: Some codes found, rest from name search
        'with_canonical': 0,
        'without_canonical': 0,
        'skipped': 0
    }
    
    # Process each parent scheme
    for idx, (parent_name, summary_info) in enumerate(summaries_data.items(), 1):
        logger.info(f"\n[{idx}/{len(summaries_data)}] Processing: {parent_name}")
        
        if not parent_name or not parent_name.strip():
            logger.warning(f"  ✗ Skipping - Empty parent name")
            stats['skipped'] += 1
            continue
        
        summary_data = summary_info.get('data', {})
        
        # FIX 1: Handle None case for amfi_codes
        amfi_codes_raw = summary_data.get('amfi_codes')
        if amfi_codes_raw is None:
            amfi_codes_raw = []
        
        # Filter valid AMFI codes from summary
        valid_codes_from_summary = [
            str(code).strip() 
            for code in amfi_codes_raw 
            if code and str(code).strip() and str(code).strip().isdigit()
        ]
        
        variants = []
        
        # ============================================
        # TRY: Validate AMFI codes from summary
        # ============================================
        if valid_codes_from_summary:
            logger.info(f"  📋 Found {len(valid_codes_from_summary)} AMFI codes in summary")
            
            for code in valid_codes_from_summary:
                # Validate code exists in NAV data
                nav_info = nav_lookup.get(code)
                
                if not nav_info:
                    logger.warning(f"    ✗ Code {code} not found in NAV data")
                    continue
                
                variant = {
                    'scheme_name': nav_info['scheme_name'],
                    'amfi_code': code
                }
                variants.append(variant)
                logger.info(f"    ✓ {code}: {nav_info['scheme_name']}")
        
        # ============================================
        # FIX 2: Fallback to name search if needed
        # ============================================
        
        # Scenario 1: No AMFI codes in summary at all
        if not valid_codes_from_summary:
            logger.warning(f"  ⚠ No AMFI codes in summary, searching by name...")
            stats['amfi_from_name_search'] += 1
            
            matches = search_nav_by_parent_name(parent_name, all_nav_schemes)
            if matches:
                variants = matches
        
        # Scenario 2: Had codes but NONE were validated (all invalid)
        elif not variants:
            logger.warning(f"  ⚠ All {len(valid_codes_from_summary)} AMFI codes invalid, searching by name...")
            stats['partial_fallback'] += 1
            
            matches = search_nav_by_parent_name(parent_name, all_nav_schemes)
            if matches:
                variants = matches
        
        # Scenario 3: Some codes validated successfully
        else:
            logger.info(f"  ✓ Validated {len(variants)}/{len(valid_codes_from_summary)} codes from summary")
            stats['amfi_from_summary'] += 1
        
        # ============================================
        # Finalize variants & select canonical
        # ============================================
        
        if not variants:
            logger.error(f"  ✗ Could not find any variants for {parent_name}")
            stats['skipped'] += 1
            continue
        
        # Deduplicate by AMFI code
        seen_codes = set()
        unique_variants = []
        for v in variants:
            code = v.get('amfi_code')
            if code and code not in seen_codes:
                seen_codes.add(code)
                unique_variants.append(v)
        
        if not unique_variants:
            logger.error(f"  ✗ No unique variants after deduplication")
            stats['skipped'] += 1
            continue
        
        # Select canonical code
        canonical_code = select_canonical_code(unique_variants)
        
        # Store result
        output[parent_name] = {
            'parent_scheme_name': parent_name,
            'canonical_code': canonical_code,
            'variants': unique_variants
        }
        
        stats['successfully_processed'] += 1
        
        if canonical_code:
            stats['with_canonical'] += 1
        else:
            stats['without_canonical'] += 1
        
        logger.info(f"  ✅ Final: {len(unique_variants)} variants, canonical={canonical_code}")
    
    # ============================================
    # Save Output
    # ============================================
    
    logger.info(f"\nSaving to {OUTPUT_FILE}...")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    # Print summary
    logger.info("\n" + "="*60)
    logger.info("BUILD COMPLETE")
    logger.info("="*60)
    logger.info(f"Total in summaries: {stats['total_in_summary']}")
    logger.info(f"Successfully processed: {stats['successfully_processed']}")
    logger.info(f"  → AMFI from summary (validated): {stats['amfi_from_summary']}")
    logger.info(f"  → AMFI from name search (no codes): {stats['amfi_from_name_search']}")
    logger.info(f"  → Fallback to name (invalid codes): {stats['partial_fallback']}")
    logger.info(f"With canonical code: {stats['with_canonical']}")
    logger.info(f"Without canonical code: {stats['without_canonical']}")
    logger.info(f"Skipped (not found): {stats['skipped']}")
    logger.info(f"Success rate: {stats['successfully_processed']/stats['total_in_summary']*100:.1f}%")
    logger.info(f"\nOutput saved to: {OUTPUT_FILE}")
    logger.info("="*60)


# ---------------------------------------------------------
# Entry
# ---------------------------------------------------------

if __name__ == "__main__":
    build_parent_masterlist()