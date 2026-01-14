"""Utility functions for policy analysis"""

import re
from typing import List, Dict, Any
import json


def clean_text(text: str) -> str:
    """
    Clean and normalize text
    
    Args:
        text: Raw text to clean
        
    Returns:
        Cleaned text
    """
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove leading/trailing whitespace
    text = text.strip()
    return text


def extract_sentences(text: str) -> List[str]:
    """
    Extract sentences from text
    
    Args:
        text: Text to split into sentences
        
    Returns:
        List of sentences
    """
    # Simple sentence splitting (can be enhanced)
    sentences = re.split(r'[.!?]+', text)
    return [s.strip() for s in sentences if s.strip()]


def find_ambiguity_triggers(text: str, triggers: List[str]) -> List[str]:
    """
    Find ambiguity trigger phrases in text
    
    Args:
        text: Text to search
        triggers: List of trigger phrases to look for
        
    Returns:
        List of found trigger phrases
    """
    text_lower = text.lower()
    found_triggers = []
    
    for trigger in triggers:
        if trigger.lower() in text_lower:
            found_triggers.append(trigger)
    
    return found_triggers


def extract_monetary_values(text: str) -> List[str]:
    """
    Extract monetary values from text
    
    Args:
        text: Text to search
        
    Returns:
        List of monetary values found
    """
    # Pattern for Indian Rupee amounts
    patterns = [
        r'₹\s*[\d,]+',  # ₹10,000
        r'Rs\.?\s*[\d,]+',  # Rs. 10000 or Rs 10000
        r'INR\s*[\d,]+',  # INR 10000
    ]
    
    values = []
    for pattern in patterns:
        matches = re.findall(pattern, text)
        values.extend(matches)
    
    return values


def extract_time_constraints(text: str) -> List[str]:
    """
    Extract time constraints and deadlines from text
    
    Args:
        text: Text to search
        
    Returns:
        List of time constraints found
    """
    # Patterns for time constraints
    patterns = [
        r'\d+\s+days?',
        r'\d+\s+weeks?',
        r'\d+\s+months?',
        r'\d+\s+years?',
        r'within\s+\d+\s+\w+',
        r'before\s+\d+\s+\w+',
        r'after\s+\d+\s+\w+',
    ]
    
    constraints = []
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        constraints.extend(matches)
    
    return constraints


def extract_roles(text: str) -> List[str]:
    """
    Extract role/position mentions from text
    
    Args:
        text: Text to search
        
    Returns:
        List of roles found
    """
    # Common role patterns
    role_keywords = [
        'officer', 'authority', 'committee', 'department',
        'minister', 'secretary', 'director', 'head',
        'board', 'council', 'commission', 'administrator'
    ]
    
    roles = []
    text_lower = text.lower()
    
    # Find phrases containing role keywords
    for keyword in role_keywords:
        pattern = r'\b[\w\s]+' + keyword + r'\b'
        matches = re.findall(pattern, text_lower)
        roles.extend([m.strip() for m in matches])
    
    return list(set(roles))  # Remove duplicates


def save_json(data: Dict[Any, Any], filepath: str) -> None:
    """
    Save data to JSON file
    
    Args:
        data: Data to save
        filepath: Path to save file
    """
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def load_json(filepath: str) -> Dict[Any, Any]:
    """
    Load data from JSON file
    
    Args:
        filepath: Path to JSON file
        
    Returns:
        Loaded data
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def load_text_file(filepath: str) -> str:
    """
    Load text from file (supports .txt and .pdf)
    
    Args:
        filepath: Path to file
        
    Returns:
        File contents as string
    """
    if filepath.lower().endswith('.pdf'):
        try:
            from pypdf import PdfReader
            reader = PdfReader(filepath)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except ImportError:
            raise ImportError("pypdf is required for PDF support. Install it with `pip install pypdf`")
    
    # Default to text file read
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()


def generate_rule_id(index: int, prefix: str = "RULE") -> str:
    """
    Generate a rule ID
    
    Args:
        index: Rule index number
        prefix: Prefix for the ID
        
    Returns:
        Generated rule ID
    """
    return f"{prefix}_{index:03d}"
