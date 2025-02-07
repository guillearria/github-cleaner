from typing import List, Optional
from fastapi import HTTPException, Header
from github import Github, GithubException, Auth
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
        auth = Auth.Token(token)
        self.github = Github(auth=auth)

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
        per_page: int = 100,
        search: Optional[str] = None,
        sort: Optional[str] = None,
        order: Optional[str] = None
    ) -> RepositoryList:
        """Get list of repositories with pagination and filtering."""
        try:
            user = self.github.get_user()
            
            # Get paginated repositories using GitHub's pagination
            if search:
                # If searching, we need to use the search API
                # Add 'user:username' to only get repos owned by the user
                query = f"user:{user.login} {search} in:name"
                repos = self.github.search_repositories(query)
                total_count = repos.totalCount
            else:
                # Get repositories with sorting if specified
                kwargs = {
                    "affiliation": "owner"  # Only get repositories owned by the user
                }
                
                if sort:
                    direction = "desc" if order == "desc" else "asc"
                    kwargs["direction"] = direction
                    
                    if sort == "updated":
                        kwargs["sort"] = "updated"
                    elif sort == "name":
                        kwargs["sort"] = "full_name"
                    elif sort == "stars":
                        kwargs["sort"] = "stargazers"
                
                # Single API call for both repos and count
                repos = user.get_repos(**kwargs)
                total_count = repos.totalCount

            # Get the specific page
            page_repos = repos.get_page(page - 1)  # GitHub uses 0-based indexing
            total_pages = math.ceil(total_count / per_page)

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