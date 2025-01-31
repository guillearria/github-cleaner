import pytest
from fastapi.testclient import TestClient
from typing import Generator

from app.main import app
from app.core.config import get_settings, Settings
from app.services.github_service import GitHubService

@pytest.fixture
def test_settings() -> Settings:
    return get_settings()

@pytest.fixture
def client() -> Generator:
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def github_service() -> GitHubService:
    settings = get_settings()
    if not settings.GH_TEST_TOKEN:
        pytest.skip("GH_TEST_TOKEN not set in environment")
    return GitHubService(settings.GH_TEST_TOKEN) 