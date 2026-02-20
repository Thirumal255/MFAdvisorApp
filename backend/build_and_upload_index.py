"""
Build FAISS Index Locally & Upload to Cloud Storage
====================================================
FILE: build_and_upload_index.py

Run this ONCE on your local machine to:
1. Load scheme_metrics_merged.json
2. Generate embeddings using OpenAI
3. Build FAISS index
4. Upload index files to Cloud Storage

Usage:
    python build_and_upload_index.py

Requirements:
    pip install faiss-cpu openai google-cloud-storage numpy
"""

import os
import json
import numpy as np
from pathlib import Path
from typing import List, Dict
import time

# ============================================================
# CONFIGURATION - UPDATE THESE
# ============================================================
GCS_BUCKET = "run-sources-mf-advisor-487108-asia-south1"
DATA_FILE = "./data/scheme_metrics_merged.json"  # Local path to your fund data
OUTPUT_DIR = "./data/faiss_index"  # Local output directory
EMBEDDING_MODEL = "text-embedding-ada-002"
EMBEDDING_DIM = 1536

# ============================================================
# SETUP
# ============================================================

def load_openai_key():
    """Load OpenAI API key from file or environment."""
    # Try file first
    key_files = [
        "./OPENAI_API_KEY.txt",
        "./openai_api_key.txt",
        "../OPENAI_API_KEY.txt",
        "./data/OPENAI_API_KEY.txt",
    ]
    
    for key_file in key_files:
        if os.path.exists(key_file):
            with open(key_file, 'r') as f:
                key = f.read().strip()
                if key:
                    os.environ["OPENAI_API_KEY"] = key
                    print(f"   ✅ Loaded API key from {key_file}")
                    return key
    
    # Fall back to environment variable
    return os.environ.get("OPENAI_API_KEY")


def check_requirements():
    """Check all requirements are installed."""
    print("🔍 Checking requirements...")
    
    # Check OpenAI API key
    api_key = load_openai_key()
    if not api_key:
        print("❌ OPENAI_API_KEY not found!")
        print("   Create a file: OPENAI_API_KEY.txt with your key")
        print("   Or set environment variable: set OPENAI_API_KEY=your-key")
        return False
    print(f"   ✅ OPENAI_API_KEY ready")
    
    # Check data file
    if not os.path.exists(DATA_FILE):
        print(f"❌ Data file not found: {DATA_FILE}")
        return False
    print(f"   ✅ Data file found: {DATA_FILE}")
    
    # Check packages
    try:
        import faiss
        print(f"   ✅ faiss-cpu installed")
    except ImportError:
        print("❌ faiss-cpu not installed. Run: pip install faiss-cpu")
        return False
    
    try:
        from openai import OpenAI
        print(f"   ✅ openai installed")
    except ImportError:
        print("❌ openai not installed. Run: pip install openai")
        return False
    
    try:
        from google.cloud import storage
        print(f"   ✅ google-cloud-storage installed")
    except ImportError:
        print("⚠️ google-cloud-storage not installed (optional for upload)")
        print("   Run: pip install google-cloud-storage")
    
    return True


def load_fund_data() -> Dict:
    """Load fund data from JSON file."""
    print(f"\n📂 Loading fund data from {DATA_FILE}...")
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"   ✅ Loaded {len(data)} funds")
    return data


