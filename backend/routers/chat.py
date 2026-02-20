"""
Chat Router - LLM-Driven Agentic Chat (Fixed Version)
======================================================
FILE: backend/routers/chat.py

FIXED: Removed blocking vector service import at module level.
Vector service now loads lazily and won't crash the app.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import json
import os
from pathlib import Path
from dotenv import load_dotenv

# ============================================================
# REMOVED BLOCKING IMPORTS - These were crashing the app!
# ============================================================
# OLD (BROKEN):
# from services.vector_service import get_vector_service
# vector_svc = get_vector_service()  # <-- This blocked startup!

# NEW (SAFE): Vector service loads lazily via get_vectors()
# ============================================================

load_dotenv()

router = APIRouter(prefix="/api/chat", tags=["Chat"])


# =============================================================================
# CATEGORY MAPPING - Based on YOUR actual data
# =============================================================================

MAIN_CATEGORY_MAP = {
    "equity": "Equity",
    "debt": "Debt", 
    "hybrid": "Hybrid",
    "other": "Other",
    "solution oriented": "Solution Oriented",
    "solution": "Solution Oriented",
}

MAIN_TO_SUB_CATEGORIES = {
    "Debt": [
        "Banking and PSU Fund", "Corporate Bond Fund", "Credit Risk Fund", 
        "Dynamic Bond", "Floater Fund", "Gilt Fund", 
        "Gilt Fund with 10 year constant duration", "Liquid Fund", 
        "Long Duration Fund", "Low Duration Fund", "Medium Duration Fund", 
        "Medium to Long Duration Fund", "Money Market Fund", "Overnight Fund", 
        "Short Duration Fund", "Ultra Short Duration Fund"
    ],
    "Equity": [
        "Contra Fund", "Dividend Yield Fund", "ELSS", "Flexi Cap Fund", 
        "Focused Fund", "Large & Mid Cap Fund", "Large Cap Fund", "Mid Cap Fund", 
        "Multi Cap Fund", "Sectoral/ Thematic", "Small Cap Fund", "Value Fund"
    ],
    "Hybrid": [
        "Aggressive Hybrid Fund", "Arbitrage Fund", "Balanced Hybrid Fund", 
        "Conservative Hybrid Fund", "Dynamic Asset Allocation or Balanced Advantage", 
        "Equity Savings", "Multi Asset Allocation"
    ],
    "Other": [
        "FoF Domestic", "FoF Overseas", "Gold ETF", "Index Funds", 
        "Other  ETFs", "Uncategorized"
    ],
    "Solution Oriented": [
        "Children's Fund", "Retirement Fund"
    ],
}

SUB_CATEGORY_SYNONYMS = {
    # ==================== EQUITY ====================
    "equity": MAIN_TO_SUB_CATEGORIES["Equity"],
    "large cap": ["Large Cap Fund"],
    "largecap": ["Large Cap Fund"],
    "large-cap": ["Large Cap Fund"],
    "bluechip": ["Large Cap Fund"],
    "blue chip": ["Large Cap Fund"],
    "blue-chip": ["Large Cap Fund"],
    "mid cap": ["Mid Cap Fund"],
    "midcap": ["Mid Cap Fund"],
    "mid-cap": ["Mid Cap Fund"],
    "small cap": ["Small Cap Fund"],
    "smallcap": ["Small Cap Fund"],
    "small-cap": ["Small Cap Fund"],
    "flexi cap": ["Flexi Cap Fund"],
    "flexicap": ["Flexi Cap Fund"],
    "flexi-cap": ["Flexi Cap Fund"],
    "multi cap": ["Multi Cap Fund"],
    "multicap": ["Multi Cap Fund"],
    "multi-cap": ["Multi Cap Fund"],
    "large and mid cap": ["Large & Mid Cap Fund"],
    "large & mid cap": ["Large & Mid Cap Fund"],
    "large mid cap": ["Large & Mid Cap Fund"],
    "elss": ["ELSS"],
    "tax saving": ["ELSS"],
    "tax saver": ["ELSS"],
    "tax-saving": ["ELSS"],
    "80c": ["ELSS"],
    "section 80c": ["ELSS"],
    "sectoral": ["Sectoral/ Thematic"],
    "thematic": ["Sectoral/ Thematic"],
    "sector": ["Sectoral/ Thematic"],
    "sectoral thematic": ["Sectoral/ Thematic"],
    "pharma": ["Sectoral/ Thematic"],
    "banking": ["Sectoral/ Thematic"],
    "it": ["Sectoral/ Thematic"],
    "infrastructure": ["Sectoral/ Thematic"],
    "consumption": ["Sectoral/ Thematic"],
    "manufacturing": ["Sectoral/ Thematic"],
    "focused": ["Focused Fund"],
    "focused fund": ["Focused Fund"],
    "value": ["Value Fund"],
    "value fund": ["Value Fund"],
    "contra": ["Contra Fund"],
    "contra fund": ["Contra Fund"],
    "dividend yield": ["Dividend Yield Fund"],
    "dividend": ["Dividend Yield Fund"],
    
    # ==================== DEBT ====================
    "debt": MAIN_TO_SUB_CATEGORIES["Debt"],
    "bond": ["Corporate Bond Fund", "Gilt Fund", "Dynamic Bond", "Banking and PSU Fund"],
    "fixed income": MAIN_TO_SUB_CATEGORIES["Debt"],
    "liquid": ["Liquid Fund"],
    "liquid fund": ["Liquid Fund"],
    "overnight": ["Overnight Fund"],
    "overnight fund": ["Overnight Fund"],
    "money market": ["Money Market Fund"],
    "ultra short": ["Ultra Short Duration Fund"],
    "ultra short duration": ["Ultra Short Duration Fund"],
    "low duration": ["Low Duration Fund"],
    "short duration": ["Short Duration Fund"],
    "short term": ["Short Duration Fund", "Low Duration Fund", "Ultra Short Duration Fund"],
    "medium duration": ["Medium Duration Fund", "Medium to Long Duration Fund"],
    "medium term": ["Medium Duration Fund", "Medium to Long Duration Fund"],
    "long duration": ["Long Duration Fund", "Medium to Long Duration Fund"],
    "long term debt": ["Long Duration Fund"],
    "gilt": ["Gilt Fund", "Gilt Fund with 10 year constant duration"],
    "gilt fund": ["Gilt Fund", "Gilt Fund with 10 year constant duration"],
    "government bond": ["Gilt Fund", "Gilt Fund with 10 year constant duration"],
    "g-sec": ["Gilt Fund", "Gilt Fund with 10 year constant duration"],
    "gsec": ["Gilt Fund", "Gilt Fund with 10 year constant duration"],
    "10 year gilt": ["Gilt Fund with 10 year constant duration"],
    "corporate bond": ["Corporate Bond Fund"],
    "corporate": ["Corporate Bond Fund"],
    "banking and psu": ["Banking and PSU Fund"],
    "banking psu": ["Banking and PSU Fund"],
    "psu bond": ["Banking and PSU Fund"],
    "credit risk": ["Credit Risk Fund"],
    "credit": ["Credit Risk Fund"],
    "dynamic bond": ["Dynamic Bond"],
    "dynamic": ["Dynamic Bond"],
    "floater": ["Floater Fund"],
    "floating rate": ["Floater Fund"],
    
    # ==================== HYBRID ====================
    "hybrid": MAIN_TO_SUB_CATEGORIES["Hybrid"],
    "balanced": ["Balanced Hybrid Fund", "Dynamic Asset Allocation or Balanced Advantage"],
    "aggressive hybrid": ["Aggressive Hybrid Fund"],
    "aggressive": ["Aggressive Hybrid Fund"],
    "conservative hybrid": ["Conservative Hybrid Fund"],
    "conservative": ["Conservative Hybrid Fund"],
    "balanced hybrid": ["Balanced Hybrid Fund"],
    "balanced advantage": ["Dynamic Asset Allocation or Balanced Advantage"],
    "baf": ["Dynamic Asset Allocation or Balanced Advantage"],
    "dynamic asset allocation": ["Dynamic Asset Allocation or Balanced Advantage"],
    "dynamic asset": ["Dynamic Asset Allocation or Balanced Advantage"],
    "multi asset": ["Multi Asset Allocation"],
    "multi asset allocation": ["Multi Asset Allocation"],
    "multi-asset": ["Multi Asset Allocation"],
    "arbitrage": ["Arbitrage Fund"],
    "arbitrage fund": ["Arbitrage Fund"],
    "equity savings": ["Equity Savings"],
    
    # ==================== OTHER ====================
    "other": MAIN_TO_SUB_CATEGORIES["Other"],
    "index": ["Index Funds"],
    "index fund": ["Index Funds"],
    "index funds": ["Index Funds"],
    "nifty": ["Index Funds"],
    "nifty 50": ["Index Funds"],
    "sensex": ["Index Funds"],
    "passive": ["Index Funds"],
    "etf": ["Gold ETF", "Other  ETFs"],
    "exchange traded": ["Gold ETF", "Other  ETFs"],
    "gold": ["Gold ETF"],
    "gold etf": ["Gold ETF"],
    "gold fund": ["Gold ETF"],
    "fof": ["FoF Domestic", "FoF Overseas"],
    "fund of funds": ["FoF Domestic", "FoF Overseas"],
    "fof domestic": ["FoF Domestic"],
    "fof overseas": ["FoF Overseas"],
    "international": ["FoF Overseas"],
    "overseas": ["FoF Overseas"],
    "global": ["FoF Overseas"],
    "foreign": ["FoF Overseas"],
    "us equity": ["FoF Overseas"],
    
    # ==================== SOLUTION ORIENTED ====================
    "solution oriented": MAIN_TO_SUB_CATEGORIES["Solution Oriented"],
    "solution": MAIN_TO_SUB_CATEGORIES["Solution Oriented"],
    "retirement": ["Retirement Fund"],
    "retirement fund": ["Retirement Fund"],
    "pension": ["Retirement Fund"],
    "nps": ["Retirement Fund"],
    "children": ["Children's Fund"],
    "children's": ["Children's Fund"],
    "children fund": ["Children's Fund"],
    "child": ["Children's Fund"],
    "kids": ["Children's Fund"],
}


# =============================================================================
# DATA LOADING
# =============================================================================

def load_funds():
    """Load funds and create indexes."""
    paths = [
        Path(__file__).parent.parent / "data" / "scheme_metrics_merged.json",
        Path("./data/scheme_metrics_merged.json"),
        Path("/app/data/scheme_metrics_merged.json"),
    ]
    
    raw_data = {}
    for p in paths:
        if p.exists():
            with open(p, encoding='utf-8') as f:
                raw_data = json.load(f)
            print(f"✅ Loaded funds from {p}")
            break
    
    if not raw_data:
        print("⚠️ Fund data not found")
        return {}, {}, {}, {}
    
    code_index = {}
    sub_category_index = {}
    main_category_index = {}
    
    for fund_name, fund_data in raw_data.items():
        fund_data["_fund_name_key"] = fund_name
        
        canonical = fund_data.get("canonical_code")
        if canonical:
            code_index[str(canonical)] = fund_data
        
        for variant in fund_data.get("variants", []):
            amfi = variant.get("amfi_code")
            if amfi:
                code_index[str(amfi)] = fund_data
        
        sub_cat = fund_data.get("sub_category") or "Uncategorized"
        if sub_cat not in sub_category_index:
            sub_category_index[sub_cat] = []
        sub_category_index[sub_cat].append(fund_data)
        
        main_cat = fund_data.get("main_category") or "Other"
        if main_cat not in main_category_index:
            main_category_index[main_cat] = []
        main_category_index[main_cat].append(fund_data)
    
    print(f"📊 Indexed {len(raw_data)} funds, {len(code_index)} codes")
    
    return raw_data, code_index, sub_category_index, main_category_index


FUNDS_BY_NAME, FUNDS_BY_CODE, FUNDS_BY_SUB_CATEGORY, FUNDS_BY_MAIN_CATEGORY = load_funds()


# =============================================================================
# SERVICES - ALL LAZY LOADED (won't block startup)
# =============================================================================

_llm_client = None
_vectors = None
_profiler = None
_vector_status = {"available": False, "loading": False, "error": None, "documents": 0}


def get_openai_client():
    """Lazy load OpenAI client with proper timeout settings."""
    global _llm_client
    if _llm_client is None:
        try:
            from openai import OpenAI
            import httpx
            
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                print("⚠️ OPENAI_API_KEY not found!")
                return None
            
            # Create client with extended timeout for Cloud Run
            _llm_client = OpenAI(
                api_key=api_key,
                timeout=httpx.Timeout(60.0, connect=10.0),  # 60s total, 10s connect
                max_retries=2
            )
            print(f"✅ OpenAI client ready")
        except Exception as e:
            print(f"⚠️ OpenAI unavailable: {e}")
    return _llm_client


def get_vectors():
    """Lazy load vector service - won't crash if unavailable."""
    global _vectors, _vector_status
    
    if _vectors is not None:
        return _vectors
    
    try:
        from services.vector_service import VectorService
        _vectors = VectorService()
        _vector_status["available"] = True
        
        # Check if ready
        if hasattr(_vectors, 'get_stats'):
            stats = _vectors.get_stats()
            _vector_status["documents"] = stats.get('total_vectors', 0)
            _vector_status["loading"] = stats.get('loading', False)
        
        print(f"✅ Vector service ready")
    except ImportError as e:
        _vector_status["error"] = f"Import error: {e}"
        print(f"⚠️ Vector service import error: {e}")
    except Exception as e:
        _vector_status["error"] = str(e)
        print(f"⚠️ Vector service error: {e}")
    
    return _vectors


