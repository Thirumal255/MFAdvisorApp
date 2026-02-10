"""
Category-Specific Scoring Configuration
Different weights and ranges for Equity, Debt, and Hybrid funds
"""

# ============================================================
# EQUITY FUNDS - Focus on Growth & Risk-Adjusted Returns
# ============================================================

EQUITY_WEIGHTS = {
    # RETURNS (40%) - High weight for equity
    "cagr": 20.0,
    "rolling_3y": 10.0,
    "rolling_5y": 10.0,
    
    # RISK MANAGEMENT (25%)
    "volatility": 10.0,
    "max_drawdown": 10.0,
    "downside_deviation": 5.0,
    
    # RISK-ADJUSTED RETURNS (20%)
    "sharpe": 12.0,
    "sortino": 8.0,
    
    # CONSISTENCY (10%)
    "consistency_score": 7.0,
    "positive_months_pct": 3.0,
    
    # BENCHMARK (5%) - Optional
    "alpha": 3.0,
    "information_ratio": 2.0
}

EQUITY_RANGES = {
    "cagr": {"min": -0.10, "max": 0.30, "direction": "higher_better"},
    "rolling_3y": {"min": -0.05, "max": 0.25, "direction": "higher_better"},
    "rolling_5y": {"min": 0.00, "max": 0.20, "direction": "higher_better"},
    
    "volatility": {"min": 0.10, "max": 0.40, "direction": "lower_better"},
    "max_drawdown": {"min": -0.50, "max": -0.10, "direction": "higher_better"},
    "downside_deviation": {"min": 0.08, "max": 0.30, "direction": "lower_better"},
    
    "sharpe": {"min": -0.5, "max": 3.0, "direction": "higher_better"},
    "sortino": {"min": -0.5, "max": 3.0, "direction": "higher_better"},
    
    "consistency_score": {"min": 40.0, "max": 85.0, "direction": "higher_better"},
    "positive_months_pct": {"min": 50.0, "max": 75.0, "direction": "higher_better"},
    
    "alpha": {"min": -0.05, "max": 0.10, "direction": "higher_better"},
    "information_ratio": {"min": -1.0, "max": 2.0, "direction": "higher_better"}
}


# ============================================================
# DEBT FUNDS - Focus on Stability & Consistency
# ============================================================

DEBT_WEIGHTS = {
    # RETURNS (25%) - Lower weight, stability matters more
    "cagr": 15.0,
    "rolling_3y": 7.0,
    "rolling_5y": 3.0,
    
    # RISK MANAGEMENT (15%) - Low volatility expected
    "volatility": 5.0,
    "max_drawdown": 7.0,
    "downside_deviation": 3.0,
    
    # RISK-ADJUSTED RETURNS (30%) - Most important for debt
    "sharpe": 20.0,
    "sortino": 10.0,
    
    # CONSISTENCY (20%) - Very important for debt
    "consistency_score": 12.0,
    "positive_months_pct": 5.0,
    "current_drawdown_pct": 3.0,
    
    # BENCHMARK (10%)
    "alpha": 5.0,
    "information_ratio": 5.0
}

DEBT_RANGES = {
    "cagr": {"min": 0.03, "max": 0.12, "direction": "higher_better"},
    "rolling_3y": {"min": 0.03, "max": 0.10, "direction": "higher_better"},
    "rolling_5y": {"min": 0.04, "max": 0.09, "direction": "higher_better"},
    
    "volatility": {"min": 0.01, "max": 0.10, "direction": "lower_better"},
    "max_drawdown": {"min": -0.15, "max": -0.01, "direction": "higher_better"},
    "downside_deviation": {"min": 0.01, "max": 0.08, "direction": "lower_better"},
    
    "sharpe": {"min": 0.0, "max": 4.0, "direction": "higher_better"},
    "sortino": {"min": 0.0, "max": 5.0, "direction": "higher_better"},
    
    "consistency_score": {"min": 60.0, "max": 95.0, "direction": "higher_better"},
    "positive_months_pct": {"min": 65.0, "max": 90.0, "direction": "higher_better"},
    "current_drawdown_pct": {"min": -0.10, "max": 0.00, "direction": "higher_better"},
    
    "alpha": {"min": -0.02, "max": 0.05, "direction": "higher_better"},
    "information_ratio": {"min": -0.5, "max": 3.0, "direction": "higher_better"}
}


# ============================================================
# HYBRID FUNDS - Balanced Approach
# ============================================================

