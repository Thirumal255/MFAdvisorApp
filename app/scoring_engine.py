"""
Category-Specific Scoring Engine
Calculates weighted scores based on fund category
"""

import json
from typing import Dict, Any, Optional
from app.scoring_config import CATEGORY_CONFIGS, get_score_tier


def normalize_metric(value: float, metric_name: str, ranges: Dict) -> float:
    """
    Normalize a metric to 0-100 scale based on configured ranges
    
    Args:
        value: Raw metric value
        metric_name: Name of the metric
        ranges: Range configuration dict
    
    Returns:
        Normalized value (0-100)
    """
    if metric_name not in ranges:
        return 50.0  # Default to middle if range not defined
    
    config = ranges[metric_name]
    min_val = config["min"]
    max_val = config["max"]
    direction = config["direction"]
    
    # Clamp value to range
    clamped = max(min_val, min(max_val, value))
    
    # Normalize to 0-1
    if max_val == min_val:
        normalized = 0.5
    else:
        normalized = (clamped - min_val) / (max_val - min_val)
    
    # Invert if lower is better
    if direction == "lower_better":
        normalized = 1.0 - normalized
    
    # Scale to 0-100
    return normalized * 100.0


def calculate_category_score(
    metrics: Dict[str, Any],
    main_category: str = "Other"
) -> Dict[str, Any]:
    """
    Calculate weighted score based on fund category
    Handles funds with insufficient data gracefully
    
    Args:
        metrics: Dict of metric values
        main_category: Fund category (Equity, Debt, Hybrid, etc.)
    
    Returns:
        Dict with score breakdown
    """
    
    # Get category config
    if main_category not in CATEGORY_CONFIGS:
        main_category = "Other"
    
    config = CATEGORY_CONFIGS[main_category]
    weights = config["weights"]
    ranges = config["ranges"]
    
    # Initialize scoring
    total_score = 0.0
    total_weight_applied = 0.0
    normalized_metrics = {}
    missing_metrics = []
    contributions = {}
    
    # Check if fund has sufficient data
    is_reliable = metrics.get("is_statistically_reliable", False)
    fund_age = metrics.get("fund_age_years")
    data_quality = metrics.get("data_quality", "unknown")
    
    # Handle NULL fund_age gracefully
    if fund_age is None:
        fund_age = 0.0
    
    # Check for insufficient data case
    if not is_reliable or data_quality == "insufficient":
        # Return "Not Enough Data" score
        return {
            "total": 0.0,
            "category": main_category,
            "tier": {
                "name": "insufficient_data",
                "label": "Not Enough Data",
                "emoji": "📊",
                "color": "#9CA3AF"
            },
            "normalized_metrics": {},
            "contributions": {},
            "missing_metrics": list(weights.keys()),
            "weight_applied": 0.0,
            "adjusted": False,
            "reliability": "Insufficient",
            "reliability_reason": f"Insufficient historical data (Fund age: {fund_age:.1f} years)" if fund_age else "Insufficient historical data",
            "total_metrics_used": 0,
            "total_metrics_available": len(weights),
            "has_sufficient_data": False
        }
    
    # Calculate weighted score for funds with data
    for metric_name, weight in weights.items():
        value = metrics.get(metric_name)
        
        # Skip if metric is missing or None
        if value is None:
            missing_metrics.append(metric_name)
            continue
        
        # Normalize metric
        normalized = normalize_metric(value, metric_name, ranges)
        normalized_metrics[metric_name] = {
            "raw": value,
            "normalized": round(normalized, 2),
            "weight": weight
        }
        
        # Calculate contribution
        contribution = (normalized * weight) / 100.0
        contributions[metric_name] = round(contribution, 2)
        
        # Add to total
        total_score += contribution
        total_weight_applied += weight
    
    # Check if we have MINIMUM required metrics
    if total_weight_applied < 30:  # Less than 30% of metrics available
        return {
            "total": 0.0,
            "category": main_category,
            "tier": {
                "name": "insufficient_data",
                "label": "Not Enough Data",
                "emoji": "📊",
                "color": "#9CA3AF"
            },
            "normalized_metrics": normalized_metrics,
            "contributions": contributions,
            "missing_metrics": missing_metrics,
            "weight_applied": round(total_weight_applied, 2),
            "adjusted": False,
            "reliability": "Insufficient",
            "reliability_reason": f"Too few metrics available ({len(normalized_metrics)}/{len(weights)})",
            "total_metrics_used": len(normalized_metrics),
            "total_metrics_available": len(weights),
            "has_sufficient_data": False
        }
    
    # Adjust for missing metrics
    if total_weight_applied > 0 and total_weight_applied < 100:
        # Scale up to 100
        adjustment_factor = 100.0 / total_weight_applied
        total_score = total_score * adjustment_factor
        adjusted = True
    else:
        adjusted = False
    
    # Get tier
    tier = get_score_tier(total_score)
    
    # Determine reliability
    if fund_age < 3:
        reliability = "Preliminary"
        reliability_reason = f"Fund age: {fund_age:.1f} years (need 3+ years)"
    elif len(missing_metrics) > 5:
        reliability = "Moderate"
        reliability_reason = f"{len(missing_metrics)} metrics missing"
    else:
        reliability = "High"
        reliability_reason = "Sufficient data and track record"
    
    return {
        "total": round(total_score, 2),
        "category": main_category,
        "tier": {
            "name": tier["label"].lower().replace(" ", "_"),
            "label": tier["label"],
            "emoji": tier["emoji"],
            "color": tier["color"]
        },
        "normalized_metrics": normalized_metrics,
        "contributions": contributions,
        "missing_metrics": missing_metrics,
        "weight_applied": round(total_weight_applied, 2),
        "adjusted": adjusted,
        "reliability": reliability,
        "reliability_reason": reliability_reason,
        "total_metrics_used": len(normalized_metrics),
        "total_metrics_available": len(weights),
        "has_sufficient_data": True
    }