def search_funds_semantic(query: str, n_results: int = 5) -> List[Dict]:
    """Search funds using vector similarity - safe wrapper."""
    svc = get_vectors()
    
    if svc is None:
        return []
    
    try:
        if hasattr(svc, 'is_ready') and not svc.is_ready():
            return []
        return svc.search(query, n_results=n_results)
    except Exception as e:
        print(f"⚠️ Vector search error: {e}")
        return []


def get_profiler():
    """Lazy load risk profiler."""
    global _profiler
    if _profiler is None:
        try:
            from services.risk_profiler_v2 import RiskProfilerV2
            _profiler = RiskProfilerV2()
        except Exception as e:
            print(f"⚠️ Profiler unavailable: {e}")
    return _profiler


# =============================================================================
# FUND HELPERS
# =============================================================================

def get_fund(code: str) -> Optional[Dict]:
    code_str = str(code).strip()
    return FUNDS_BY_CODE.get(code_str) or FUNDS_BY_NAME.get(code_str)


def get_fund_score(fund: Dict) -> float:
    """Get score from pre-calculated field, or calculate if missing."""
    # First, try to use pre-calculated score from JSON
    score_data = fund.get("score", {})
    if isinstance(score_data, dict) and score_data.get("total") is not None:
        return float(score_data.get("total", 0))
    
    # Fallback: calculate from metrics
    metrics = fund.get("metrics", {})
    if not metrics:
        return 0
    
    score = 0
    
    # Returns (40 points)
    cagr = metrics.get('cagr', 0) or 0
    if cagr > 0.15: score += 20
    elif cagr > 0.12: score += 15
    elif cagr > 0.10: score += 10
    elif cagr > 0.08: score += 5
    
    rolling_3y = metrics.get('rolling_3y', 0) or 0
    if rolling_3y > 0.15: score += 10
    elif rolling_3y > 0.12: score += 7
    elif rolling_3y > 0.10: score += 5
    
    consistency = metrics.get('consistency_score', 0) or 0
    if consistency > 70: score += 10
    elif consistency > 60: score += 7
    elif consistency > 50: score += 5
    
    # Risk (30 points)
    sharpe = metrics.get('sharpe', 0) or 0
    if sharpe > 2: score += 15
    elif sharpe > 1: score += 10
    elif sharpe > 0.5: score += 5
    
    max_dd = metrics.get('max_drawdown', 0) or 0
    if max_dd > -0.20: score += 10
    elif max_dd > -0.30: score += 5
    
    sortino = metrics.get('sortino', 0) or 0
    if sortino > 2: score += 5
    elif sortino > 1: score += 3
    
    return min(score, 100)


