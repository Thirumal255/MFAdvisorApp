"""
Safe Vector Service Loader
==========================
FILE: backend/services/vector_loader.py

Put this in backend/services/vector_loader.py

Then in chat.py, use:
    from services.vector_loader import get_vector_service_safe, search_funds_semantic

This ensures the app doesn't crash even if vector service has issues.
"""

import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

# Global state
_vector_service = None
_load_attempted = False
_load_error: Optional[str] = None


def get_vector_service_safe():
    """
    Safely get vector service - won't crash if unavailable.
    Returns None if service can't be loaded.
    """
    global _vector_service, _load_attempted, _load_error
    
    if _load_attempted:
        return _vector_service
    
    _load_attempted = True
    
    try:
        from services.vector_service import VectorService
        _vector_service = VectorService()
        logger.info("✅ Vector service loaded successfully")
    except ImportError as e:
        _load_error = f"Import error: {e}"
        logger.warning(f"⚠️ Vector service not available: {_load_error}")
    except Exception as e:
        _load_error = str(e)
        logger.warning(f"⚠️ Vector service failed to initialize: {_load_error}")
    
    return _vector_service


def search_funds_semantic(query: str, n_results: int = 5) -> List[Dict]:
    """
    Search funds using vector similarity.
    Returns empty list if service unavailable.
    """
    svc = get_vector_service_safe()
    
    if svc is None:
        logger.debug("Vector search unavailable - returning empty")
        return []
    
    try:
        if hasattr(svc, 'is_ready') and not svc.is_ready():
            logger.debug("Vector service not ready yet")
            return []
        
        return svc.search(query, n_results=n_results)
    except Exception as e:
        logger.warning(f"Vector search error: {e}")
        return []


def get_vector_status() -> Dict:
    """Get vector service status for health checks."""
    svc = get_vector_service_safe()
    
    if svc is None:
        return {
            "available": False,
            "error": _load_error,
            "documents": 0
        }
    
    try:
        stats = svc.get_stats() if hasattr(svc, 'get_stats') else {}
        return {
            "available": True,
            "initialized": stats.get('initialized', False),
            "loading": stats.get('loading', False),
            "documents": stats.get('total_vectors', 0),
            "error": stats.get('error')
        }
    except Exception as e:
        return {
            "available": False,
            "error": str(e),
            "documents": 0
        }


def is_vector_ready() -> bool:
    """Check if vector search is ready."""
    svc = get_vector_service_safe()
    if svc is None:
        return False
    
    try:
        return svc.is_ready() if hasattr(svc, 'is_ready') else svc.index.ntotal > 0
    except:
        return False