def calculate_scores_for_all_funds(merged_data_path: str, output_path: str):
    """
    Calculate category-specific scores for all funds in merged data
    
    Args:
        merged_data_path: Path to scheme_metrics_merged.json
        output_path: Path to save scored data
    """
    print("=" * 60)
    print("CALCULATING CATEGORY-SPECIFIC SCORES")
    print("=" * 60)
    
    # Load merged data
    print(f"Loading data from {merged_data_path}...")
    with open(merged_data_path, 'r', encoding='utf-8') as f:
        all_funds = json.load(f)
    
    print(f"Found {len(all_funds)} funds")
    
    # Statistics
    stats = {
        'total': len(all_funds),
        'scored': 0,
        'skipped': 0,
        'by_category': {},
        'by_tier': {}
    }
    
    scored_data = {}
    
    # Process each fund
    for idx, (fund_name, fund_data) in enumerate(all_funds.items(), 1):
        if idx % 50 == 0:
            print(f"Progress: {idx}/{len(all_funds)}...")
        
        metrics = fund_data.get("metrics", {})
        main_category = fund_data.get("main_category", "Other")
        
        # Calculate score
        try:
            score_result = calculate_category_score(metrics, main_category)
            
            # Add score to fund data
            fund_data["score"] = score_result
            scored_data[fund_name] = fund_data
            
            # Update stats
            stats['scored'] += 1
            stats['by_category'][main_category] = stats['by_category'].get(main_category, 0) + 1
            
            tier_name = score_result['tier']['name']
            stats['by_tier'][tier_name] = stats['by_tier'].get(tier_name, 0) + 1
            
        except Exception as e:
            print(f"Error calculating score for {fund_name}: {e}")
            stats['skipped'] += 1
            # Still include fund without score
            scored_data[fund_name] = fund_data
    
    # Save scored data
    print(f"\nSaving scored data to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(scored_data, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print("\n" + "=" * 60)
    print("SCORING COMPLETE")
    print("=" * 60)
    print(f"Total funds: {stats['total']}")
    print(f"✅ Scored: {stats['scored']}")
    print(f"⚠️  Skipped: {stats['skipped']}")
    
    print("\n📊 By Category:")
    for cat, count in sorted(stats['by_category'].items(), key=lambda x: x[1], reverse=True):
        print(f"  {cat}: {count}")
    
    print("\n🏆 By Tier:")
    tier_order = ['excellent', 'good', 'average', 'below_average', 'poor']
    for tier in tier_order:
        count = stats['by_tier'].get(tier, 0)
        pct = (count / stats['scored'] * 100) if stats['scored'] > 0 else 0
        print(f"  {tier.replace('_', ' ').title()}: {count} ({pct:.1f}%)")
    
    print(f"\nOutput saved to: {output_path}")
    print("=" * 60)


# ============================================================
# STANDALONE TESTING
# ============================================================

if __name__ == "__main__":
    # Test with sample metrics
    
    # Example 1: Equity fund
    equity_metrics = {
        "cagr": 0.18,
        "rolling_3y": 0.15,
        "rolling_5y": 0.14,
        "volatility": 0.20,
        "max_drawdown": -0.25,
        "downside_deviation": 0.15,
        "sharpe": 1.8,
        "sortino": 2.1,
        "consistency_score": 72.0,
        "positive_months_pct": 65.0,
        "is_statistically_reliable": True,
        "fund_age_years": 5.2
    }
    
    print("Testing Equity Fund Scoring:")
    print("-" * 60)
    equity_score = calculate_category_score(equity_metrics, "Equity")
    print(f"Total Score: {equity_score['total']}")
    print(f"Tier: {equity_score['tier']['emoji']} {equity_score['tier']['label']}")
    print(f"Category: {equity_score['category']}")
    print(f"Metrics Used: {equity_score['total_metrics_used']}/{equity_score['total_metrics_available']}")
    print(f"Reliability: {equity_score['reliability']}")
    
    print("\n" + "=" * 60 + "\n")
    
    # Example 2: Debt fund
    debt_metrics = {
        "cagr": 0.07,
        "rolling_3y": 0.065,
        "rolling_5y": 0.06,
        "volatility": 0.03,
        "max_drawdown": -0.05,
        "downside_deviation": 0.02,
        "sharpe": 2.5,
        "sortino": 3.0,
        "consistency_score": 85.0,
        "positive_months_pct": 78.0,
        "current_drawdown_pct": -0.01,
        "is_statistically_reliable": True,
        "fund_age_years": 7.5
    }
    
    print("Testing Debt Fund Scoring:")
    print("-" * 60)
    debt_score = calculate_category_score(debt_metrics, "Debt")
    print(f"Total Score: {debt_score['total']}")
    print(f"Tier: {debt_score['tier']['emoji']} {debt_score['tier']['label']}")
    print(f"Category: {debt_score['category']}")
    print(f"Metrics Used: {debt_score['total_metrics_used']}/{debt_score['total_metrics_available']}")
    print(f"Reliability: {debt_score['reliability']}")
    
    print("\n" + "=" * 60 + "\n")
    
    # To run on actual data:
    # calculate_scores_for_all_funds(
    #     "data/scheme_metrics_merged.json",
    #     "data/scheme_metrics_scored.json"
    # )
