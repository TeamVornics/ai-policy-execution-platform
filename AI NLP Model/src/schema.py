"""Data structures and schema definitions for policy analysis"""

from typing import List, Optional
from pydantic import BaseModel, Field, validator


# Exact schema structure as required
POLICY_SCHEMA = {
    "policy_id": "",
    "policy_title": "",
    "rules": [{
        "rule_id": "",
        "conditions": [],
        "action": "",
        "responsible_role": "",
        "beneficiary": "",
        "deadline": "",
        "ambiguity_flag": False,
        "ambiguity_reason": ""
    }]
}


# Ambiguity trigger phrases
AMBIGUITY_TRIGGERS = [
    "as applicable",
    "where necessary",
    "subject to approval",
    "may be",
    "as decided by authority",
    "appropriate action",
    "if required",
    "suitable measures",
    "as deemed fit",
    "at the discretion of",
    "as per requirement",
    "if deemed necessary",
    "as appropriate",
    "when required"
]


class PolicyRule(BaseModel):
    """Pydantic model for a single policy rule with validation"""
    
    rule_id: str = Field(..., description="Unique identifier for the rule")
    conditions: List[str] = Field(default_factory=list, description="List of conditions that must be met")
    action: str = Field(..., description="The action to be taken")
    responsible_role: str = Field(default="", description="Who is responsible for executing this rule")
    beneficiary: str = Field(default="", description="Who benefits from this rule")
    deadline: str = Field(default="", description="Time constraint or deadline")
    ambiguity_flag: bool = Field(default=False, description="Whether this rule contains ambiguous language")
    ambiguity_reason: str = Field(default="", description="Explanation of the ambiguity if flagged")
    
    @validator('rule_id')
    def rule_id_not_empty(cls, v):
        """Ensure rule_id is not empty"""
        if not v or not v.strip():
            raise ValueError('rule_id cannot be empty')
        return v.strip()
    
    @validator('action')
    def action_not_empty(cls, v):
        """Ensure action is not empty"""
        if not v or not v.strip():
            raise ValueError('action cannot be empty')
        return v.strip()
    
    class Config:
        json_schema_extra = {
            "example": {
                "rule_id": "RULE_001",
                "conditions": ["Student belongs to SC category", "Documents verified"],
                "action": "Receive ₹10,000 scholarship",
                "responsible_role": "District Officer",
                "beneficiary": "SC category students",
                "deadline": "15 days",
                "ambiguity_flag": False,
                "ambiguity_reason": ""
            }
        }


class Policy(BaseModel):
    """Pydantic model for a complete policy document"""
    
    policy_id: str = Field(..., description="Unique identifier for the policy")
    policy_title: str = Field(..., description="Title of the policy")
    rules: List[PolicyRule] = Field(default_factory=list, description="List of rules in this policy")
    
    @validator('policy_id')
    def policy_id_not_empty(cls, v):
        """Ensure policy_id is not empty"""
        if not v or not v.strip():
            raise ValueError('policy_id cannot be empty')
        return v.strip()
    
    @validator('policy_title')
    def policy_title_not_empty(cls, v):
        """Ensure policy_title is not empty"""
        if not v or not v.strip():
            raise ValueError('policy_title cannot be empty')
        return v.strip()
    
    class Config:
        json_schema_extra = {
            "example": {
                "policy_id": "POL_2024_001",
                "policy_title": "SC Category Scholarship Policy",
                "rules": []
            }
        }


def validate_schema(data: dict) -> Policy:
    """
    Validate a policy dictionary against the schema
    
    Args:
        data: Dictionary containing policy data
        
    Returns:
        Validated Policy object
        
    Raises:
        ValidationError: If the data doesn't match the schema
    """
    return Policy(**data)


def create_empty_policy(policy_id: str, policy_title: str) -> dict:
    """
    Create an empty policy structure following POLICY_SCHEMA
    
    Args:
        policy_id: Unique identifier for the policy
        policy_title: Title of the policy
        
    Returns:
        Dictionary with empty policy structure
    """
    return {
        "policy_id": policy_id,
        "policy_title": policy_title,
        "rules": []
    }


def create_empty_rule(rule_id: str) -> dict:
    """
    Create an empty rule structure following POLICY_SCHEMA
    
    Args:
        rule_id: Unique identifier for the rule
        
    Returns:
        Dictionary with empty rule structure
    """
    return {
        "rule_id": rule_id,
        "conditions": [],
        "action": "",
        "responsible_role": "",
        "beneficiary": "",
        "deadline": "",
        "ambiguity_flag": False,
        "ambiguity_reason": ""
    }