def create_documents(funds_data: Dict) -> tuple:
    """Create document texts and metadata from fund data."""
    print(f"\n📝 Creating documents...")
    
    docs = []
    metas = []
    
    for fund_name, fund in funds_data.items():
        try:
            # Extract metrics
            metrics = fund.get("metrics", {})
            metrics_text = []
            
            if metrics.get("cagr"):
                metrics_text.append(f"CAGR: {metrics['cagr']*100:.1f}%")
            if metrics.get("rolling_3y"):
                metrics_text.append(f"3Y Return: {metrics['rolling_3y']*100:.1f}%")
            if metrics.get("sharpe"):
                metrics_text.append(f"Sharpe: {metrics['sharpe']:.2f}")
            
            # Build document
            fund_code = fund.get("canonical_code", "")
            category = fund.get("sub_category", fund.get("main_category", ""))
            risk_level = fund.get("riskometer", "")
            description = (fund.get("investment_objective") or "")[:150]
            
            doc_text = f"Fund: {fund_name}. Category: {category}. Risk: {risk_level}. {description}. {', '.join(metrics_text)}"
            
            docs.append(doc_text)
            metas.append({
                'fund_code': str(fund_code),
                'fund_name': fund.get("parent_scheme_name", fund_name),
                'category': category,
                'risk_level': risk_level
            })
            
        except Exception as e:
            print(f"   ⚠️ Error processing {fund_name}: {e}")
    
    print(f"   ✅ Created {len(docs)} documents")
    return docs, metas


def get_embeddings_batch(texts: List[str], batch_size: int = 50) -> List[np.ndarray]:
    """Get embeddings from OpenAI in batches."""
    from openai import OpenAI
    
    client = OpenAI()
    all_embeddings = []
    total = len(texts)
    
    print(f"\n🔄 Getting embeddings for {total} documents...")
    print(f"   Using model: {EMBEDDING_MODEL}")
    print(f"   Batch size: {batch_size}")
    print()
    
    start_time = time.time()
    
    for i in range(0, total, batch_size):
        batch = [t[:8000] for t in texts[i:i + batch_size]]  # Truncate to max tokens
        
        try:
            response = client.embeddings.create(
                model=EMBEDDING_MODEL,
                input=batch
            )
            
            for item in response.data:
                emb = np.array(item.embedding, dtype=np.float32)
                emb = emb / np.linalg.norm(emb)  # Normalize
                all_embeddings.append(emb)
            
            # Progress
            progress = min(i + batch_size, total)
            elapsed = time.time() - start_time
            rate = progress / elapsed if elapsed > 0 else 0
            eta = (total - progress) / rate if rate > 0 else 0
            
            print(f"   Progress: {progress}/{total} ({100*progress//total}%) - ETA: {eta:.0f}s")
            
            # Rate limiting - small delay between batches
            time.sleep(0.5)
            
        except Exception as e:
            print(f"   ❌ Error at batch {i}: {e}")
            # Add zero vectors for failed batch
            for _ in batch:
                all_embeddings.append(np.zeros(EMBEDDING_DIM, dtype=np.float32))
    
    elapsed = time.time() - start_time
    print(f"\n   ✅ Generated {len(all_embeddings)} embeddings in {elapsed:.1f}s")
    
    return all_embeddings


def build_faiss_index(embeddings: List[np.ndarray], docs: List[str], metas: List[Dict]):
    """Build and save FAISS index."""
    import faiss
    
    print(f"\n📊 Building FAISS index...")
    
    # Create output directory
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    
    # Create index
    index = faiss.IndexFlatIP(EMBEDDING_DIM)  # Inner product for cosine similarity
    
    # Add vectors
    valid_count = 0
    valid_docs = []
    valid_metas = []
    
    for emb, doc, meta in zip(embeddings, docs, metas):
        if np.any(emb):  # Skip zero vectors
            index.add(emb.reshape(1, -1))
            valid_docs.append(doc)
            valid_metas.append(meta)
            valid_count += 1
    
    print(f"   ✅ Added {valid_count} vectors to index")
    
    # Save index
    index_file = os.path.join(OUTPUT_DIR, "index.faiss")
    faiss.write_index(index, index_file)
    print(f"   💾 Saved: {index_file} ({os.path.getsize(index_file) / 1024 / 1024:.1f} MB)")
    
    # Save metadata
    meta_file = os.path.join(OUTPUT_DIR, "metadata.json")
    with open(meta_file, 'w', encoding='utf-8') as f:
        json.dump({
            'documents': valid_docs,
            'metadata': valid_metas
        }, f)
    print(f"   💾 Saved: {meta_file} ({os.path.getsize(meta_file) / 1024 / 1024:.1f} MB)")
    
    return index_file, meta_file


