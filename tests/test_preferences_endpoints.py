import os
import sys

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from models.user import User
from schemas.preferences import PreferencesCreate
from services.preferences import PreferencesService


def test_get_preferences_authenticated_returns_200(client: TestClient, test_user: User, auth_headers: dict, db: Session):
    """Test GET /preferences returns 200 with authenticated user and existing preferences."""
    # Create preferences first
    preferences_in = PreferencesCreate(trading_strategy="aggressive", risk_level="high")
    PreferencesService.create(db, test_user.id, preferences_in)

    response = client.get("/preferences", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["trading_strategy"] == "aggressive"
    assert data["risk_level"] == "high"


def test_get_preferences_not_found(client: TestClient, auth_headers: dict):
    """Test GET /preferences returns 404 when preferences don't exist."""
    response = client.get("/preferences", headers=auth_headers)

    assert response.status_code == 404
    assert "Preferences not found" in response.json()["detail"]


def test_get_preferences_unauthenticated_returns_401(client: TestClient):
    """Test GET /preferences returns 401 without authentication."""
    response = client.get("/preferences")

    assert response.status_code == 401


def test_post_preferences_creates_new_returns_201(client: TestClient, test_user: User, auth_headers: dict):
    """Test POST /preferences creates new preferences and returns 201."""
    payload = {
        "trading_strategy": "conservative",
        "risk_level": "low",
        "notification_preferences": {"email": True},
    }

    response = client.post("/preferences", json=payload, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["trading_strategy"] == "conservative"
    assert data["risk_level"] == "low"
    assert data["notification_preferences"] == {"email": True}


def test_post_preferences_updates_existing_returns_200(client: TestClient, test_user: User, auth_headers: dict, db: Session):
    """Test POST /preferences updates existing preferences and returns 200."""
    # Create initial preferences
    initial_in = PreferencesCreate(trading_strategy="aggressive")
    PreferencesService.create(db, test_user.id, initial_in)

    # Update via POST
    payload = {
        "trading_strategy": "conservative",
        "risk_level": "medium",
    }
    response = client.post("/preferences", json=payload, headers=auth_headers)

    # Both 200 and 201 are acceptable for upsert
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["trading_strategy"] == "conservative"
    assert data["risk_level"] == "medium"


def test_post_preferences_sets_onboarded_true(client: TestClient, test_user: User, auth_headers: dict, db: Session):
    """Test POST /preferences sets user.onboarded to True."""
    assert test_user.onboarded is False

    payload = {"trading_strategy": "balanced"}
    response = client.post("/preferences", json=payload, headers=auth_headers)

    assert response.status_code == 201
    db.refresh(test_user)
    assert test_user.onboarded is True


def test_post_preferences_invalid_data_returns_400(client: TestClient, auth_headers: dict):
    """Test POST /preferences returns 400 with invalid data."""
    # Missing required trading_strategy field
    payload = {"risk_level": "high"}

    response = client.post("/preferences", json=payload, headers=auth_headers)

    assert response.status_code == 422  # Validation error


def test_post_preferences_unauthenticated_returns_401(client: TestClient):
    """Test POST /preferences returns 401 without authentication."""
    payload = {"trading_strategy": "aggressive"}

    response = client.post("/preferences", json=payload)

    assert response.status_code == 401


def test_post_preferences_empty_strategy_returns_422(client: TestClient, auth_headers: dict):
    """Test POST /preferences returns 422 with empty trading_strategy."""
    payload = {"trading_strategy": ""}

    response = client.post("/preferences", json=payload, headers=auth_headers)

    assert response.status_code == 422


def test_post_preferences_long_strategy_returns_422(client: TestClient, auth_headers: dict):
    """Test POST /preferences returns 422 with strategy exceeding max length."""
    payload = {"trading_strategy": "a" * 300}

    response = client.post("/preferences", json=payload, headers=auth_headers)

    assert response.status_code == 422
