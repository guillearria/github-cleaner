from fastapi.testclient import TestClient

def test_health_check(client: TestClient, test_settings):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert isinstance(data["debug"], bool)
    assert data["debug"] == test_settings.DEBUG 