def format_fund_for_response(fund: Dict) -> Dict:
    """Format fund for API response."""
    metrics = fund.get("metrics", {})
    score = get_fund_score(fund)
    
    # Get score tier info
    score_data = fund.get("score", {})
    tier_data = score_data.get("tier", {}) if isinstance(score_data, dict) else {}
    
    expense = fund.get("annual_expense", {})
    direct_expense = None
    if isinstance(expense, dict):
        try:
            direct_expense = float(expense.get("Direct", 0))
        except:
            pass
    
    # NOTE: abs_return_1y in JSON is already a decimal (e.g., 0.15 = 15%)
    # We send it as-is (decimal), frontend should multiply by 100 for display
    # OR we send as percentage and frontend should NOT multiply
    # Current: Send as percentage (already * 100) for direct display
    
    return {
        "scheme_code": fund.get("canonical_code"),
        "fund_name": fund.get("_fund_name_key") or fund.get("parent_scheme_name"),
        "name": fund.get("_fund_name_key") or fund.get("parent_scheme_name"),  # Alias for frontend
        "category": fund.get("sub_category"),
        "main_category": fund.get("main_category"),
        "risk_level": fund.get("riskometer"),
        "riskometer": fund.get("riskometer"),  # Alias for frontend
        "amc": fund.get("amc_name") or fund.get("fund_house"),
        "score": round(score, 1),
        "score_tier": tier_data.get("name", "unknown"),
        "score_label": tier_data.get("label", ""),
        "metrics": {
            # These are ALREADY percentages - frontend should display directly
            "cagr": round((metrics.get("cagr") or 0) * 1, 2),
            "return_1y": round((metrics.get("abs_return_1y") or 0) * 1, 2),  # Already %
            "return_3y": round((metrics.get("rolling_3y") or 0) * 1, 2) if metrics.get("rolling_3y") else None,
            "sharpe": round(metrics.get("sharpe") or 0, 2),
            "volatility": round((metrics.get("volatility") or 0) * 1, 2),
            "max_drawdown": round((metrics.get("max_drawdown") or 0) * 1, 2),
        },
        "expense_ratio": direct_expense,
        "expense_direct": direct_expense,  # Alias for frontend
        "aum": fund.get("aum"),
    }


