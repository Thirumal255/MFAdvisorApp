"""
metrics.py
Calculates comprehensive performance metrics from NAV data.
BULLETPROOF VERSION with comprehensive error handling

Expected input: pandas DataFrame with columns:
- 'date': datetime
- 'nav': float

Returns: Dictionary with all calculated metrics
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import traceback


def safe_calculation(func):
    """Decorator to safely handle any calculation errors"""
    def wrapper(*args, **kwargs):
        try:
            result = func(*args, **kwargs)
            # Check for NaN or inf
            if result is not None and isinstance(result, (int, float)):
                if pd.isna(result) or np.isinf(result):
                    return None
            return result
        except Exception as e:
            # print(f"Warning in {func.__name__}: {e}")
            return None
    return wrapper


def compute_metrics_for_nav(nav_df: pd.DataFrame) -> dict:
    """
    Main function to compute all metrics from NAV DataFrame
    
    Args:
        nav_df: DataFrame with 'date' and 'nav' columns
        
    Returns:
        Dictionary with all calculated metrics
    """
    
    try:
        # Validate input
        if nav_df is None or len(nav_df) < 2:
            return create_empty_metrics("insufficient_nav_data")
        
        # Ensure proper types
        nav_df = nav_df.copy()
        
        # Handle multiple date formats (DD-MM-YYYY, MM-DD-YYYY, YYYY-MM-DD)
        try:
            nav_df['date'] = pd.to_datetime(nav_df['date'], format='%d-%m-%Y', errors='coerce')
        except:
            try:
                nav_df['date'] = pd.to_datetime(nav_df['date'], format='%Y-%m-%d', errors='coerce')
            except:
                nav_df['date'] = pd.to_datetime(nav_df['date'], infer_datetime_format=True, errors='coerce')
        
        nav_df['nav'] = pd.to_numeric(nav_df['nav'], errors='coerce')
        nav_df = nav_df.dropna(subset=['nav', 'date'])
        nav_df = nav_df.sort_values('date').reset_index(drop=True)
        
        if len(nav_df) < 2:
            return create_empty_metrics("insufficient_valid_data")
        
        # Calculate fund age
        fund_age_years = (nav_df.iloc[-1]['date'] - nav_df.iloc[0]['date']).days / 365.25
        
        # Determine data quality
        is_reliable = fund_age_years >= 3.0 and len(nav_df) >= 365
        
        if fund_age_years < 1.0:
            data_quality = "insufficient"
            quality_reason = f"Fund age: {fund_age_years:.1f} years (need 3+ years)"
        elif fund_age_years < 3.0:
            data_quality = "preliminary"
            quality_reason = f"Fund age: {fund_age_years:.1f} years (preliminary)"
        elif len(nav_df) < 365:
            data_quality = "moderate"
            quality_reason = f"{len(nav_df)} NAV records (good but limited)"
        else:
            data_quality = "high"
            quality_reason = f"{len(nav_df)} NAV records over {fund_age_years:.1f} years"
        
        # Calculate all metrics
        metrics = {
            # Core return metrics
            "cagr": calculate_cagr(nav_df),
            "rolling_1y": calculate_rolling_return_mean(nav_df, 365),
            "rolling_3y": calculate_rolling_return_mean(nav_df, 1095),
            "rolling_5y": calculate_rolling_return_mean(nav_df, 1825),
            
            # Absolute returns
            "abs_return_1m": calculate_absolute_return(nav_df, 30),
            "abs_return_3m": calculate_absolute_return(nav_df, 90),
            "abs_return_6m": calculate_absolute_return(nav_df, 180),
            "abs_return_1y": calculate_absolute_return(nav_df, 365),
            "abs_return_2y": calculate_absolute_return(nav_df, 730),
            "abs_return_3y": calculate_absolute_return(nav_df, 1095),
            "abs_return_5y": calculate_absolute_return(nav_df, 1825),
            "abs_return_7y": calculate_absolute_return(nav_df, 2555),
            "abs_return_10y": calculate_absolute_return(nav_df, 3650),
            
            # Risk metrics
            "volatility": calculate_volatility(nav_df),
            "downside_deviation": calculate_downside_deviation(nav_df),
            "max_drawdown": calculate_max_drawdown(nav_df),
            "ulcer_index": calculate_ulcer_index(nav_df),
            "value_at_risk_95": calculate_var_95(nav_df),
            "conditional_var_95": calculate_cvar_95(nav_df),
            
            # Risk-adjusted returns
            "sharpe": calculate_sharpe_ratio(nav_df),
            "sortino": calculate_sortino_ratio(nav_df),
            "calmar_ratio": calculate_calmar_ratio(nav_df),
            "gain_to_pain_ratio": calculate_gain_to_pain_ratio(nav_df),
            
            # Consistency metrics
            "consistency_score": calculate_consistency_score(nav_df),
            "positive_months_pct": calculate_positive_months_pct(nav_df),
            "pain_index": calculate_pain_index(nav_df),
            
            # Recovery metrics
            "avg_drawdown_duration_days": calculate_avg_drawdown_duration(nav_df),
            "max_recovery_time_days": calculate_max_recovery_time(nav_df),
            "current_drawdown_pct": calculate_current_drawdown(nav_df),
            "days_since_peak": calculate_days_since_peak(nav_df),
            
            # Distribution metrics
            "skewness": calculate_skewness(nav_df),
            "kurtosis": calculate_kurtosis(nav_df),
            
            # Fund metadata
            "fund_age_years": fund_age_years,
            "is_statistically_reliable": is_reliable,
            "data_quality": data_quality,
            "data_quality_reason": quality_reason,
            
            # Benchmark placeholders (for Phase 4)
            "alpha": None,
            "beta": None,
            "r_squared": None,
            "information_ratio": None,
            "tracking_error": None,
            "up_capture": None,
            "down_capture": None
        }
        
        return metrics
        
    except Exception as e:
        print(f"❌ Critical error in compute_metrics_for_nav: {e}")
        traceback.print_exc()
        return create_empty_metrics(f"calculation_error: {str(e)}")


def create_empty_metrics(reason: str) -> dict:
    """Create metrics dict with all None values"""
    return {
        "cagr": None,
        "rolling_1y": None,
        "rolling_3y": None,
        "rolling_5y": None,
        "abs_return_1m": None,
        "abs_return_3m": None,
        "abs_return_6m": None,
        "abs_return_1y": None,
        "abs_return_2y": None,
        "abs_return_3y": None,
        "abs_return_5y": None,
        "abs_return_7y": None,
        "abs_return_10y": None,
        "volatility": None,
        "downside_deviation": None,
        "max_drawdown": None,
        "ulcer_index": None,
        "value_at_risk_95": None,
        "conditional_var_95": None,
        "sharpe": None,
        "sortino": None,
        "calmar_ratio": None,
        "gain_to_pain_ratio": None,
        "consistency_score": None,
        "positive_months_pct": None,
        "pain_index": None,
        "avg_drawdown_duration_days": None,
        "max_recovery_time_days": None,
        "current_drawdown_pct": None,
        "days_since_peak": None,
        "skewness": None,
        "kurtosis": None,
        "fund_age_years": None,
        "is_statistically_reliable": False,
        "data_quality": "insufficient",
        "data_quality_reason": reason,
        "alpha": None,
        "beta": None,
        "r_squared": None,
        "information_ratio": None,
        "tracking_error": None,
        "up_capture": None,
        "down_capture": None
    }


# ==================== RETURN METRICS ====================

@safe_calculation
def calculate_cagr(df: pd.DataFrame) -> float:
    """Calculate Compound Annual Growth Rate"""
    if df is None or len(df) < 365:
        return None
    
    start_nav = float(df.iloc[0]['nav'])
    end_nav = float(df.iloc[-1]['nav'])
    start_date = df.iloc[0]['date']
    end_date = df.iloc[-1]['date']
    
    years = (end_date - start_date).days / 365.25
    
    if years < 1 or start_nav <= 0 or end_nav <= 0:
        return None
    
    cagr = ((end_nav / start_nav) ** (1 / years)) - 1
    return float(cagr)


@safe_calculation
def calculate_absolute_return(df: pd.DataFrame, days: int) -> float:
    """
    Calculate absolute return for given period
    Returns value as percentage (e.g., 15.5 for 15.5%)
    """
    if df is None or len(df) < 2:
        return None
        
    latest_date = df.iloc[-1]['date']
    latest_nav = float(df.iloc[-1]['nav'])
    
    target_date = latest_date - timedelta(days=days)
    past_data = df[df['date'] <= target_date]
    
    if len(past_data) == 0:
        return None
    
    past_nav = float(past_data.iloc[-1]['nav'])
    
    if past_nav <= 0:
        return None
    
    abs_return = ((latest_nav - past_nav) / past_nav) * 100
    return float(abs_return)


@safe_calculation
def calculate_rolling_return_mean(df: pd.DataFrame, window_days: int) -> float:
    """
    Calculate mean of rolling returns
    Returns as decimal (e.g., 0.15 for 15%)
    """
    if df is None or len(df) < window_days + 30:
        return None
    
    rolling_returns = []
    
    for i in range(len(df) - window_days):
        start_nav = float(df.iloc[i]['nav'])
        end_nav = float(df.iloc[i + window_days]['nav'])
        
        if start_nav > 0 and end_nav > 0:
            years = window_days / 365.25
            annualized_return = ((end_nav / start_nav) ** (1 / years)) - 1
            rolling_returns.append(annualized_return)
    
    if len(rolling_returns) == 0:
        return None
    
    return float(np.mean(rolling_returns))


# ==================== RISK METRICS ====================

@safe_calculation
def calculate_volatility(df: pd.DataFrame, period_days: int = None) -> float:
    """
    Calculate annualized volatility
    Returns as decimal (e.g., 0.15 for 15%)
    """
    if df is None or len(df) < 30:
        return None
    
    df_copy = df.copy()
    
    if period_days:
        df_copy = df_copy.tail(min(len(df_copy), period_days))
    
    df_copy['daily_return'] = df_copy['nav'].pct_change()
    df_copy = df_copy.dropna(subset=['daily_return'])
    
    # Filter out infinite values
    df_copy = df_copy[np.isfinite(df_copy['daily_return'])]
    
    if len(df_copy) < 30:
        return None
    
    daily_vol = df_copy['daily_return'].std()
    
    if daily_vol is None or pd.isna(daily_vol) or daily_vol == 0:
        return None
    
    annual_vol = float(daily_vol) * np.sqrt(252)
    
    return float(annual_vol)


@safe_calculation
def calculate_downside_deviation(df: pd.DataFrame) -> float:
    """
    Calculate annualized downside deviation
    Returns as decimal (e.g., 0.10 for 10%)
    """
    if df is None or len(df) < 30:
        return None
    
    df_copy = df.copy()
    df_copy['daily_return'] = df_copy['nav'].pct_change()
    df_copy = df_copy.dropna(subset=['daily_return'])
    df_copy = df_copy[np.isfinite(df_copy['daily_return'])]
    
    negative_returns = df_copy[df_copy['daily_return'] < 0]['daily_return']
    
    if len(negative_returns) < 5:
        return None
    
    std_val = negative_returns.std()
    
    if std_val is None or pd.isna(std_val) or std_val == 0:
        return None
    
    downside_dev = float(std_val) * np.sqrt(252)
    return float(downside_dev)


@safe_calculation
def calculate_max_drawdown(df: pd.DataFrame) -> float:
    """
    Calculate maximum drawdown
    Returns as decimal (e.g., -0.35 for -35%)
    """
    if df is None or len(df) < 2:
        return None
    
    df_copy = df.copy()
    df_copy['cummax'] = df_copy['nav'].cummax()
    df_copy['drawdown'] = (df_copy['nav'] - df_copy['cummax']) / df_copy['cummax']
    
    # Filter out NaN and inf
    df_copy = df_copy[np.isfinite(df_copy['drawdown'])]
    
    if len(df_copy) == 0:
        return None
    
    max_dd = df_copy['drawdown'].min()
    
    if pd.isna(max_dd):
        return None
    
    return float(max_dd)


@safe_calculation
def calculate_ulcer_index(df: pd.DataFrame) -> float:
    """Calculate Ulcer Index (pain from drawdowns)"""
    if df is None or len(df) < 30:
        return None
    
    df_copy = df.copy()
    df_copy['cummax'] = df_copy['nav'].cummax()
    df_copy['drawdown_pct'] = ((df_copy['nav'] - df_copy['cummax']) / df_copy['cummax']) * 100
    
    df_copy = df_copy[np.isfinite(df_copy['drawdown_pct'])]
    
    if len(df_copy) == 0:
        return None
    
    ulcer = np.sqrt(np.mean(df_copy['drawdown_pct'] ** 2))
    
    if pd.isna(ulcer):
        return None
    
    return float(ulcer)


@safe_calculation
def calculate_var_95(df: pd.DataFrame) -> float:
    """
    Calculate Value at Risk at 95% confidence
    Returns as decimal (e.g., -0.023 for -2.3%)
    """
    if df is None or len(df) < 30:
        return None
    
    df_copy = df.copy()
    df_copy['daily_return'] = df_copy['nav'].pct_change()
    df_copy = df_copy.dropna(subset=['daily_return'])
    df_copy = df_copy[np.isfinite(df_copy['daily_return'])]
    
    if len(df_copy) < 30:
        return None
    
    var_95 = df_copy['daily_return'].quantile(0.05)
    
    if pd.isna(var_95):
        return None
    
    return float(var_95)


@safe_calculation
def calculate_cvar_95(df: pd.DataFrame) -> float:
    """
    Calculate Conditional VaR (Expected Shortfall) at 95%
    Returns as decimal
    """
    if df is None or len(df) < 30:
        return None
    
    df_copy = df.copy()
    df_copy['daily_return'] = df_copy['nav'].pct_change()
    df_copy = df_copy.dropna(subset=['daily_return'])
    df_copy = df_copy[np.isfinite(df_copy['daily_return'])]
    
    if len(df_copy) < 30:
        return None
    
    var_95 = df_copy['daily_return'].quantile(0.05)
    cvar = df_copy[df_copy['daily_return'] <= var_95]['daily_return'].mean()
    
    if pd.isna(cvar):
        return None
    
    return float(cvar)


# ==================== RISK-ADJUSTED RETURNS ====================

@safe_calculation
def calculate_sharpe_ratio(df: pd.DataFrame, risk_free_rate: float = 0.065) -> float:
    """Calculate Sharpe Ratio"""
    if df is None or len(df) < 30:
        return None
    
    df_copy = df.copy()
    df_copy['daily_return'] = df_copy['nav'].pct_change()
    df_copy = df_copy.dropna(subset=['daily_return'])
    df_copy = df_copy[np.isfinite(df_copy['daily_return'])]
    
    if len(df_copy) < 30:
        return None
    
    mean_val = df_copy['daily_return'].mean()
    std_val = df_copy['daily_return'].std()
    
    if mean_val is None or pd.isna(mean_val) or std_val is None or pd.isna(std_val):
        return None
    
    annual_return = float(mean_val) * 252
    annual_vol = float(std_val) * np.sqrt(252)
    
    if annual_vol == 0:
        return None
    
    sharpe = (annual_return - risk_free_rate) / annual_vol
    return float(sharpe)


@safe_calculation
def calculate_sortino_ratio(df: pd.DataFrame, risk_free_rate: float = 0.065) -> float:
    """Calculate Sortino Ratio"""
    if df is None or len(df) < 30:
        return None
    
    df_copy = df.copy()
    df_copy['daily_return'] = df_copy['nav'].pct_change()
    df_copy = df_copy.dropna(subset=['daily_return'])
    df_copy = df_copy[np.isfinite(df_copy['daily_return'])]
    
    if len(df_copy) < 30:
        return None
    
    mean_val = df_copy['daily_return'].mean()
    
    if mean_val is None or pd.isna(mean_val):
        return None
    
    annual_return = float(mean_val) * 252
    
    negative_returns = df_copy[df_copy['daily_return'] < 0]['daily_return']
    
    if len(negative_returns) < 5:
        return None
    
    std_val = negative_returns.std()
    
    if std_val is None or pd.isna(std_val) or std_val == 0:
        return None
    
    downside_dev = float(std_val) * np.sqrt(252)
    
    sortino = (annual_return - risk_free_rate) / downside_dev
    return float(sortino)


@safe_calculation
def calculate_calmar_ratio(df: pd.DataFrame) -> float:
    """Calculate Calmar Ratio (CAGR / abs(Max Drawdown))"""
    cagr = calculate_cagr(df)
    max_dd = calculate_max_drawdown(df)
    
    if cagr is None or max_dd is None or max_dd == 0:
        return None
    
    calmar = cagr / abs(max_dd)
    return float(calmar)


@safe_calculation
def calculate_gain_to_pain_ratio(df: pd.DataFrame) -> float:
    """Calculate Gain-to-Pain Ratio"""
    if df is None or len(df) < 30:
        return None
    
    df_copy = df.copy()
    df_copy['daily_return'] = df_copy['nav'].pct_change()
    df_copy = df_copy.dropna(subset=['daily_return'])
    df_copy = df_copy[np.isfinite(df_copy['daily_return'])]
    
    if len(df_copy) < 30:
        return None
    
    start_nav = float(df.iloc[0]['nav'])
    end_nav = float(df.iloc[-1]['nav'])
    total_return = (end_nav / start_nav) - 1
    
    negative_returns = df_copy[df_copy['daily_return'] < 0]['daily_return']
    
    if len(negative_returns) == 0:
        return None
    
    pain = abs(negative_returns.sum())
    
    if pain == 0:
        return None
    
    gain_to_pain = total_return / pain
    return float(gain_to_pain)


# ==================== CONSISTENCY METRICS ====================

@safe_calculation
def calculate_consistency_score(df: pd.DataFrame) -> float:
    """
    Calculate consistency score (% of positive months)
    Returns as percentage (e.g., 67.8 for 67.8%)
    """
    monthly_returns = calculate_monthly_returns(df)
    
    if monthly_returns is None or len(monthly_returns) < 12:
        return None
    
    positive_count = sum(1 for r in monthly_returns if r > 0)
    consistency = (positive_count / len(monthly_returns)) * 100
    
    return float(consistency)


@safe_calculation
def calculate_positive_months_pct(df: pd.DataFrame) -> float:
    """
    Calculate percentage of positive months
    Returns as percentage (e.g., 68.5 for 68.5%)
    """
    return calculate_consistency_score(df)


def calculate_monthly_returns(df: pd.DataFrame) -> list:
    """Helper: Calculate monthly returns"""
    try:
        if df is None or len(df) < 60:
            return None
        
        df_copy = df.copy()
        df_copy['month'] = df_copy['date'].dt.to_period('M')
        
        monthly_returns = []
        
        for month in df_copy['month'].unique():
            month_data = df_copy[df_copy['month'] == month]
            if len(month_data) > 1:
                start_nav = float(month_data.iloc[0]['nav'])
                end_nav = float(month_data.iloc[-1]['nav'])
                
                if start_nav > 0 and end_nav > 0:
                    monthly_return = (end_nav - start_nav) / start_nav
                    monthly_returns.append(monthly_return)
        
        return monthly_returns if len(monthly_returns) >= 12 else None
    except:
        return None


@safe_calculation
def calculate_pain_index(df: pd.DataFrame) -> float:
    """Calculate Pain Index (average of squared drawdowns)"""
    if df is None or len(df) < 30:
        return None
    
    df_copy = df.copy()
    df_copy['cummax'] = df_copy['nav'].cummax()
    df_copy['drawdown'] = (df_copy['nav'] - df_copy['cummax']) / df_copy['cummax']
    
    df_copy = df_copy[np.isfinite(df_copy['drawdown'])]
    
    if len(df_copy) == 0:
        return None
    
    pain = np.mean(df_copy['drawdown'] ** 2)
    
    if pd.isna(pain):
        return None
    
    return float(abs(pain))


# ==================== RECOVERY METRICS ====================

@safe_calculation
def calculate_current_drawdown(df: pd.DataFrame) -> float:
    """
    Calculate current drawdown from peak
    Returns as percentage (e.g., -5.2 for -5.2%)
    """
    if df is None or len(df) < 2:
        return None
    
    current_nav = float(df.iloc[-1]['nav'])
    peak_nav = float(df['nav'].max())
    
    if peak_nav == 0:
        return None
    
    current_dd = ((current_nav - peak_nav) / peak_nav) * 100
    return float(current_dd)


@safe_calculation
def calculate_days_since_peak(df: pd.DataFrame) -> int:
    """Calculate days since last peak NAV"""
    if df is None or len(df) < 2:
        return None
    
    peak_idx = df['nav'].idxmax()
    peak_date = df.loc[peak_idx, 'date']
    latest_date = df.iloc[-1]['date']
    
    days = (latest_date - peak_date).days
    return int(days)


@safe_calculation
def calculate_max_recovery_time(df: pd.DataFrame) -> int:
    """Calculate maximum recovery time in days"""
    if df is None or len(df) < 30:
        return None
    
    df_copy = df.copy()
    df_copy['cummax'] = df_copy['nav'].cummax()
    df_copy['is_peak'] = df_copy['nav'] == df_copy['cummax']
    
    recovery_times = []
    in_drawdown = False
    drawdown_start = None
    
    for idx, row in df_copy.iterrows():
        if row['is_peak'] and not in_drawdown:
            drawdown_start = row['date']
            in_drawdown = True
        elif row['is_peak'] and in_drawdown:
            recovery_time = (row['date'] - drawdown_start).days
            recovery_times.append(recovery_time)
            drawdown_start = row['date']
    
    if len(recovery_times) == 0:
        return None
    
    return int(max(recovery_times))


@safe_calculation
def calculate_avg_drawdown_duration(df: pd.DataFrame) -> float:
    """Calculate average drawdown duration in days"""
    if df is None or len(df) < 30:
        return None
    
    df_copy = df.copy()
    df_copy['cummax'] = df_copy['nav'].cummax()
    df_copy['in_drawdown'] = df_copy['nav'] < df_copy['cummax']
    
    drawdown_durations = []
    current_duration = 0
    
    for in_dd in df_copy['in_drawdown']:
        if in_dd:
            current_duration += 1
        elif current_duration > 0:
            drawdown_durations.append(current_duration)
            current_duration = 0
    
    if len(drawdown_durations) == 0:
        return None
    
    return float(np.mean(drawdown_durations))


# ==================== DISTRIBUTION METRICS ====================

@safe_calculation
def calculate_skewness(df: pd.DataFrame) -> float:
    """Calculate skewness of returns"""
    if df is None or len(df) < 30:
        return None
    
    df_copy = df.copy()
    df_copy['daily_return'] = df_copy['nav'].pct_change()
    df_copy = df_copy.dropna(subset=['daily_return'])
    df_copy = df_copy[np.isfinite(df_copy['daily_return'])]
    
    if len(df_copy) < 30:
        return None
    
    skew = df_copy['daily_return'].skew()
    
    if pd.isna(skew):
        return None
    
    return float(skew)


@safe_calculation
def calculate_kurtosis(df: pd.DataFrame) -> float:
    """Calculate kurtosis of returns"""
    if df is None or len(df) < 30:
        return None
    
    df_copy = df.copy()
    df_copy['daily_return'] = df_copy['nav'].pct_change()
    df_copy = df_copy.dropna(subset=['daily_return'])
    df_copy = df_copy[np.isfinite(df_copy['daily_return'])]
    
    if len(df_copy) < 30:
        return None
    
    kurt = df_copy['daily_return'].kurtosis()
    
    if pd.isna(kurt):
        return None
    
    return float(kurt)
