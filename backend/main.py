from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path

app = FastAPI(title="MF Advisor API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== IMPORTANT: UPDATE THIS PATH =====
# Point to where your scheme_metrics_merged.json is located
# Example: If your file is at C:\Users\YourName\Desktop\MutualFundAdvisor\data\scheme_metrics_merged.json
DATA_PATH = Path(r"../data/scheme_metrics_merged.json")
# =======================================

# Load data
try:
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        FUNDS_DATA = json.load(f)
    print(f"✅ Loaded {len(FUNDS_DATA)} funds")
except FileNotFoundError:
    print(f"❌ File not found: {DATA_PATH}")
    print("Please update DATA_PATH in main.py")
    FUNDS_DATA = {}
except Exception as e:
    print(f"❌ Error: {e}")
    FUNDS_DATA = {}

@app.get("/")
def health_check():
    return {
        "status": "yo! api is lit 🔥",
        "funds_loaded": len(FUNDS_DATA)
    }

@app.get("/api/funds/search")
def search_funds(q: str = ""):
    if len(q) < 2:
        return {"results": []}
    
    results = []
    for name, data in FUNDS_DATA.items():
        if q.lower() in name.lower():
            metrics = data.get("metrics", {})
            results.append({
                "name": name,
                "code": data.get("canonical_code"),
                "type": data.get("fund_type"),
                "cagr": round(metrics.get("cagr", 0) * 100, 2),
                "risk": data.get("riskometer")
            })
    
    results.sort(key=lambda x: x["cagr"], reverse=True)
    return {"results": results[:20]}

@app.get("/api/funds/{code}")
def get_fund_details(code: str):
    for name, data in FUNDS_DATA.items():
        if data.get("canonical_code") == code:
            metrics = data.get("metrics", {})
            return {
                "name": name,
                "code": code,
                "type": data.get("fund_type"),
                "risk": data.get("riskometer"),
                "objective": data.get("investment_objective"),
                "benchmark": data.get("benchmark"),
                "managers": data.get("fund_managers"),
                "expense": data.get("annual_expense"),
                "exit_load": data.get("exit_load"),
                "fund_age": metrics.get("fund_age_years"),
                "asset_allocation": data.get("asset_allocation"),  # NEW
                "variants": data.get("variants"),  # NEW
                "metrics": {
                    "return_1y": metrics.get("rolling_1y"),
                    "return_3y": metrics.get("rolling_3y"),
                    "return_5y": metrics.get("rolling_5y"),
                    "cagr": metrics.get("cagr"),
                    "volatility": metrics.get("volatility"),
                    "sharpe": metrics.get("sharpe"),
                    "sortino": metrics.get("sortino"),
                    "max_drawdown": metrics.get("max_drawdown")  # NEW
                },
                "ai_verdict": generate_verdict(metrics)
            }
    
    raise HTTPException(404, "fund not found")


def generate_verdict(metrics):
    cagr = metrics.get("cagr", 0) or 0
    sharpe = metrics.get("sharpe", 0) or 0
    volatility = metrics.get("volatility", 0) or 0
    sortino = metrics.get("sortino", 0) or 0
    max_drawdown = metrics.get("max_drawdown", 0) or 0
    
    # Convert to percentages for readability
    cagr_pct = cagr * 100
    vol_pct = volatility * 100
    dd_pct = abs(max_drawdown * 100)
    
    # Scoring system (0-100)
    score = 0
    
    # CAGR scoring (0-40 points)
    if cagr > 0.20: score += 40  # 20%+ = Excellent
    elif cagr > 0.15: score += 30  # 15-20% = Great
    elif cagr > 0.10: score += 20  # 10-15% = Good
    elif cagr > 0.05: score += 10  # 5-10% = Okay
    else: score += 0  # <5% = Poor
    
    # Sharpe ratio scoring (0-30 points)
    if sharpe > 2: score += 30  # Excellent risk-adjusted returns
    elif sharpe > 1: score += 20  # Good
    elif sharpe > 0.5: score += 10  # Okay
    else: score += 0  # Poor
    
    # Volatility scoring (0-20 points) - Lower is better
    if vol_pct < 10: score += 20  # Very stable
    elif vol_pct < 15: score += 15  # Stable
    elif vol_pct < 20: score += 10  # Moderate
    elif vol_pct < 25: score += 5  # Volatile
    else: score += 0  # Very volatile
    
    # Max Drawdown scoring (0-10 points) - Lower is better
    if dd_pct < 10: score += 10  # Excellent protection
    elif dd_pct < 20: score += 7  # Good protection
    elif dd_pct < 30: score += 4  # Okay protection
    else: score += 0  # Poor protection
    
    # Determine verdict based on score
    if score >= 75:
        verdict = "absolute fire! 🔥🔥🔥"
        emoji = "🔥"
        pros = [
            f"exceptional {cagr_pct:.1f}% annual returns",
            f"excellent risk-adjusted performance (Sharpe: {sharpe:.2f})",
            f"managed downside well ({dd_pct:.1f}% max drop)",
            "top-tier fund in its category"
        ]
        cons = [
            "past performance doesn't guarantee future results",
            "check expense ratio before investing"
        ]
    elif score >= 60:
        verdict = "fire! 🔥"
        emoji = "🔥"
        pros = [
            f"strong {cagr_pct:.1f}% returns",
            f"good risk management (Sharpe: {sharpe:.2f})",
            "solid long-term choice"
        ]
        cons = [
            f"volatility is {vol_pct:.1f}% (moderate swings)",
            "might not be best in class"
        ]
    elif score >= 40:
        verdict = "pretty good! ✨"
        emoji = "✨"
        pros = [
            f"decent {cagr_pct:.1f}% returns",
            "reasonable performance"
        ]
        cons = [
            f"sharpe ratio of {sharpe:.2f} is just okay",
            f"experienced {dd_pct:.1f}% drawdown",
            "better options might exist"
        ]
    elif score >= 25:
        verdict = "meh, could be better 😐"
        emoji = "😐"
        pros = [
            "at least it's positive returns" if cagr > 0 else "low volatility maybe",
        ]
        cons = [
            f"only {cagr_pct:.1f}% annual returns",
            f"risky for the returns (Sharpe: {sharpe:.2f})",
            "look for alternatives"
        ]
    else:
        verdict = "nah, skip this one 🚫"
        emoji = "🚫"
        pros = [
            "umm... it exists?" if cagr > 0 else "very low risk"
        ]
        cons = [
            f"poor {cagr_pct:.1f}% returns",
            "your money could do way better",
            "seriously, find something else"
        ]
    
    return {
        "verdict": verdict,
        "emoji": emoji,
        "score": score,
        "pros": pros,
        "cons": cons
    }