# =============================================================================
# TOOL FUNCTIONS
# =============================================================================

def map_category(query: str) -> List[str]:
    """Map user query to actual sub_category values."""
    query_lower = query.lower().strip()
    
    if query_lower in MAIN_CATEGORY_MAP:
        main = MAIN_CATEGORY_MAP[query_lower]
        return MAIN_TO_SUB_CATEGORIES.get(main, [])
    
    if query_lower in SUB_CATEGORY_SYNONYMS:
        return SUB_CATEGORY_SYNONYMS[query_lower]
    
    for key, categories in SUB_CATEGORY_SYNONYMS.items():
        if key in query_lower:
            return categories
    
    return []


def tool_search_funds(query: str, category: str = None, limit: int = 5) -> List[Dict]:
    """Search funds by name or keywords."""
    results = []
    query_lower = query.lower()
    
    # Try semantic search first
    semantic_results = search_funds_semantic(query, n_results=limit)
    if semantic_results:
        for sr in semantic_results:
            fund = get_fund(sr.get("fund_code", ""))
            if fund:
                results.append(format_fund_for_response(fund))
        if len(results) >= limit:
            return results[:limit]
    
    # Fallback to text search
    for name, fund in FUNDS_BY_NAME.items():
        if query_lower in name.lower():
            results.append(format_fund_for_response(fund))
            if len(results) >= limit:
                break
    
    return sorted(results, key=lambda x: x.get("score", 0), reverse=True)[:limit]


