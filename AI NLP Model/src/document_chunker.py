"""
Document Chunking Logic for Large Policies.
Splits text into context-aware chunks to fit within LLM context windows.
"""

import re
from typing import List, Dict, Any

class DocumentChunker:
    """Intelligent document splitting for large policies."""
    
    def __init__(self, max_chunk_size: int = 12000, overlap: int = 500):
        self.max_chunk_size = max_chunk_size
        self.overlap = overlap
        
    def chunk_document(self, text: str) -> List[Dict[str, Any]]:
        """
        Splits document into logical chunks.
        
        Args:
           text: The full document text.
           
        Returns:
           List of dicts with 'chunk_id', 'content', 'start_char', 'end_char'
        """
        # If text is small enough, return as is
        if len(text) <= self.max_chunk_size:
            return [{
                "chunk_id": 1,
                "content": text,
                "start_char": 0,
                "end_char": len(text)
            }]
            
        chunks = []
        current_pos = 0
        total_len = len(text)
        chunk_counter = 1
        
        # Split by potential section headers first to respect structure
        # Headers: ALL CAPS lines, "Section X", "Part X", "Annexure"
        # We'll use a regex to find safe split points
        
        while current_pos < total_len:
            end_pos = min(current_pos + self.max_chunk_size, total_len)
            
            # If we are not at the end, verify we are at a safe split point
            if end_pos < total_len:
                # Look for the last newline or period in the last 10% of the chunk window
                # to avoid splitting mid-sentence or mid-word
                search_window_start = max(current_pos, end_pos - 1000)
                window_text = text[search_window_start:end_pos]
                
                # Priority 1: Double newline (paragraph break)
                split_idx = window_text.rfind('\n\n')
                if split_idx == -1:
                    # Priority 2: Single newline
                    split_idx = window_text.rfind('\n')
                if split_idx == -1:
                    # Priority 3: Period + space
                    split_idx = window_text.rfind('. ')
                
                if split_idx != -1:
                    end_pos = search_window_start + split_idx + 1 # Include the break char
            
            chunk_content = text[current_pos:end_pos]
            
            chunks.append({
                "chunk_id": chunk_counter,
                "content": chunk_content,
                "start_char": current_pos,
                "end_char": end_pos
            })
            
            print(f"📄 Created Chunk {chunk_counter}: {len(chunk_content)} chars")
            
            # Move position, considering overlap implies backing up a bit? 
            # Actually, standard chunking merges results. Overlap might cause duplicate rules.
            # For rule extraction, clean splits are often better if we don't split rules.
            # We'll stick to clean splits for now but ensure we didn't cut a rule.
            # The 'search_window' logic helps prevent cutting mid-sentence.
            
            current_pos = end_pos
            chunk_counter += 1
            
        return chunks
