from pydantic import BaseModel
from typing import List, Optional

class TokenValidationResponse(BaseModel):
    valid: bool
    username: Optional[str] = None

class RepositoryResponse(BaseModel):
    id: int
    name: str
    full_name: str
    description: Optional[str] = None
    archived: bool
    updated_at: str
    stars: int
    language: Optional[str] = None

class RepositoryList(BaseModel):
    repositories: List[RepositoryResponse]
    total_count: int
    current_page: int
    total_pages: int

class ArchiveRequest(BaseModel):
    repository_ids: List[int]

class FailedRepository(BaseModel):
    id: int
    name: str
    error: str

class ArchiveResponse(BaseModel):
    success: bool
    archived_count: int
    failed_repositories: List[FailedRepository] = [] 