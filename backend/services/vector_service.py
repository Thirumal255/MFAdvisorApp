"""
Vector Service - Load Pre-built Index Only
==========================================
FILE: backend/services/vector_service.py

This version:
- Downloads pre-built FAISS index from Cloud Storage
- Does NOT generate embeddings on startup
- Only uses OpenAI for search queries (fast!)
- Falls back gracefully if index not available

The index must be pre-built locally and uploaded to GCS.
Run build_and_upload_index.py to create it.
"""

import os
import json
import numpy as np
from pathlib import Path
from typing import List, Dict, Optional
import logging
import threading

logger = logging.getLogger(__name__)

# ============================================================
# CONFIGURATION
# ============================================================
IS_CLOUD = os.environ.get('K_SERVICE') is not None
GCS_BUCKET = os.environ.get('GCS_BUCKET', 'run-sources-mf-advisor-487108-asia-south1')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')

if IS_CLOUD:
    DATA_DIR = "/tmp/data"
    FAISS_DIR = "/tmp/faiss_index"
else:
    DATA_DIR = os.environ.get('DATA_DIR', './data')
    FAISS_DIR = os.environ.get('FAISS_DIR', './data/faiss_index')

EMBEDDING_MODEL = "text-embedding-ada-002"
EMBEDDING_DIM = 1536


class VectorService:
    """
    Vector service that loads pre-built FAISS index.
    Index must be uploaded to GCS beforehand.
    """
    
    def __init__(self):
        self.index = None
        self.documents: List[str] = []
        self.metadata: List[Dict] = []
        self.openai_client = None
        self.embedding_dim = EMBEDDING_DIM
        
        # Status
        self._initialized = False
        self._loading = False
        self._error: Optional[str] = None
        
        # Create directories
        Path(DATA_DIR).mkdir(parents=True, exist_ok=True)
        Path(FAISS_DIR).mkdir(parents=True, exist_ok=True)
        
        # Initialize OpenAI (for search queries only)
        self._init_openai()
        
        # Start background loading
        self._start_background_load()
    
    def _init_openai(self):
        """Initialize OpenAI client for search queries."""
        if not OPENAI_API_KEY:
            logger.warning("⚠️ OPENAI_API_KEY not set - search won't work")
            return
        
        try:
            from openai import OpenAI
            self.openai_client = OpenAI(api_key=OPENAI_API_KEY)
            logger.info("✅ OpenAI client ready")
        except Exception as e:
            logger.error(f"OpenAI init error: {e}")
    
    def _start_background_load(self):
        """Load index in background thread."""
        if self._loading:
            return
        
        self._loading = True
        thread = threading.Thread(target=self._load_index, daemon=True)
        thread.start()
        logger.info("🔄 Background index loading started...")
    
    def _load_index(self):
        """Download and load pre-built index."""
        try:
            # Download from GCS
            if not self._download_index_from_gcs():
                self._error = "Could not download index from GCS"
                logger.warning(f"⚠️ {self._error}")
                self._loading = False
                return
            
            # Load FAISS index
            import faiss
            
            index_file = os.path.join(FAISS_DIR, "index.faiss")
            meta_file = os.path.join(FAISS_DIR, "metadata.json")
            
            if not os.path.exists(index_file) or not os.path.exists(meta_file):
                self._error = "Index files not found after download"
                logger.warning(f"⚠️ {self._error}")
                self._loading = False
                return
            
            # Load index
            self.index = faiss.read_index(index_file)
            
            # Load metadata
            with open(meta_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.documents = data.get('documents', [])
                self.metadata = data.get('metadata', [])
            
            self._initialized = True
            logger.info(f"✅ Loaded index: {self.index.ntotal} vectors")
            
        except Exception as e:
            self._error = str(e)
            logger.error(f"❌ Index load error: {e}")
        finally:
            self._loading = False
    
    def _download_index_from_gcs(self) -> bool:
        """Download index files from Cloud Storage."""
        if not GCS_BUCKET:
            logger.warning("GCS_BUCKET not set")
            return False
        
        try:
            from google.cloud import storage
            
            logger.info(f"📥 Downloading index from gs://{GCS_BUCKET}/faiss_index/...")
            
            client = storage.Client()
            bucket = client.bucket(GCS_BUCKET)
            
            files = [
                ("faiss_index/index.faiss", os.path.join(FAISS_DIR, "index.faiss")),
                ("faiss_index/metadata.json", os.path.join(FAISS_DIR, "metadata.json")),
            ]
            
            for gcs_path, local_path in files:
                blob = bucket.blob(gcs_path)
                if blob.exists():
                    blob.download_to_filename(local_path)
                    logger.info(f"   ✅ Downloaded: {gcs_path}")
                else:
                    logger.warning(f"   ⚠️ Not found: {gcs_path}")
                    return False
            
            return True
            
        except ImportError:
            logger.warning("google-cloud-storage not installed")
            return False
        except Exception as e:
            logger.error(f"GCS download error: {e}")
            return False
    
    def _get_embedding(self, text: str) -> Optional[np.ndarray]:
        """Get embedding for search query."""
        if not self.openai_client:
            return None
        
        try:
            response = self.openai_client.embeddings.create(
                model=EMBEDDING_MODEL,
                input=text[:8000]
            )
            emb = np.array(response.data[0].embedding, dtype=np.float32)
            emb = emb / np.linalg.norm(emb)
            return emb
        except Exception as e:
            logger.error(f"Embedding error: {e}")
            return None
    
    def search(self, query: str, n_results: int = 5, **kwargs) -> List[Dict]:
        """Search for similar funds."""
        if not self.is_ready():
            return []
        
        if not query:
            return []
        
        # Get query embedding
        emb = self._get_embedding(query)
        if emb is None:
            return []
        
        try:
            # Search FAISS
            scores, indices = self.index.search(
                emb.reshape(1, -1),
                min(n_results * 2, self.index.ntotal)
            )
            
            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx < 0 or idx >= len(self.documents):
                    continue
                
                meta = self.metadata[idx] if idx < len(self.metadata) else {}
                
                results.append({
                    "content": self.documents[idx],
                    "fund_code": meta.get("fund_code"),
                    "fund_name": meta.get("fund_name"),
                    "category": meta.get("category"),
                    "risk_level": meta.get("risk_level"),
                    "relevance_score": round(float(score), 4)
                })
                
                if len(results) >= n_results:
                    break
            
            return results
            
        except Exception as e:
            logger.error(f"Search error: {e}")
            return []
    
    def is_ready(self) -> bool:
        """Check if service is ready for queries."""
        return self._initialized and self.index is not None and self.index.ntotal > 0
    
    def get_stats(self) -> Dict:
        """Get service statistics."""
        return {
            "initialized": self._initialized,
            "loading": self._loading,
            "total_vectors": self.index.ntotal if self.index else 0,
            "total_documents": len(self.documents),
            "error": self._error,
            "is_cloud": IS_CLOUD,
            "gcs_bucket": GCS_BUCKET
        }
    
    def get_status(self) -> str:
        """Get human-readable status."""
        if self._error:
            return f"error: {self._error}"
        if self._loading:
            return "loading..."
        if self.is_ready():
            return f"ready ({self.index.ntotal} vectors)"
        return "not initialized"


# ============================================================
# SINGLETON
# ============================================================
_vector_service: Optional[VectorService] = None
_lock = threading.Lock()


def get_vector_service() -> VectorService:
    """Get or create vector service singleton."""
    global _vector_service
    
    if _vector_service is None:
        with _lock:
            if _vector_service is None:
                _vector_service = VectorService()
    
    return _vector_service