def tool_get_fund_details(fund_code: str) -> Dict:
    """Get detailed fund info by scheme code."""
    fund = get_fund(fund_code)
    if not fund:
        return {"error": f"Fund {fund_code} not found"}
    return format_fund_for_response(fund)


def tool_get_top_funds(category: str, limit: int = 5) -> List[Dict]:
    """Get top funds in a category sorted by score."""
    sub_categories = map_category(category)
    
    if not sub_categories:
        return [{"error": f"Category '{category}' not recognized"}]
    
    funds = []
    for sub_cat in sub_categories:
        funds.extend(FUNDS_BY_SUB_CATEGORY.get(sub_cat, []))
    
    if not funds:
        return [{"error": f"No funds found for '{category}'"}]
    
    scored = [(fund, get_fund_score(fund)) for fund in funds]
    scored.sort(key=lambda x: x[1], reverse=True)
    
    return [format_fund_for_response(f) for f, _ in scored[:limit]]


def tool_compare_funds(fund_codes: List[str]) -> List[Dict]:
    """Compare multiple funds."""
    results = []
    for code in fund_codes[:5]:
        fund = get_fund(code)
        if fund:
            results.append(format_fund_for_response(fund))
    return results


def tool_calculate_risk_profile(age: int, investment_horizon: int, risk_tolerance: str) -> Dict:
    """Calculate risk profile."""
    score = 50
    
    if age < 30: score += 20
    elif age < 40: score += 10
    elif age > 50: score -= 10
    
    if investment_horizon > 10: score += 20
    elif investment_horizon > 5: score += 10
    elif investment_horizon < 3: score -= 10
    
    if risk_tolerance == "high": score += 15
    elif risk_tolerance == "low": score -= 15
    
    score = max(10, min(100, score))
    
    if score >= 70:
        profile = "Aggressive"
        allocation = {"equity": 80, "debt": 15, "gold": 5}
        suitable = ["Small Cap", "Mid Cap", "Sectoral"]
    elif score >= 50:
        profile = "Moderate"
        allocation = {"equity": 60, "debt": 30, "gold": 10}
        suitable = ["Flexi Cap", "Large & Mid Cap", "Balanced Advantage"]
    else:
        profile = "Conservative"
        allocation = {"equity": 30, "debt": 60, "gold": 10}
        suitable = ["Large Cap", "Conservative Hybrid", "Short Duration Debt"]
    
    return {
        "profile": profile,
        "score": score,
        "allocation": allocation,
        "suitable_categories": suitable
    }