HYBRID_WEIGHTS = {
    # RETURNS (35%)
    "cagr": 18.0,
    "rolling_3y": 10.0,
    "rolling_5y": 7.0,
    
    # RISK MANAGEMENT (20%)
    "volatility": 8.0,
    "max_drawdown": 8.0,
    "downside_deviation": 4.0,
    
    # RISK-ADJUSTED RETURNS (25%)
    "sharpe": 15.0,
    "sortino": 10.0,
    
    # CONSISTENCY (15%)
    "consistency_score": 10.0,
    "positive_months_pct": 3.0,
    "current_drawdown_pct": 2.0,
    
    # BENCHMARK (5%)
    "alpha": 3.0,
    "information_ratio": 2.0
}

HYBRID_RANGES = {
    "cagr": {"min": 0.00, "max": 0.20, "direction": "higher_better"},
    "rolling_3y": {"min": 0.00, "max": 0.18, "direction": "higher_better"},
    "rolling_5y": {"min": 0.02, "max": 0.15, "direction": "higher_better"},
    
    "volatility": {"min": 0.05, "max": 0.25, "direction": "lower_better"},
    "max_drawdown": {"min": -0.35, "max": -0.05, "direction": "higher_better"},
    "downside_deviation": {"min": 0.04, "max": 0.20, "direction": "lower_better"},
    
    "sharpe": {"min": 0.0, "max": 3.5, "direction": "higher_better"},
    "sortino": {"min": 0.0, "max": 4.0, "direction": "higher_better"},
    
    "consistency_score": {"min": 50.0, "max": 90.0, "direction": "higher_better"},
    "positive_months_pct": {"min": 55.0, "max": 80.0, "direction": "higher_better"},
    "current_drawdown_pct": {"min": -0.20, "max": 0.00, "direction": "higher_better"},
    
    "alpha": {"min": -0.03, "max": 0.08, "direction": "higher_better"},
    "information_ratio": {"min": -0.8, "max": 2.5, "direction": "higher_better"}
}


# ============================================================
# OTHER / INCOME / SOLUTION ORIENTED - Use Hybrid as default
# ============================================================

OTHER_WEIGHTS = HYBRID_WEIGHTS.copy()
OTHER_RANGES = HYBRID_RANGES.copy()


# ============================================================
# CATEGORY MAPPING
# ============================================================

CATEGORY_CONFIGS = {
    "Equity": {
        "weights": EQUITY_WEIGHTS,
        "ranges": EQUITY_RANGES
    },
    "Debt": {
        "weights": DEBT_WEIGHTS,
        "ranges": DEBT_RANGES
    },
    "Hybrid": {
        "weights": HYBRID_WEIGHTS,
        "ranges": HYBRID_RANGES
    },
    "Income": {
        "weights": DEBT_WEIGHTS,  # Income funds are like debt funds
        "ranges": DEBT_RANGES
    },
    "Solution Oriented": {
        "weights": HYBRID_WEIGHTS,
        "ranges": HYBRID_RANGES
    },
    "Other": {
        "weights": OTHER_WEIGHTS,
        "ranges": OTHER_RANGES
    }
}


# ============================================================
# TIER DEFINITIONS (Same for all categories)
# ============================================================

SCORE_TIERS = {
    "excellent": {
        "min": 75,
        "max": 100,
        "label": "Excellent",
        "emoji": "🌟",
        "color": "#10B981"
    },
    "good": {
        "min": 60,
        "max": 74.99,
        "label": "Good",
        "emoji": "👍",
        "color": "#3B82F6"
    },
    "average": {
        "min": 40,
        "max": 59.99,
        "label": "Average",
        "emoji": "😐",
        "color": "#F59E0B"
    },
    "below_average": {
        "min": 25,
        "max": 39.99,
        "label": "Below Average",
        "emoji": "👎",
        "color": "#EF4444"
    },
    "poor": {
        "min": 0,
        "max": 24.99,
        "label": "Poor",
        "emoji": "⚠️",
        "color": "#DC2626"
    },
    "insufficient_data": {
        "min": 0,
        "max": 0,
        "label": "Not Enough Data",
        "emoji": "📊",
        "color": "#9CA3AF"
    }
}


def get_score_tier(score):
    """Get tier information for a score"""
    if score >= 75:
        return SCORE_TIERS["excellent"]
    elif score >= 60:
        return SCORE_TIERS["good"]
    elif score >= 40:
        return SCORE_TIERS["average"]
    elif score >= 25:
        return SCORE_TIERS["below_average"]
    else:
        return SCORE_TIERS["poor"]
