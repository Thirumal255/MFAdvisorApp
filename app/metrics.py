import pandas as pd
import numpy as np
from datetime import datetime
import math

RISK_FREE_RATE_DEFAULT = 0.06  # 6%

# ---------------------------------------------------
# Core math helpers
# ---------------------------------------------------

def compute_periodic_returns(nav_series: pd.Series):
    start = nav_series.iloc[0]
    end = nav_series.iloc[-1]
    days = (nav_series.index[-1] - nav_series.index[0]).days
    years = days / 365.0
    if years <= 0:
        return None
    return (end / start) ** (1 / years) - 1

def daily_returns(nav):
    return nav.pct_change().dropna()

def annualized_volatility(returns):
    return returns.std() * math.sqrt(252)

def max_drawdown(nav):
    cum_max = nav.cummax()
    drawdown = (nav - cum_max) / cum_max
    return drawdown.min()

# ---------------------------------------------------
# Correct Sharpe / Sortino (MF-grade)
# ---------------------------------------------------

def sharpe_ratio(nav, returns, risk_free):
    cagr = compute_periodic_returns(nav)
    vol = annualized_volatility(returns)
    if not cagr or not vol or vol == 0:
        return None
    return (cagr - risk_free) / vol

def sortino_ratio(nav, returns, risk_free):
    cagr = compute_periodic_returns(nav)
    downside = returns[returns < 0]
    downside_vol = downside.std() * math.sqrt(252)
    if not cagr or not downside_vol or downside_vol == 0:
        return None
    return (cagr - risk_free) / downside_vol

# ---------------------------------------------------
# Rolling returns
# ---------------------------------------------------

def rolling_return(nav, days):
    if len(nav) < days:
        return None
    window = nav.iloc[-days:]
    return compute_periodic_returns(window)

# ---------------------------------------------------
# Main metric computation
# ---------------------------------------------------

def compute_metrics_for_nav(nav_df: pd.DataFrame):
    nav_df["date"] = pd.to_datetime(nav_df["date"], dayfirst=True)
    nav_df = nav_df.sort_values("date")
    nav_df.set_index("date", inplace=True)

    nav = nav_df["nav"]
    returns = daily_returns(nav)

    cagr = compute_periodic_returns(nav)
    vol = annualized_volatility(returns)
    mdd = max_drawdown(nav)

    sharpe = sharpe_ratio(nav, returns, RISK_FREE_RATE_DEFAULT)
    sortino = sortino_ratio(nav, returns, RISK_FREE_RATE_DEFAULT)

    r1y = rolling_return(nav, 365)
    r3y = rolling_return(nav, 3 * 365)
    r5y = rolling_return(nav, 5 * 365)

    fund_age_years = (nav.index[-1] - nav.index[0]).days / 365.0

    out = {
        "cagr": cagr,
        "volatility": vol,
        "max_drawdown": mdd,
        "sharpe": sharpe,
        "sortino": sortino,
        "rolling_1y": r1y,
        "rolling_3y": r3y,
        "rolling_5y": r5y,
        "fund_age_years": fund_age_years,
        "is_statistically_reliable": fund_age_years >= 3
    }

    return out