# =============================================================================
# TOOLS DEFINITION FOR OPENAI
# =============================================================================

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_funds",
            "description": "Search for mutual funds by name, AMC, or keywords.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search term"},
                    "category": {"type": "string", "description": "Optional category filter"},
                    "limit": {"type": "integer", "description": "Max results (default 5)"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_fund_details",
            "description": "Get detailed info for a specific fund by scheme code.",
            "parameters": {
                "type": "object",
                "properties": {
                    "fund_code": {"type": "string", "description": "AMFI scheme code"}
                },
                "required": ["fund_code"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_top_funds",
            "description": "Get top-rated funds in a category. Categories: large cap, mid cap, small cap, flexi cap, elss, index, debt, liquid, gilt, hybrid, balanced advantage, etc.",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {"type": "string", "description": "Fund category"},
                    "limit": {"type": "integer", "description": "Number of funds (default 5)"}
                },
                "required": ["category"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "compare_funds",
            "description": "Compare multiple funds side by side.",
            "parameters": {
                "type": "object",
                "properties": {
                    "fund_codes": {"type": "array", "items": {"type": "string"}, "description": "Scheme codes to compare"}
                },
                "required": ["fund_codes"]
            }
        }
    },
    {
        "type": "function", 
        "function": {
            "name": "calculate_risk_profile",
            "description": "Calculate user's risk profile based on age, horizon, and tolerance.",
            "parameters": {
                "type": "object",
                "properties": {
                    "age": {"type": "integer", "description": "User's age"},
                    "investment_horizon": {"type": "integer", "description": "Years to invest"},
                    "risk_tolerance": {"type": "string", "enum": ["low", "moderate", "high"]}
                },
                "required": ["age", "investment_horizon", "risk_tolerance"]
            }
        }
    }
]


# =============================================================================
# SYSTEM PROMPT
# =============================================================================

