"""
Analytics Router - Peer Comparison, Sector Allocation, Overlap Analysis
========================================================================
FILE: backend/routers/analytics.py

UPDATED: Handles JSON structure where keys are fund names and codes are 
stored inside as canonical_code and amfi_code in variants.

ENDPOINTS:
    GET  /api/analytics/peer-comparison/{fund_code}   - Compare fund vs category
    GET  /api/analytics/sector-allocation/{fund_code} - Get sector breakdown
    POST /api/analytics/overlap-analysis              - Analyze portfolio overlap
    GET  /api/analytics/fund-manager/{fund_code}      - Fund manager details
    GET  /api/analytics/search                        - Search funds by name
    GET  /api/analytics/list-funds                    - List all funds
    GET  /api/analytics/health                        - Health check
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
                break
    
    if not raw_data:
        print("⚠️ Fund data not found")
        return {}, {}
    
    # Create code-to-fund lookup index
    # Maps: scheme_code -> fund_data
    code_index = {}
    
    for fund_name, fund_data in raw_data.items():
        # Add the fund name as a field for easy access
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
    
    print(f"📊 Analytics: Loaded {len(raw_data)} funds")
    print(f"📊 Analytics: Indexed {len(code_index)} scheme codes")
    
    return raw_data, code_index


# Load data at startup
FUNDS_BY_NAME, FUNDS_BY_CODE = load_funds()


# =============================================================================
# MODELS
# =============================================================================

class OverlapRequest(BaseModel):
    fund_codes: List[str] = Field(..., min_items=2, max_items=5)


# =============================================================================
# HELPERS
# =============================================================================

def get_fund(code: str) -> Dict:
    """
    Get fund by scheme code (canonical_code or amfi_code).
    """
    code_str = str(code).strip()
    
    # Try code index first
    if code_str in FUNDS_BY_CODE:
        return FUNDS_BY_CODE[code_str]
    
    # Try as fund name (in case someone passes the name)
    if code_str in FUNDS_BY_NAME:
        return FUNDS_BY_NAME[code_str]
    
    # Try partial name match
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


def get_category_funds(category: str) -> List[Dict]:
    """Get all funds in a category."""
    if not category:
        return []
    
    cat_lower = category.lower().strip()
    results = []
    
    for fund_name, fund in FUNDS_BY_NAME.items():
        fund_cat = get_fund_category(fund).lower().strip()
        # Match on sub_category or main_category
        if cat_lower in fund_cat or fund_cat in cat_lower:
            results.append(fund)
    
    return results


def get_metric(fund: Dict, key: str) -> Optional[float]:
    """
    Get a metric value from fund data.
    Handles nested metrics structure.
    """
    # First check in nested 'metrics' dict
    metrics = fund.get("metrics", {})
    
    # Mapping of common names to your actual field names
    field_mapping = {
        "cagr_1y": ["abs_return_1y", "rolling_1y"],
        "cagr_3y": ["rolling_3y", "abs_return_3y"],
        "cagr_5y": ["rolling_5y", "abs_return_5y"],
        "sharpe_ratio": ["sharpe"],
        "sortino_ratio": ["sortino"],
        "volatility": ["volatility"],
        "max_drawdown": ["max_drawdown"],
        "expense_ratio": [],  # Will check annual_expense separately
        "consistency_score": ["consistency_score"],
    }
    
    # Try to find the metric
    aliases = field_mapping.get(key, [key])
    
    for alias in aliases:
        # Check in metrics dict
        val = metrics.get(alias)
        if val is not None:
            try:
                return float(val)
            except (ValueError, TypeError):
                pass
        
        # Check at top level
        val = fund.get(alias)
        if val is not None:
            try:
                return float(val)
            except (ValueError, TypeError):
                pass
    
    # Special handling for expense_ratio
    if key == "expense_ratio":
        annual_expense = fund.get("annual_expense", {})
        if isinstance(annual_expense, dict):
            # Prefer Direct plan expense
            val = annual_expense.get("Direct") or annual_expense.get("Regular")
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
    category = get_fund_category(fund)
    peers = get_category_funds(category)
    
    if len(peers) < 2:
        # Try broader category
        main_cat = fund.get("main_category", "")
        if main_cat:
            peers = get_category_funds(main_cat)
    
    if len(peers) < 2:
        raise HTTPException(
            status_code=400, 
            detail=f"Not enough peers in category '{category}' (found {len(peers)})"
        )
    
    # Metrics to compare
    metrics_config = {
        "cagr_1y": ("1Y Returns (%)", True),
        "cagr_3y": ("3Y Returns (%)", True),
        "cagr_5y": ("5Y Returns (%)", True),
        "sharpe_ratio": ("Sharpe Ratio", True),
        "sortino_ratio": ("Sortino Ratio", True),
        "volatility": ("Volatility", False),
        "max_drawdown": ("Max Drawdown", False),
        "expense_ratio": ("Expense Ratio (%)", False),
        "consistency_score": ("Consistency Score", True),
    }
    
    metrics = {}
    percentiles = []
    
    for key, (label, higher_better) in metrics_config.items():
        fund_val = get_metric(fund, key)
        if fund_val is None:
            continue
        
        # For returns stored as decimals (0.12 = 12%), convert to percentage
        if key in ["cagr_1y", "cagr_3y", "cagr_5y", "volatility", "max_drawdown"]:
            if abs(fund_val) < 1:  # Likely decimal format
                fund_val = fund_val * 100
        
        # Get peer values
        peer_vals = []
        for p in peers:
            pv = get_metric(p, key)
            if pv is not None:
                if key in ["cagr_1y", "cagr_3y", "cagr_5y", "volatility", "max_drawdown"]:
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
    
    return {
        "fund_code": fund_code,
        "fund_name": fund_name,
        "category": category,
        "main_category": fund.get("main_category"),
        "category_count": len(peers),
        "overall_percentile": overall,
        "overall_label": percentile_label(overall),
        "riskometer": fund.get("riskometer"),
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
            "asset_allocation": fund.get("asset_allocation"),  # Return the text-based allocation if available
            "sectors": []
        }
    
    # Format sectors
    sector_list = []
    for sector_name, alloc in sectors.items():
        try:
            val = float(alloc)
            sector_list.append({
                "name": sector_name,
                "value": round(val, 2),
                "color": get_sector_color(sector_name)
            })
        except (ValueError, TypeError):
            continue
    
    sector_list.sort(key=lambda x: x["value"], reverse=True)
    
    # Concentration metrics
    concentration = None
    if sector_list:
        values = [s["value"] for s in sector_list]
        top3 = sum(sorted(values, reverse=True)[:3])
        
        if top3 > 70:
            risk = "High (Concentrated)"
        elif top3 > 50:
            risk = "Moderate"
        else:
            risk = "Low (Diversified)"
        
        concentration = {
            "top_3_percentage": round(top3, 1),
            "risk_level": risk,
            "sector_count": len(sector_list)
        }
    
    return {
        "fund_code": fund_code,
        "fund_name": fund_name,
        "category": get_fund_category(fund),
        "data_available": True,
        "sectors": sector_list,
        "concentration": concentration,
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
        
        # Get holdings
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
    
    # Get manager info - in your JSON it's "fund_managers" as a string
    managers = fund.get("fund_managers") or fund.get("fund_manager") or fund.get("manager")
    
    if not managers:
        return {
            "fund_code": fund_code,
            "fund_name": fund_name,
            "data_available": False,
            "message": "Manager data not available"
        }
    
    # Parse managers string if needed (e.g., "Mr. Mayur Patel, Mr. Ashish Ongari")
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
            fm = f.get("fund_managers") or f.get("fund_manager") or ""
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
    """Health check."""
    sample_codes = list(FUNDS_BY_CODE.keys())[:5]
    sample_names = list(FUNDS_BY_NAME.keys())[:3]
    
    return {
        "status": "healthy",
        "funds_by_name": len(FUNDS_BY_NAME),
        "funds_by_code": len(FUNDS_BY_CODE),
        "sample_codes": sample_codes,
        "sample_names": sample_names,
    }
