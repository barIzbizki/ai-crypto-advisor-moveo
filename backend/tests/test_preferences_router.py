def _register_and_login(client, email="user@example.com", password="s3cret-password"):
    client.post("/auth/register", json={"email": email, "password": password})
    login_response = client.post(
        "/auth/login", json={"email": email, "password": password}
    )
    return login_response.json()["access_token"]


def _auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_get_preferences_unauthenticated_rejected(client):
    response = client.get("/preferences")
    assert response.status_code == 401


def test_get_preferences_not_found_returns_404(client):
    token = _register_and_login(client)

    response = client.get("/preferences", headers=_auth_headers(token))

    assert response.status_code == 404


def test_post_preferences_creates_and_returns_201(client):
    token = _register_and_login(client)

    response = client.post(
        "/preferences",
        headers=_auth_headers(token),
        json={"trading_strategy": "long_term", "risk_level": "medium"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["trading_strategy"] == "long_term"
    assert body["risk_level"] == "medium"


def test_post_preferences_update_returns_200(client):
    token = _register_and_login(client)
    client.post(
        "/preferences",
        headers=_auth_headers(token),
        json={"trading_strategy": "long_term"},
    )

    response = client.post(
        "/preferences",
        headers=_auth_headers(token),
        json={"trading_strategy": "day_trading"},
    )

    assert response.status_code == 200
    assert response.json()["trading_strategy"] == "day_trading"


def test_get_preferences_after_creation_returns_200(client):
    token = _register_and_login(client)
    client.post(
        "/preferences",
        headers=_auth_headers(token),
        json={"trading_strategy": "long_term"},
    )

    response = client.get("/preferences", headers=_auth_headers(token))

    assert response.status_code == 200
    assert response.json()["trading_strategy"] == "long_term"


def test_post_preferences_sets_user_onboarded_true(client):
    token = _register_and_login(client)
    assert (
        client.get("/auth/me", headers=_auth_headers(token)).json()["onboarded"]
        is False
    )

    client.post(
        "/preferences",
        headers=_auth_headers(token),
        json={"trading_strategy": "long_term"},
    )

    assert (
        client.get("/auth/me", headers=_auth_headers(token)).json()["onboarded"] is True
    )


def test_post_preferences_missing_trading_strategy_rejected(client):
    token = _register_and_login(client)

    response = client.post("/preferences", headers=_auth_headers(token), json={})

    assert response.status_code == 422


def test_post_preferences_invalid_risk_level_rejected(client):
    token = _register_and_login(client)

    response = client.post(
        "/preferences",
        headers=_auth_headers(token),
        json={"trading_strategy": "long_term", "risk_level": "not-a-real-level"},
    )

    assert response.status_code == 422


def test_post_preferences_unauthenticated_rejected(client):
    response = client.post("/preferences", json={"trading_strategy": "long_term"})
    assert response.status_code == 401