SYSTEM_PROMPT = """You are MF Bestie 🎯, a friendly mutual fund advisor for Indian investors.

TOOLS AVAILABLE:
1. get_top_funds - Get best funds in a category (sorted by score)
2. search_funds - Search for specific funds by name
3. get_fund_details - Get details by scheme code
4. compare_funds - Compare multiple funds
5. calculate_risk_profile - Calculate risk level

YOUR DATABASE HAS 5 MAIN CATEGORIES:

📈 **EQUITY** (484 funds): Large Cap, Mid Cap, Small Cap, Flexi Cap, Multi Cap, ELSS, Sectoral/Thematic, Focused, Value, Contra

🏦 **DEBT** (324 funds): Liquid, Overnight, Money Market, Ultra Short, Short Duration, Medium Duration, Long Duration, Gilt, Corporate Bond, Banking & PSU, Credit Risk, Dynamic Bond, Floater

⚖️ **HYBRID** (171 funds): Aggressive Hybrid, Conservative Hybrid, Balanced, Balanced Advantage, Multi Asset, Arbitrage, Equity Savings

📊 **OTHER** (764 funds): Index Funds, ETFs, Gold ETF, FoF Domestic, FoF Overseas

🎯 **SOLUTION ORIENTED** (42 funds): Retirement Fund, Children's Fund

RULES:
- ALWAYS show Score: "Fund Name (Score: 78/100 ⭐)"
- Recommend Direct plans (lower expense)
- Use actual data from tools - never invent numbers
- Keep responses under 250 words
- Use ₹ for amounts

SCORE: 80-100 🏆 | 65-79 ⭐ | 50-64 👍 | <50 Below Average
"""


# =============================================================================
# EXECUTE TOOL
# =============================================================================

def execute_tool(tool_name: str, arguments: Dict) -> Any:
    if tool_name == "search_funds":
        return tool_search_funds(arguments.get("query", ""), arguments.get("category"), arguments.get("limit", 5))
    elif tool_name == "get_fund_details":
        return tool_get_fund_details(arguments.get("fund_code", ""))
    elif tool_name == "get_top_funds":
        return tool_get_top_funds(arguments.get("category", ""), arguments.get("limit", 5))
    elif tool_name == "compare_funds":
        return tool_compare_funds(arguments.get("fund_codes", []))
    elif tool_name == "calculate_risk_profile":
        return tool_calculate_risk_profile(
            arguments.get("age", 30), 
            arguments.get("investment_horizon", 5), 
            arguments.get("risk_tolerance", "moderate")
        )
    return {"error": f"Unknown tool: {tool_name}"}


# =============================================================================
# MODELS
# =============================================================================

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: List[ChatMessage] = Field(default=[])
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    message: str
    intent: str
    confidence: float
    data: Optional[Dict[str, Any]] = None
    suggestions: List[str] = []

class RiskProfileRequest(BaseModel):
    answers: Dict[str, int]


# =============================================================================
# MAIN ENDPOINT
# =============================================================================

