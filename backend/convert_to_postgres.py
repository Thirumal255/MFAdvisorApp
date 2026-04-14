# convert_to_postgres_FAST.py
"""
OPTIMIZED Fast PostgreSQL Conversion
Uses bulk inserts and optimized batching
Automatically inserts into multiple databases
"""

import json
import psycopg2
from psycopg2.extras import execute_values
from pathlib import Path
import sys
from datetime import datetime
import os

# 🟢 Define the target databases here

# Check if we are in GitHub Actions (it will provide the DATABASE_URL)
prod_db = os.environ.get("DATABASE_URL")

if prod_db:
    TARGET_DBS = [prod_db] # Run only production in cloud
else:
    # Run local and (optionally) remote when testing on your machine
    TARGET_DBS = [
        "postgresql://postgres:admin@localhost:5432/mf_advisor"
    ]

def convert_to_postgres_fast():
    """Fast conversion with optimized bulk inserts"""
    
    print("=" * 70)
    print("🚀 FAST PostgreSQL Conversion (Multi-DB)")
    print("=" * 70)
    
    # Load JSON file
    json_file = Path("data/parent_scheme_nav.json")
    
    if not json_file.exists():
        print(f"❌ Error: {json_file} not found!")
        return False
    
    print(f"\n📂 Loading {json_file}...")
    json_size_mb = json_file.stat().st_size / (1024 * 1024)
    print(f"   File size: {json_size_mb:.1f} MB")
    
    with open(json_file, 'r', encoding='utf-8') as f:
        nav_data = json.load(f)
    
    print(f"✅ Loaded {len(nav_data):,} schemes")
    
    # FAST: Prepare ALL data first, then bulk insert
    print("\n📦 Preparing data for bulk insert...")
    print("   This is fast - just organizing data in memory once...")
    
    all_records = []
    schemes_processed = 0
    
    for scheme_obj in nav_data:
        schemes_processed += 1
        
        # Extract metadata
        meta = scheme_obj.get('meta', {})
        scheme_code = str(meta.get('scheme_code', ''))
        scheme_name = meta.get('scheme_name', '')
        fund_house = meta.get('fund_house', '')
        scheme_type = meta.get('scheme_type', '')
        scheme_category = meta.get('scheme_category', '')
        
        # Extract NAV data
        nav_records = scheme_obj.get('data', [])
        
        for nav_record in nav_records:
            date_str = nav_record.get('date', '')
            nav_value = nav_record.get('nav', '0')
            
            try:
                # Convert DD-MM-YYYY to YYYY-MM-DD
                date_obj = datetime.strptime(date_str, '%d-%m-%Y')
                formatted_date = date_obj.strftime('%Y-%m-%d')
                
                all_records.append((
                    scheme_code,
                    scheme_name,
                    fund_house,
                    scheme_type,
                    scheme_category,
                    formatted_date,
                    float(nav_value)
                ))
                
            except (ValueError, TypeError):
                continue
        
        # Show progress
        if schemes_processed % 100 == 0:
            print(f"   Prepared {schemes_processed:,} schemes, {len(all_records):,} records...", end='\r')
    
    print(f"\n✅ Prepared {len(all_records):,} records from {schemes_processed:,} schemes")
    
    # 🟢 Loop through each database
    for db_idx, db_url in enumerate(TARGET_DBS, 1):
        print("\n" + "=" * 70)
        print(f"🔄 PROCESSING DATABASE {db_idx} / {len(TARGET_DBS)}")
        print(f"🔗 Target: {db_url}")
        print("=" * 70)

        # Connect to PostgreSQL
        print(f"\n🔗 Connecting to PostgreSQL...")
        
        try:
            conn = psycopg2.connect(db_url)
            cursor = conn.cursor()
            print("✅ Connected to database")
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            print(f"⏭️ Skipping to next database...")
            continue
        
        # Create table
        print("\n📊 Creating table...")
        
        cursor.execute("DROP TABLE IF EXISTS scheme_nav;")
        
        cursor.execute("""
            CREATE TABLE scheme_nav (
                scheme_code VARCHAR(50) NOT NULL,
                scheme_name TEXT,
                fund_house TEXT,
                scheme_type TEXT,
                scheme_category TEXT,
                nav_date DATE NOT NULL,
                nav_value DECIMAL(12, 4) NOT NULL,
                PRIMARY KEY (scheme_code, nav_date)
            );
        """)
        
        conn.commit()
        print("✅ Table created")
        
        # FAST: Bulk insert using execute_values
        print("\n🚀 Bulk inserting to PostgreSQL...")
        print("   This will take 5-10 minutes...")
        
        # Insert in large chunks
        chunk_size = 50000  # Much larger chunks
        total_inserted = 0
        
        for i in range(0, len(all_records), chunk_size):
            chunk = all_records[i:i + chunk_size]
            
            # Use execute_values for super fast bulk insert
            execute_values(
                cursor,
                """INSERT INTO scheme_nav 
                   VALUES %s
                   ON CONFLICT (scheme_code, nav_date) DO NOTHING""",
                chunk,
                template="(%s, %s, %s, %s, %s, %s, %s)",
                page_size=10000
            )
            
            conn.commit()
            total_inserted += len(chunk)
            
            # Show progress
            percent = (total_inserted / len(all_records)) * 100
            print(f"   Inserted {total_inserted:,} / {len(all_records):,} records ({percent:.1f}%)", end='\r')
        
        print(f"\n✅ Inserted {total_inserted:,} total records")
        
        # Create indexes
        print("\n🔍 Creating indexes (this takes 2-3 minutes)...")
        
        cursor.execute("CREATE INDEX idx_scheme_code ON scheme_nav(scheme_code);")
        print("   ✓ Index on scheme_code")
        
        cursor.execute("CREATE INDEX idx_nav_date ON scheme_nav(nav_date);")
        print("   ✓ Index on nav_date")
        
        cursor.execute("CREATE INDEX idx_fund_house ON scheme_nav(fund_house);")
        print("   ✓ Index on fund_house")
        
        conn.commit()
        print("✅ All indexes created")
        
        # Verify data
        print("\n🧪 Verifying data...")
        
        cursor.execute("SELECT COUNT(*) FROM scheme_nav")
        count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(DISTINCT scheme_code) FROM scheme_nav")
        schemes = cursor.fetchone()[0]
        
        cursor.execute("SELECT MAX(nav_date) FROM scheme_nav")
        latest_date = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        print(f"\n📊 Statistics for Database {db_idx}:")
        print(f"   Total NAV records: {count:,}")
        print(f"   Unique schemes: {schemes:,}")
        print(f"   Average records per scheme: {count // schemes:,}")
        print(f"   Latest NAV date: {latest_date}")
        print(f"✅ Finished database {db_idx} successfully.")

    print("\n" + "=" * 70)
    print("✅ ALL CONVERSIONS COMPLETE!")
    print("=" * 70)
    
    return True

if __name__ == "__main__":
    print("\n🚀 FAST PostgreSQL Conversion Script (Dual DB)")
    print("   This version uses optimized bulk inserts to multiple databases")
    print("   Expected time: 20-30 minutes total\n")
    
    # Auto-proceed if running in CI, otherwise ask
    if os.environ.get("CI"):
        proceed = 'yes'
    else:
        proceed = input("Continue? (yes/no): ").strip().lower()
        
    if proceed == 'yes':
        success = convert_to_postgres_fast()
        sys.exit(0 if success else 1)