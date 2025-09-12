#SCHEMAS
from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class SkillsResponse(BaseModel):
    skills: List[Dict[str, Any]]
    role: Optional[str] = None


class SkillsRequest(BaseModel):
    role: Optional[str] = None
    top_k: Optional[int] = 10