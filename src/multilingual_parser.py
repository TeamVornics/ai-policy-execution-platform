"""
Multilingual Parser Module
Handles language detection and translation for Hindi support.
"""

import re
from typing import Tuple, Dict, Any
from deep_translator import GoogleTranslator
from src.policy_parser import PolicyParser

class MultilingualParser:
    """Wrapper around PolicyParser to handle multilingual input."""
    
    def __init__(self, parser: PolicyParser):
        self.parser = parser
        # Initialize translator (default is auto -> en)
        self.translator = GoogleTranslator(source='auto', target='en')
        
    def detect_language(self, text: str) -> str:
        """
        Detects if text is primarily Hindi or English.
        Uses Devanagari Unicode block heuristic (U+0900 to U+097F).
        """
        # Count Devanagari characters
        devanagari_chars = len(re.findall(r'[\u0900-\u097F]', text))
        total_chars = len(text.strip())
        
        if total_chars == 0:
            return "en"
            
        # If > 10% characters are Devanagari, assume Hindi
        if (devanagari_chars / total_chars) > 0.1:
            return "hi"
        return "en"

    def translate_to_english(self, text: str) -> str:
        """Translates Hindi text to English."""
        try:
            # Deep Translator handles splitting automatically usually, but let's be safe
            translated = self.translator.translate(text)
            return translated
        except Exception as e:
            print(f"⚠️ Translation failed: {e}")
            return text  # Return original if failed

    def parse_multilingual_policy(self, text: str, use_cache: bool = True) -> Dict[str, Any]:
        """
        Detects language, translates if needed, and extracts rules.
        """
        lang = self.detect_language(text)
        translated_text = text
        
        if lang == "hi":
            print(f"🇮🇳 Hindi detected. Translating to English...")
            translated_text = self.translate_to_english(text)
            print(f"📝 Translated: {translated_text[:100]}...")
            
        # Use existing parser on English text
        result = self.parser.extract_rules_from_policy(translated_text, use_cache=use_cache)
        
        # Add multilingual metadata
        if "metadata" not in result:
            result["metadata"] = {}
            
        result["metadata"]["original_language"] = lang
        result["metadata"]["is_translated"] = (lang != "en")
        
        # Store original text if translated to show context
        if lang != "en":
            result["metadata"]["original_text_snippet"] = text[:200]
            
        return result
