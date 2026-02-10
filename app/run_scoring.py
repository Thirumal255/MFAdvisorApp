"""
Run Category-Specific Scoring
Calculates scores and replaces scheme_metrics_merged.json
"""

import json
from pathlib import Path
from app.scoring_engine import calculate_category_score

# Paths
BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"

INPUT_FILE = DATA_DIR / "scheme_metrics_merged.json"
OUTPUT_FILE = DATA_DIR / "scheme_metrics_merged.json"  # Replace in-place

def run_scoring():
    """Calculate category-specific scores for all funds"""
    
    print("=" * 70)
    print("CATEGORY-SPECIFIC SCORING SYSTEM")
    print("=" * 70)
    
    # Load data
    print(f"\n📂 Loading: {INPUT_FILE}")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        all_funds = json.load(f)
    
    print(f"✓ Found {len(all_funds)} funds")
    
    # Statistics
    stats = {
        'total': len(all_funds),
        'scored': 0,
        'skipped': 0,
        'by_category': {},
        'by_tier': {
            'excellent': 0,
            'good': 0,
            'average': 0,
            'below_average': 0,
            'poor': 0,
            'insufficient_data': 0  # NEW
        }
    }
    
    # Process each fund
    print("\n🔄 Calculating scores...")
    for idx, (fund_name, fund_data) in enumerate(all_funds.items(), 1):
        if idx % 100 == 0:
            print(f"  Progress: {idx}/{len(all_funds)}...")
        
        metrics = fund_data.get("metrics", {})
        main_category = fund_data.get("main_category", "Other")
        
        try:
            # Calculate score
            score_result = calculate_category_score(metrics, main_category)
            
            # Add to fund data
            fund_data["score"] = score_result
            
            # Update stats
            stats['scored'] += 1
            stats['by_category'][main_category] = stats['by_category'].get(main_category, 0) + 1
            stats['by_tier'][score_result['tier']['name']] += 1
            
        except Exception as e:
            print(f"\n⚠️  Error for {fund_name}: {e}")
            stats['skipped'] += 1
    
    # Save back to same file
    print(f"\n💾 Saving to: {OUTPUT_FILE}")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_funds, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print("\n" + "=" * 70)
    print("✅ SCORING COMPLETE")
    print("=" * 70)
    
    print(f"\n📊 Overall:")
    print(f"  Total funds: {stats['total']}")
    print(f"  ✅ Scored: {stats['scored']}")
    print(f"  ⚠️  Skipped: {stats['skipped']}")
    
    print(f"\n📈 By Category:")
    for cat in sorted(stats['by_category'].keys()):
        count = stats['by_category'][cat]
        pct = (count / stats['total'] * 100) if stats['total'] > 0 else 0
        print(f"  {cat:20s}: {count:4d} ({pct:5.1f}%)")
    
    print(f"\n🏆 By Tier:")
    tier_display = {
        'excellent': '🌟 Excellent',
        'good': '👍 Good',
        'average': '😐 Average',
        'below_average': '👎 Below Average',
        'poor': '⚠️  Poor',
        'insufficient_data': '📊 Not Enough Data'  # NEW
    }
    
    for tier_key in ['excellent', 'good', 'average', 'below_average', 'poor', 'insufficient_data']:
        count = stats['by_tier'][tier_key]
        pct = (count / stats['scored'] * 100) if stats['scored'] > 0 else 0
        label = tier_display[tier_key]
        print(f"  {label:25s}: {count:4d} ({pct:5.1f}%)")
    
    print(f"\n💾 Output: {OUTPUT_FILE}")
    print("=" * 70)
    
    return stats


if __name__ == "__main__":
    run_scoring()
