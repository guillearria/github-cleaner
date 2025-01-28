import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch

from app.services.github_service import GitHubService

def test_validate_token_valid(client: TestClient, github_service):
    headers = {"Authorization": f"Bearer {github_service.github._Github__requester._Requester__authorizationHeader}"}
    response = client.post("/api/validate-token", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert "username" in data

def test_validate_token_invalid(client: TestClient):
    headers = {"Authorization": "Bearer invalid_token"}
    response = client.post("/api/validate-token", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is False

def test_validate_token_missing(client: TestClient):
    response = client.post("/api/validate-token")
    assert response.status_code == 422

def test_list_repositories(client: TestClient, github_service):
    headers = {"Authorization": f"Bearer {github_service.github._Github__requester._Requester__authorizationHeader}"}
    response = client.get("/api/repositories", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "repositories" in data
    assert "total_count" in data
    assert "current_page" in data
    assert "total_pages" in data

def test_list_repositories_with_params(client: TestClient, github_service):
    headers = {"Authorization": f"Bearer {github_service.github._Github__requester._Requester__authorizationHeader}"}
    params = {
        "page": 1,
        "per_page": 5,
        "sort": "updated",
        "order": "desc"
    }
    response = client.get("/api/repositories", headers=headers, params=params)
    assert response.status_code == 200
    data = response.json()
    assert len(data["repositories"]) <= params["per_page"]

@pytest.mark.asyncio
async def test_archive_repositories_success():
    mock_repo = Mock()
    mock_repo.owner.login = "test_user"
    mock_repo.archived = False
    mock_repo.name = "test_repo"

    with patch("github.Github.get_repo", return_value=mock_repo), \
         patch("github.Github.get_user", return_value=Mock(login="test_user")):
        
        github_service = GitHubService("test_token")
        response = await github_service.archive_repositories([123])
        
        assert response.success is True
        assert response.archived_count == 1
        assert len(response.failed_repositories) == 0
        mock_repo.edit.assert_called_once_with(archived=True)

@pytest.mark.asyncio
async def test_archive_repositories_unauthorized():
    mock_repo = Mock()
    mock_repo.owner.login = "other_user"
    mock_repo.name = "test_repo"

    with patch("github.Github.get_repo", return_value=mock_repo), \
         patch("github.Github.get_user", return_value=Mock(login="test_user")):
        
        github_service = GitHubService("test_token")
        response = await github_service.archive_repositories([123])
        
        assert response.success is False
        assert response.archived_count == 0
        assert len(response.failed_repositories) == 1
        assert response.failed_repositories[0].error == "Not authorized to archive this repository" 