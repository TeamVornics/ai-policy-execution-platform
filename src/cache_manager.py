"""
Cache Manager Module
Handles file-based caching for LLM responses to optimize performance.
"""

import os
import json
import hashlib
import time
from pathlib import Path
from typing import Any, Optional

class CacheManager:
    """
    Simple file-based cache with TTL expiration.
    """
    
    def __init__(self, cache_dir: str = "demo_data/cache", ttl_seconds: int = 86400):
        self.cache_dir = Path(cache_dir)
        self.ttl_seconds = ttl_seconds
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
    def get(self, key_content: str) -> Optional[Any]:
        """Retrieve value from cache if exists and not expired."""
        cache_file = self._get_cache_path(key_content)
        
        if not cache_file.exists():
            return None
            
        try:
            with open(cache_file, 'r') as f:
                data = json.load(f)
                
            # Check expiration
            if time.time() - data['timestamp'] > self.ttl_seconds:
                # Expired
                self.delete(key_content)
                return None
                
            return data['payload']
            
        except (json.JSONDecodeError, KeyError):
            return None

    def set(self, key_content: str, value: Any):
        """Save value to cache."""
        cache_file = self._get_cache_path(key_content)
        
        data = {
            'timestamp': time.time(),
            'payload': value
        }
        
        try:
            with open(cache_file, 'w') as f:
                json.dump(data, f)
        except Exception as e:
            print(f"⚠️ Cache write failed: {e}")

    def delete(self, key_content: str):
        """Remove item from cache."""
        cache_file = self._get_cache_path(key_content)
        if cache_file.exists():
            os.remove(cache_file)

    def _get_cache_path(self, content: str) -> Path:
        """Generate safe filesystem path from content hash."""
        # Use SHA-256 for collision resistance
        content_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()
        return self.cache_dir / f"{content_hash}.json"

    def clear_all(self):
        """Clear all cache files."""
        for f in self.cache_dir.glob("*.json"):
            os.remove(f)