@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    message = request.message.strip()
    history = request.history
    prev_context = request.context
    
    print(f"\n{'='*60}")
    print(f"📩 MESSAGE: {message}")
    
    client = get_openai_client()
    if not client:
        return ChatResponse(
            message="Sorry, connection issue. Try again.", 
            intent="error", 
            confidence=0, 
            suggestions=["Try again"]
        )
    
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    for msg in history[-10:]:
        messages.append({"role": msg.role, "content": msg.content})
    
    messages.append({"role": "user", "content": message})
    
    if prev_context and prev_context.get("funds"):
        fund_summary = "Previously discussed funds:\n"
        for code, fund in list(prev_context["funds"].items())[:5]:
            name = fund.get("fund_name", fund.get("parent_scheme_name", "Unknown"))
            score = fund.get("score", "N/A")
            fund_summary += f"- {name} (Code: {code}, Score: {score})\n"
        messages.insert(1, {"role": "system", "content": f"CONTEXT:\n{fund_summary}"})
    
    fund_data = {}
    
    try:
        print("🤖 Calling LLM...")
        response = client.chat.completions.create(
            model="gpt-4o", 
            messages=messages, 
            tools=TOOLS, 
            tool_choice="auto", 
            max_tokens=1000,
            timeout=55.0  # Slightly less than Cloud Run timeout
        )
        response_message = response.choices[0].message
        
        if response_message.tool_calls:
            print(f"🔧 Tools: {[t.function.name for t in response_message.tool_calls]}")
            messages.append(response_message)
            
            for tool_call in response_message.tool_calls:
                result = execute_tool(
                    tool_call.function.name, 
                    json.loads(tool_call.function.arguments)
                )
                
                if isinstance(result, list):
                    for f in result:
                        if f and f.get("scheme_code"):
                            fund_data[f["scheme_code"]] = f
                elif isinstance(result, dict) and result.get("scheme_code"):
                    fund_data[result["scheme_code"]] = result
                
                messages.append({
                    "role": "tool", 
                    "tool_call_id": tool_call.id, 
                    "content": json.dumps(result, default=str)
                })
            
            final = client.chat.completions.create(
                model="gpt-4o", 
                messages=messages, 
                max_tokens=1000
            )
            response_text = final.choices[0].message.content
        else:
            response_text = response_message.content
        
        print(f"✅ Done")
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"❌ Error: {e}")
        print(f"❌ Details: {error_details}")
        return ChatResponse(
            message=f"Sorry, I'm having trouble connecting. Please try again in a moment.", 
            intent="error", 
            confidence=0, 
            suggestions=["Try again"],
            data={"error_type": type(e).__name__, "error": str(e)}
        )
    
    print(f"{'='*60}\n")
    
    suggestions = (
        ["Tell me more", "Compare top 2", "Exit load?"] 
        if fund_data 
        else ["Best large cap", "Top ELSS", "Risk profile?"]
    )
    
    return ChatResponse(
        message=response_text, 
        intent="llm_driven", 
        confidence=0.95, 
        data={"funds": fund_data} if fund_data else None, 
        suggestions=suggestions
    )


# =============================================================================
# OTHER ENDPOINTS
# =============================================================================

@router.post("/risk-profile")
async def risk_profile_endpoint(request: RiskProfileRequest):
    profiler = get_profiler()
    if not profiler:
        return {"error": "Risk profiler not available"}
    
    from services.risk_profiler_v2 import profile_to_dict
    return profile_to_dict(profiler.calculate_from_answers(request.answers))


@router.get("/risk-questions")
async def risk_questions():
    profiler = get_profiler()
    if not profiler:
        return {"questions": [], "error": "Profiler not available"}
    return {
        "questions": profiler.get_all_questions(), 
        "required": ["age", "goal_horizon", "loss_tolerance"]
    }


@router.get("/suggestions")
async def suggestions():
    return {
        "starters": [
            "Best large cap funds 📈", 
            "Top ELSS for tax saving 💰", 
            "Best debt funds 🏦", 
            "Top index funds 📊", 
            "What's my risk profile? 🎯"
        ]
    }


@router.get("/health")
async def health():
    """Health check endpoint."""
    global _vector_status
    
    # Try to get vector service status
    svc = get_vectors()
    if svc and hasattr(svc, 'get_stats'):
        try:
            stats = svc.get_stats()
            _vector_status["available"] = True
            _vector_status["documents"] = stats.get('total_vectors', 0)
            _vector_status["loading"] = stats.get('loading', False)
            _vector_status["error"] = stats.get('error')
        except:
            pass
    
    return {
        "status": "healthy",
        "llm_available": get_openai_client() is not None,
        "vector_service_available": _vector_status["available"],
        "vector_documents": _vector_status["documents"],
        "vector_loading": _vector_status.get("loading", False),
        "vector_error": _vector_status.get("error"),
        "funds_loaded": len(FUNDS_BY_NAME),
        "main_categories": list(FUNDS_BY_MAIN_CATEGORY.keys())
    }


@router.get("/debug/vector")
async def debug_vector():
    """Debug endpoint to check vector service status."""
    svc = get_vectors()
    if svc and hasattr(svc, 'debug_info'):
        return svc.debug_info()
    return {"error": "Vector service not available", "svc_type": str(type(svc))}
