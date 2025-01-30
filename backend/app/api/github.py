from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel

from app.services.github_service import GitHubService
from app.models.github import (
    TokenValidationResponse,
    RepositoryResponse,
    RepositoryList,
    ArchiveRequest,
    ArchiveResponse,
)

router = APIRouter()

async def get_github_service(token: str = Depends(GitHubService.get_token_from_header)):
    return GitHubService(token)

@router.post("/validate-token", response_model=TokenValidationResponse)
async def validate_token(
    github_service: GitHubService = Depends(get_github_service)
):
    """Validate GitHub token and return user information."""
    return await github_service.validate_token()

@router.get("/repositories", response_model=RepositoryList)
async def list_repositories(
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=100),
    search: Optional[str] = None,
    sort: Optional[str] = Query(None, pattern="^(updated|name|stars)$"),
    order: Optional[str] = Query(None, pattern="^(asc|desc)$"),
    github_service: GitHubService = Depends(get_github_service)
):
    """Get list of repositories with pagination and filtering options."""
    return await github_service.list_repositories(
        page=page,
        per_page=per_page,
        search=search,
        sort=sort,
        order=order
    )

@router.post("/archive", response_model=ArchiveResponse)
async def archive_repositories(
    archive_request: ArchiveRequest,
    github_service: GitHubService = Depends(get_github_service)
):
    """Archive multiple repositories."""
    return await github_service.archive_repositories(archive_request.repository_ids) 