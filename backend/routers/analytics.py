"""
Analytics Router - Peer Comparison, Sector Allocation, Overlap Analysis
========================================================================
FILE: backend/routers/analytics.py

UPDATED: 
- Added CATEGORY_INDEX for faster peer lookups
- Added debug logging for troubleshooting
- Better fallback to main_category when sub_category has few peers
- Returns partial data instead of error when peers are limited
- Fixed sector response to include both "weight" and "value" fields
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import json
from pathlib import Path

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


# =============================================================================
# DATA LOADING
# =============================================================================

def load_funds():
    """Load funds and create lookup indexes."""
    paths = [
        Path(__file__).parent.parent / "data" / "scheme_metrics_merged.json",
        Path("./data/scheme_metrics_merged.json"),
    ]
    
    raw_data = {}
    for p in paths:
        if p.exists():
            with open(p, encoding='utf-8') as f:
                raw_data = json.load(f)
                print(f"📊 Analytics: Loaded data from {p}")
                break
    
    if not raw_data:
        print("⚠️ Fund data not found")
        return {}, {}, {}
    
    # Create code-to-fund lookup index
    code_index = {}
    
    for fund_name, fund_data in raw_data.items():
        fund_data["_fund_name_key"] = fund_name
        
        # Index by canonical_code
        canonical = fund_data.get("canonical_code")
        if canonical:
            code_index[str(canonical)] = fund_data
        
        # Also index by each variant's amfi_code
        variants = fund_data.get("variants", [])
        for variant in variants:
            amfi = variant.get("amfi_code")
            if amfi:
                code_index[str(amfi)] = fund_data
    
    # =====================================================
    # NEW: Build category index for faster peer lookups
    # =====================================================
    category_index = {}
    
    for fund_name, fund_data in raw_data.items():
        # Get both sub_category and main_category
        sub_cat = (fund_data.get("sub_category") or "").strip()
        main_cat = (fund_data.get("main_category") or "").strip()
        
        # Index by sub_category (exact match, case-insensitive key)
        if sub_cat:
            key = sub_cat.lower()
            if key not in category_index:
                category_index[key] = []
            category_index[key].append(fund_data)
        
        # Also index by main_category if different
        if main_cat and main_cat.lower() != sub_cat.lower():
            key = main_cat.lower()
            if key not in category_index:
                category_index[key] = []
            category_index[key].append(fund_data)
    
    print(f"📊 Analytics: Loaded {len(raw_data)} funds")
    print(f"📊 Analytics: Indexed {len(code_index)} scheme codes")
    print(f"📊 Analytics: Built {len(category_index)} category groups")
    
    # Print sample categories for debugging
    sample_cats = list(category_index.keys())[:10]
    print(f"📊 Sample categories: {sample_cats}")
    
    return raw_data, code_index, category_index


# Load data at startup
FUNDS_BY_NAME, FUNDS_BY_CODE, CATEGORY_INDEX = load_funds()


# =============================================================================
# MODELS
# =============================================================================

class OverlapRequest(BaseModel):
    fund_codes: List[str] = Field(..., min_items=2, max_items=5)


# =============================================================================
# HELPERS
# =============================================================================

def get_fund(code: str) -> Dict:
    """Get fund by scheme code (canonical_code or amfi_code)."""
    code_str = str(code).strip()
    
    if code_str in FUNDS_BY_CODE:
        return FUNDS_BY_CODE[code_str]
    
    if code_str in FUNDS_BY_NAME:
        return FUNDS_BY_NAME[code_str]
    
    code_lower = code_str.lower()
    for name, fund in FUNDS_BY_NAME.items():
        if code_lower in name.lower():
            return fund
    
    raise HTTPException(
        status_code=404, 
        detail=f"Fund not found: {code}. Use the canonical_code (e.g., 152076) or amfi_code from variants."
    )


def get_fund_name(fund: Dict) -> str:
    """Get display name for a fund."""
    return (
        fund.get("parent_scheme_name") or 
        fund.get("scheme_name_full") or 
        fund.get("_fund_name_key") or 
        "Unknown"
    )


def get_fund_category(fund: Dict) -> str:
    """Get category for a fund."""
    return (
        fund.get("sub_category") or 
        fund.get("scheme_category") or 
        fund.get("main_category") or 
        "Unknown"
    )


def get_category_funds(category: str, exclude_code: str = None) -> List[Dict]:
    """
    Get all funds in a category using the pre-built index.
    Much faster than iterating through all funds.
    """
    if not category:
        return []
    
    cat_key = category.lower().strip()
    
    # Try exact match first
    results = CATEGORY_INDEX.get(cat_key, [])
    
    # If no exact match, try partial matching
    if not results:
        for key, funds in CATEGORY_INDEX.items():
            if cat_key in key or key in cat_key:
                results.extend(funds)
                break  # Use first match
    
    # Remove duplicates and exclude the current fund if specified
    seen_codes = set()
    unique_results = []
    
    for fund in results:
        fund_code = str(fund.get("canonical_code", ""))
        if fund_code and fund_code not in seen_codes:
            # Optionally exclude the fund we're comparing
            if exclude_code and fund_code == str(exclude_code):
                continue
            seen_codes.add(fund_code)
            unique_results.append(fund)
    
    return unique_results


def get_metric(fund: Dict, key: str) -> Optional[float]:
    """Get a metric value from fund data. Handles nested metrics structure."""
    metrics = fund.get("metrics", {})
    
    field_mapping = {
        "cagr": ["cagr"],
        "cagr_1y": ["abs_return_1y", "rolling_1y", "return_1y"],
        "cagr_3y": ["rolling_3y", "abs_return_3y", "return_3y"],
        "cagr_5y": ["rolling_5y", "abs_return_5y", "return_5y"],
        "sharpe_ratio": ["sharpe"],
        "sortino_ratio": ["sortino"],
        "volatility": ["volatility"],
        "max_drawdown": ["max_drawdown"],
        "expense_ratio": [],
        "consistency_score": ["consistency_score"],
    }
    
    aliases = field_mapping.get(key, [key])
    
    for alias in aliases:
        val = metrics.get(alias)
        if val is not None:
            try:
                return float(val)
            except (ValueError, TypeError):
                pass
        
        val = fund.get(alias)
        if val is not None:
            try:
                return float(val)
            except (ValueError, TypeError):
                pass
    
    # Special handling for expense_ratio
    if key == "expense_ratio":
        expense = fund.get("expense") or fund.get("annual_expense", {})
        if isinstance(expense, dict):
            val = expense.get("Direct") or expense.get("Regular")
            if val:
                try:
                    return float(val)
                except (ValueError, TypeError):
                    pass
    
    return None


def percentile_rank(value: float, values: List[float], higher_better: bool = True) -> int:
    """Calculate percentile rank."""
    if not values or value is None:
        return 50
    valid = [v for v in values if v is not None]
    if not valid:
        return 50
    
    if higher_better:
        worse = sum(1 for v in valid if v < value)
    else:
        worse = sum(1 for v in valid if v > value)
    
    return max(1, min(100, round(worse / len(valid) * 100)))


def percentile_label(p: int) -> str:
    """Convert percentile to label."""
    if p >= 90: return "🏆 Top 10%"
    if p >= 75: return "⭐ Top 25%"
    if p >= 50: return "👍 Above Average"
    if p >= 25: return "📊 Below Average"
    return "⚠️ Bottom 25%"


SECTOR_COLORS = {
    "Financial Services": "#3B82F6", "Banks": "#3B82F6", "Banking": "#3B82F6",
    "Information Technology": "#8B5CF6", "IT": "#8B5CF6", "Technology": "#8B5CF6",
    "Healthcare": "#10B981", "Pharma": "#10B981", "Pharmaceuticals": "#10B981",
    "Automobile": "#F59E0B", "Auto": "#F59E0B",
    "Consumer Goods": "#EC4899", "FMCG": "#EC4899",
    "Oil & Gas": "#6366F1", "Energy": "#6366F1",
    "Metals": "#78716C", "Materials": "#78716C",
    "Construction": "#EAB308", "Real Estate": "#EAB308", "Infrastructure": "#EAB308",
    "Telecom": "#14B8A6", "Communication": "#14B8A6",
    "Utilities": "#06B6D4", "Power": "#06B6D4",
    "Chemicals": "#84CC16", "Industrial": "#64748B", "Services": "#A855F7",
    "Others": "#6B7280",
}


def get_sector_color(name: str) -> str:
    """Get color for sector."""
    if name in SECTOR_COLORS:
        return SECTOR_COLORS[name]
    for key, color in SECTOR_COLORS.items():
        if key.lower() in name.lower() or name.lower() in key.lower():
            return color
    return "#6B7280"


# =============================================================================
# SEARCH & LIST ENDPOINTS
# =============================================================================

@router.get("/search")
async def search_funds(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(20, le=50)
):
    """Search funds by name."""
    query = q.lower().strip()
    results = []
    
    for fund_name, fund in FUNDS_BY_NAME.items():
        if query in fund_name.lower():
            results.append({
                "fund_name": fund_name,
                "scheme_code": fund.get("canonical_code"),
                "category": get_fund_category(fund),
                "riskometer": fund.get("riskometer"),
                "fund_house": fund.get("fund_house"),
            })
            if len(results) >= limit:
                break
    
    return {"query": q, "count": len(results), "funds": results}


@router.get("/list-funds")
async def list_funds(
    limit: int = Query(20, le=100),
    category: Optional[str] = None
):
    """List available funds."""
    results = []
    
    for fund_name, fund in FUNDS_BY_NAME.items():
        if category:
            fund_cat = get_fund_category(fund).lower()
            if category.lower() not in fund_cat:
                continue
        
        results.append({
            "fund_name": fund_name,
            "scheme_code": fund.get("canonical_code"),
            "category": get_fund_category(fund),
            "main_category": fund.get("main_category"),
            "riskometer": fund.get("riskometer"),
        })
        
        if len(results) >= limit:
            break
    
    return {
        "total_funds": len(FUNDS_BY_NAME),
        "showing": len(results),
        "funds": results
    }


# =============================================================================
# PEER COMPARISON
# =============================================================================

@router.get("/peer-comparison/{fund_code}")
async def get_peer_comparison(fund_code: str):
    """Compare a fund against its category peers."""
    fund = get_fund(fund_code)
    
    fund_name = get_fund_name(fund)
    sub_category = fund.get("sub_category") or ""
    main_category = fund.get("main_category") or ""
    
    # Debug logging
    print(f"\n🔍 Peer comparison for fund_code: {fund_code}")
    print(f"   Fund name: {fund_name}")
    print(f"   Sub-category: '{sub_category}'")
    print(f"   Main-category: '{main_category}'")
    
    # Try sub_category first
    peers = get_category_funds(sub_category, exclude_code=fund_code)
    category_used = sub_category
    print(f"   Peers in sub_category '{sub_category}': {len(peers)}")
    
    # If not enough peers, try main_category
    if len(peers) < 3 and main_category and main_category.lower() != sub_category.lower():
        peers = get_category_funds(main_category, exclude_code=fund_code)
        category_used = main_category
        print(f"   Peers in main_category '{main_category}': {len(peers)}")
    
    # If still not enough peers, return partial data instead of error
    if len(peers) < 2:
        print(f"   ⚠️ Not enough peers found!")
        return {
            "fund_code": fund_code,
            "fund_name": fund_name,
            "category": category_used or sub_category or main_category or "Unknown",
            "main_category": main_category,
            "category_count": len(peers),
            "overall_percentile": 50,
            "overall_label": "Insufficient peer data",
            "riskometer": fund.get("riskometer") or fund.get("risk"),
            "metrics": {},
            "message": f"Only {len(peers)} peers found. Need at least 2 for comparison."
        }
    
    # Metrics to compare
    metrics_config = {
        "cagr": ("Overall CAGR (%)", True),
        "cagr_1y": ("1Y Returns (%)", True),
        "cagr_3y": ("3Y Returns (%)", True),
        "cagr_5y": ("5Y Returns (%)", True),
        "sharpe_ratio": ("Sharpe Ratio", True),
        "sortino_ratio": ("Sortino Ratio", True),
        "volatility": ("Volatility (%)", False),
        "max_drawdown": ("Max Drawdown (%)", False),
        "consistency_score": ("Consistency Score", True),
    }
    
    metrics = {}
    percentiles = []
    
    for key, (label, higher_better) in metrics_config.items():
        fund_val = get_metric(fund, key)
        if fund_val is None:
            continue
        
        # Convert decimals to percentages for display
        if key in ["cagr", "cagr_1y", "cagr_3y", "cagr_5y", "volatility", "max_drawdown"]:
            if abs(fund_val) < 1:
                fund_val = fund_val * 100
        
        # Get peer values
        peer_vals = []
        for p in peers:
            pv = get_metric(p, key)
            if pv is not None:
                if key in ["cagr", "cagr_1y", "cagr_3y", "cagr_5y", "volatility", "max_drawdown"]:
                    if abs(pv) < 1:
                        pv = pv * 100
                peer_vals.append(pv)
        
        if not peer_vals:
            continue
        
        avg = sum(peer_vals) / len(peer_vals)
        pct = percentile_rank(fund_val, peer_vals, higher_better)
        percentiles.append(pct)
        
        is_better = fund_val > avg if higher_better else fund_val < avg
        
        metrics[key] = {
            "label": label,
            "fund_value": round(fund_val, 2),
            "category_avg": round(avg, 2),
            "category_min": round(min(peer_vals), 2),
            "category_max": round(max(peer_vals), 2),
            "percentile": pct,
            "percentile_label": percentile_label(pct),
            "is_better": is_better,
            "higher_is_better": higher_better,
        }
    
    overall = round(sum(percentiles) / len(percentiles)) if percentiles else 50
    
    print(f"   ✅ Comparison complete: {len(metrics)} metrics, overall percentile: {overall}")
    
    return {
        "fund_code": fund_code,
        "fund_name": fund_name,
        "category": category_used,
        "main_category": main_category,
        "category_count": len(peers),
        "overall_percentile": overall,
        "overall_label": percentile_label(overall),
        "riskometer": fund.get("riskometer") or fund.get("risk"),
        "metrics": metrics,
    }


# =============================================================================
# SECTOR ALLOCATION
# =============================================================================

@router.get("/sector-allocation/{fund_code}")
async def get_sector_allocation(fund_code: str):
    """Get sector-wise allocation of a fund."""
    fund = get_fund(fund_code)
    
    fund_name = get_fund_name(fund)
    
    # Try multiple field names for sector data
    sectors = (
        fund.get("sector_allocation") or 
        fund.get("sectors") or 
        fund.get("portfolio_sectors") or
        fund.get("asset_allocation_sectors") or
        fund.get("holdings_by_sector") or
        {}
    )
    
    # Handle list format
    if isinstance(sectors, list):
        sector_dict = {}
        for item in sectors:
            if isinstance(item, dict):
                n = item.get("sector") or item.get("name")
                v = item.get("weight") or item.get("value") or item.get("percentage")
                if n and v:
                    sector_dict[n] = v
        sectors = sector_dict
    
    if not sectors:
        # Return fund info even without sector data
        return {
            "fund_code": fund_code,
            "fund_name": fund_name,
            "category": get_fund_category(fund),
            "riskometer": fund.get("riskometer"),
            "data_available": False,
            "message": "Sector allocation data not available. This data comes from monthly factsheets.",
            "asset_allocation": fund.get("asset_allocation"),
            "sectors": [],
            "total_sectors": 0,
            "top3_concentration": 0,
            "concentration_level": "Unknown",
        }
    
    # Format sectors for response
    sector_list = []
    for sector_name, alloc in sectors.items():
        try:
            val = float(alloc)
            sector_list.append({
                "name": sector_name,
                "weight": round(val, 2),  # Frontend expects "weight"
                "value": round(val, 2),   # Keep "value" for backward compatibility
                "color": get_sector_color(sector_name)
            })
        except (ValueError, TypeError):
            continue
    
    sector_list.sort(key=lambda x: x["weight"], reverse=True)
    
    # Calculate concentration
    top3 = 0
    concentration_level = "Unknown"
    if sector_list:
        values = [s["weight"] for s in sector_list]
        top3 = sum(sorted(values, reverse=True)[:3])
        
        if top3 > 70:
            concentration_level = "High"
        elif top3 > 50:
            concentration_level = "Moderate"
        else:
            concentration_level = "Diversified"
    
    return {
        "fund_code": fund_code,
        "fund_name": fund_name,
        "category": get_fund_category(fund),
        "data_available": True,
        "sectors": sector_list,
        "total_sectors": len(sector_list),
        "top3_concentration": round(top3, 1),
        "concentration_level": concentration_level,
        "as_of_date": fund.get("portfolio_date") or fund.get("as_of_date"),
        # Keep old format for backward compatibility
        "concentration": {
            "top_3_percentage": round(top3, 1),
            "risk_level": f"{concentration_level} ({'Concentrated' if concentration_level == 'High' else 'Diversified' if concentration_level == 'Diversified' else ''})",
            "sector_count": len(sector_list)
        },
    }


# =============================================================================
# OVERLAP ANALYSIS
# =============================================================================

@router.post("/overlap-analysis")
async def analyze_overlap(request: OverlapRequest):
    """Analyze stock overlap between multiple funds."""
    codes = request.fund_codes
    
    funds_info = []
    holdings_map = {}
    
    for code in codes:
        fund = get_fund(code)
        name = get_fund_name(fund)
        
        holdings = (
            fund.get("holdings") or 
            fund.get("portfolio_holdings") or 
            fund.get("top_holdings") or 
            fund.get("stocks") or
            []
        )
        
        stocks = set()
        if isinstance(holdings, list):
            for h in holdings:
                if isinstance(h, dict):
                    stock = h.get("stock_name") or h.get("name") or h.get("company_name")
                    if stock:
                        normalized = stock.upper().strip().replace(" LTD", "").replace(" LIMITED", "")
                        stocks.add(normalized)
                elif isinstance(h, str):
                    stocks.add(h.upper().strip())
        
        funds_info.append({
            "code": code, 
            "name": name, 
            "holdings_count": len(stocks),
            "category": get_fund_category(fund)
        })
        holdings_map[code] = stocks
    
    if not any(holdings_map.values()):
        raise HTTPException(
            status_code=400, 
            detail="Holdings data not available. Overlap analysis requires stock-level holdings data from factsheets."
        )
    
    # Calculate overlaps
    overlap_matrix = []
    
    for i, c1 in enumerate(codes):
        for c2 in codes[i+1:]:
            h1, h2 = holdings_map[c1], holdings_map[c2]
            if not h1 or not h2:
                continue
            
            common = h1 & h2
            union = h1 | h2
            overlap_pct = (len(common) / len(union) * 100) if union else 0
            
            n1 = next((f["name"] for f in funds_info if f["code"] == c1), c1)
            n2 = next((f["name"] for f in funds_info if f["code"] == c2), c2)
            
            overlap_matrix.append({
                "fund1_code": c1,
                "fund1_name": n1,
                "fund2_code": c2,
                "fund2_name": n2,
                "common_stocks": len(common),
                "overlap_percentage": round(overlap_pct, 1),
                "common_stock_names": sorted(list(common))[:15],
            })
    
    # Common to all
    all_holdings = [holdings_map[c] for c in codes if holdings_map[c]]
    common_all = set.intersection(*all_holdings) if all_holdings else set()
    unique_all = set.union(*all_holdings) if all_holdings else set()
    
    # Diversification
    total = sum(len(h) for h in holdings_map.values())
    div_score = round(len(unique_all) / total * 100, 1) if total else 0
    
    avg_overlap = sum(o["overlap_percentage"] for o in overlap_matrix) / len(overlap_matrix) if overlap_matrix else 0
    
    if avg_overlap > 50:
        risk = "High Overlap ⚠️"
        rec = "Consider replacing one fund with a different category"
    elif avg_overlap > 30:
        risk = "Moderate Overlap"
        rec = "Some overlap is normal for similar categories"
    else:
        risk = "Low Overlap ✅"
        rec = "Good diversification!"
    
    return {
        "funds": funds_info,
        "overlap_matrix": overlap_matrix,
        "common_to_all": sorted(list(common_all)),
        "unique_stocks_count": len(unique_all),
        "diversification_score": div_score,
        "average_overlap": round(avg_overlap, 1),
        "overlap_percentage": round(avg_overlap, 1),  # Alias for frontend
        "overlap_level": risk.split()[0],  # "High", "Moderate", or "Low"
        "risk_level": risk,
        "recommendation": rec,
    }


# =============================================================================
# FUND MANAGER
# =============================================================================

@router.get("/fund-manager/{fund_code}")
async def get_fund_manager(fund_code: str):
    """Get fund manager information."""
    fund = get_fund(fund_code)
    
    fund_name = get_fund_name(fund)
    
    managers = fund.get("managers") or fund.get("fund_managers") or fund.get("fund_manager") or fund.get("manager")
    
    if not managers:
        return {
            "fund_code": fund_code,
            "fund_name": fund_name,
            "data_available": False,
            "message": "Manager data not available"
        }
    
    if isinstance(managers, str):
        manager_list = [m.strip() for m in managers.split(",")]
    elif isinstance(managers, list):
        manager_list = managers
    else:
        manager_list = [str(managers)]
    
    # Find other funds by same managers
    other_funds = []
    primary_manager = manager_list[0] if manager_list else ""
    
    if primary_manager:
        for fname, f in FUNDS_BY_NAME.items():
            if fname == fund.get("_fund_name_key"):
                continue
            fm = f.get("managers") or f.get("fund_managers") or f.get("fund_manager") or ""
            if primary_manager.lower() in str(fm).lower():
                other_funds.append({
                    "fund_name": fname,
                    "code": f.get("canonical_code"),
                    "category": get_fund_category(f),
                })
                if len(other_funds) >= 5:
                    break
    
    return {
        "fund_code": fund_code,
        "fund_name": fund_name,
        "data_available": True,
        "managers": manager_list,
        "primary_manager": primary_manager,
        "other_funds_managed": other_funds,
    }


# =============================================================================
# HEALTH CHECK
# =============================================================================

@router.get("/health")
async def health():
    """Health check with category debug info."""
    sample_codes = list(FUNDS_BY_CODE.keys())[:5]
    sample_names = list(FUNDS_BY_NAME.keys())[:3]
    sample_categories = list(CATEGORY_INDEX.keys())[:15]
    
    # Count funds per category
    category_counts = {cat: len(funds) for cat, funds in list(CATEGORY_INDEX.items())[:10]}
    
    return {
        "status": "healthy",
        "funds_by_name": len(FUNDS_BY_NAME),
        "funds_by_code": len(FUNDS_BY_CODE),
        "categories_indexed": len(CATEGORY_INDEX),
        "sample_codes": sample_codes,
        "sample_names": sample_names,
        "sample_categories": sample_categories,
        "category_counts": category_counts,
    }
