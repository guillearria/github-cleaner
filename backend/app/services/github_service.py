from typing import List, Optional
from fastapi import HTTPException, Header
from github import Github, GithubException
import math

from app.models.github import (
    TokenValidationResponse,
    RepositoryResponse,
    RepositoryList,
    FailedRepository,
    ArchiveResponse,
)

class GitHubService:
    def __init__(self, token: str):
        self.github = Github(token)

    @staticmethod
    def get_token_from_header(authorization: str = Header(...)):
        """Extract token from Authorization header."""
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization header format"
            )
        return authorization.replace("Bearer ", "")

    async def validate_token(self) -> TokenValidationResponse:
        """Validate GitHub token and return user information."""
        try:
            user = self.github.get_user()
            return TokenValidationResponse(
                valid=True,
                username=user.login
            )
        except GithubException:
            return TokenValidationResponse(valid=False)

    async def list_repositories(
        self,
        page: int = 1,
        per_page: int = 30,
        search: Optional[str] = None,
        sort: Optional[str] = None,
        order: Optional[str] = None
    ) -> RepositoryList:
        """Get list of repositories with pagination and filtering."""
        try:
            user = self.github.get_user()
            repos = user.get_repos()
            
            # Apply filters
            filtered_repos = []
            for repo in repos:
                if search and search.lower() not in repo.name.lower():
                    continue
                filtered_repos.append(repo)

            # Apply sorting
            if sort:
                reverse = order == "desc"
                if sort == "updated":
                    filtered_repos.sort(key=lambda x: x.updated_at, reverse=reverse)
                elif sort == "name":
                    filtered_repos.sort(key=lambda x: x.name.lower(), reverse=reverse)
                elif sort == "stars":
                    filtered_repos.sort(key=lambda x: x.stargazers_count, reverse=reverse)

            # Calculate pagination
            total_count = len(filtered_repos)
            total_pages = math.ceil(total_count / per_page)
            start_idx = (page - 1) * per_page
            end_idx = start_idx + per_page
            page_repos = filtered_repos[start_idx:end_idx]

            # Convert to response model
            repositories = [
                RepositoryResponse(
                    id=repo.id,
                    name=repo.name,
                    full_name=repo.full_name,
                    description=repo.description,
                    archived=repo.archived,
                    updated_at=repo.updated_at.isoformat(),
                    stars=repo.stargazers_count,
                    language=repo.language
                )
                for repo in page_repos
            ]

            return RepositoryList(
                repositories=repositories,
                total_count=total_count,
                current_page=page,
                total_pages=total_pages
            )

        except GithubException as e:
            raise HTTPException(
                status_code=e.status,
                detail=str(e.data.get("message", "GitHub API error"))
            )

    async def archive_repositories(self, repository_ids: List[int]) -> ArchiveResponse:
        """Archive multiple repositories."""
        archived_count = 0
        failed_repositories = []

        try:
            user = self.github.get_user()
            for repo_id in repository_ids:
                try:
                    repo = self.github.get_repo(repo_id)
                    if repo.owner.login != user.login:
                        failed_repositories.append(
                            FailedRepository(
                                id=repo_id,
                                name=repo.name,
                                error="Not authorized to archive this repository"
                            )
                        )
                        continue

                    if not repo.archived:
                        repo.edit(archived=True)
                        archived_count += 1

                except GithubException as e:
                    failed_repositories.append(
                        FailedRepository(
                            id=repo_id,
                            name=str(repo_id),
                            error=str(e.data.get("message", "Failed to archive repository"))
                        )
                    )

            return ArchiveResponse(
                success=len(failed_repositories) == 0,
                archived_count=archived_count,
                failed_repositories=failed_repositories
            )

        except GithubException as e:
            raise HTTPException(
                status_code=e.status,
                detail=str(e.data.get("message", "GitHub API error"))
            ) 