def upload_to_gcs(local_files: List[str]):
    """Upload files to Google Cloud Storage."""
    try:
        from google.cloud import storage
    except ImportError:
        print("\n⚠️ google-cloud-storage not installed. Skipping upload.")
        print("   Install with: pip install google-cloud-storage")
        print("   Then run: gcloud auth application-default login")
        return False
    
    print(f"\n📤 Uploading to gs://{GCS_BUCKET}/...")
    
    try:
        client = storage.Client()
        bucket = client.bucket(GCS_BUCKET)
        
        for local_path in local_files:
            filename = os.path.basename(local_path)
            gcs_path = f"faiss_index/{filename}"
            
            blob = bucket.blob(gcs_path)
            blob.upload_from_filename(local_path)
            print(f"   ✅ Uploaded: {gcs_path}")
        
        # Also upload the data file
        data_blob = bucket.blob("scheme_metrics_merged.json")
        data_blob.upload_from_filename(DATA_FILE)
        print(f"   ✅ Uploaded: scheme_metrics_merged.json")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Upload error: {e}")
        print("\n   Make sure you're authenticated:")
        print("   gcloud auth application-default login")
        return False


def test_index():
    """Test the built index."""
    import faiss
    from openai import OpenAI
    
    print(f"\n🧪 Testing index...")
    
    # Load index
    index = faiss.read_index(os.path.join(OUTPUT_DIR, "index.faiss"))
    with open(os.path.join(OUTPUT_DIR, "metadata.json"), 'r') as f:
        data = json.load(f)
    
    print(f"   Index has {index.ntotal} vectors")
    
    # Test search
    client = OpenAI()
    test_query = "best large cap equity fund with good returns"
    
    response = client.embeddings.create(model=EMBEDDING_MODEL, input=test_query)
    query_emb = np.array(response.data[0].embedding, dtype=np.float32)
    query_emb = query_emb / np.linalg.norm(query_emb)
    
    scores, indices = index.search(query_emb.reshape(1, -1), 3)
    
    print(f"\n   Query: '{test_query}'")
    print(f"   Top 3 results:")
    for i, (score, idx) in enumerate(zip(scores[0], indices[0])):
        meta = data['metadata'][idx]
        print(f"   {i+1}. {meta['fund_name'][:50]}... (score: {score:.3f})")
    
    print("\n   ✅ Index working correctly!")


def main():
    print("=" * 60)
    print("  FAISS Index Builder for MF Advisor")
    print("=" * 60)
    
    # Check requirements
    if not check_requirements():
        return
    
    # Load data
    funds_data = load_fund_data()
    
    # Create documents
    docs, metas = create_documents(funds_data)
    
    # Get embeddings
    embeddings = get_embeddings_batch(docs)
    
    # Build index
    index_file, meta_file = build_faiss_index(embeddings, docs, metas)
    
    # Test index
    test_index()
    
    # Upload to GCS
    print("\n" + "=" * 60)
    response = input("Upload to Cloud Storage? (y/N): ")
    if response.lower() == 'y':
        upload_to_gcs([index_file, meta_file])
    else:
        print("\n📁 Files saved locally. Upload manually with:")
        print(f"   gsutil cp {OUTPUT_DIR}/* gs://{GCS_BUCKET}/faiss_index/")
        print(f"   gsutil cp {DATA_FILE} gs://{GCS_BUCKET}/")
    
    print("\n" + "=" * 60)
    print("  ✅ DONE!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Deploy your backend (index will be downloaded from GCS)")
    print("2. First startup will be fast (no embedding generation)")


if __name__ == "__main__":
    main()