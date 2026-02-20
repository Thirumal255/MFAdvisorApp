"""
Run this script in your backend folder to get all unique categories.

Usage:
    cd backend
    python extract_categories.py
"""

import json
from pathlib import Path
from collections import defaultdict

# Load fund data
paths = [
    Path("./data/scheme_metrics_merged.json"),
    Path("../data/scheme_metrics_merged.json"),
]

data = {}
for p in paths:
    if p.exists():
        with open(p, encoding='utf-8') as f:
            data = json.load(f)
        print(f"✅ Loaded from: {p}")
        break

if not data:
    print("❌ Fund data not found!")
    exit()

print(f"📊 Total funds: {len(data)}")

# Extract categories
main_categories = defaultdict(set)  # main_category -> set of sub_categories
sub_category_counts = defaultdict(int)
main_category_counts = defaultdict(int)

for fund_name, fund in data.items():
    main_cat = fund.get("main_category") or "Unknown"
    sub_cat = fund.get("sub_category") or "Uncategorized"  # Handle None
    
    main_categories[main_cat].add(sub_cat)
    sub_category_counts[sub_cat] += 1
    main_category_counts[main_cat] += 1

# Print results
print("\n" + "="*60)
print("MAIN CATEGORIES AND THEIR SUB-CATEGORIES")
print("="*60)

for main_cat in sorted(main_categories.keys()):
    sub_cats = main_categories[main_cat]
    print(f"\n🏷️  {main_cat} ({main_category_counts[main_cat]} funds)")
    print("-" * 40)
    # Sort with None handling
    for sub_cat in sorted(sub_cats, key=lambda x: x or "zzz"):
        count = sub_category_counts[sub_cat]
        print(f"    • {sub_cat} ({count} funds)")

# Print as Python dict for synonyms
print("\n" + "="*60)
print("COPY THIS FOR CATEGORY_SYNONYMS:")
print("="*60)

print("\nMAIN_CATEGORY_MAP = {")
for main_cat in sorted(main_categories.keys()):
    sub_cats = sorted([s for s in main_categories[main_cat] if s], key=lambda x: x or "")
    sub_cats_str = ", ".join([f'"{s}"' for s in sub_cats if s])
    print(f'    "{main_cat.lower()}": [{sub_cats_str}],')
print("}")

print("\n" + "="*60)
print("ALL SUB-CATEGORIES (for reference):")
print("="*60)
for sub_cat in sorted([s for s in sub_category_counts.keys() if s], key=lambda x: x or ""):
    if sub_cat:
        print(f'    "{sub_cat}",')