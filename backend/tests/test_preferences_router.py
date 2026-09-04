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
        json={
            "investor_type": "hodler",
            "crypto_assets": ["BTC", "ETH"],
            "content_types": ["Market News"],
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["investor_type"] == "hodler"
    assert body["crypto_assets"] == ["BTC", "ETH"]
    assert body["content_types"] == ["Market News"]


def test_post_preferences_update_returns_200(client):
    token = _register_and_login(client)
    client.post(
        "/preferences",
        headers=_auth_headers(token),
        json={
            "investor_type": "hodler",
            "crypto_assets": ["BTC"],
            "content_types": ["Market News"],
        },
    )

    response = client.post(
        "/preferences",
        headers=_auth_headers(token),
        json={
            "investor_type": "day_trader",
            "crypto_assets": ["ETH"],
            "content_types": ["Charts"],
        },
    )

    assert response.status_code == 200
    assert response.json()["investor_type"] == "day_trader"


def test_get_preferences_after_creation_returns_200(client):
    token = _register_and_login(client)
    client.post(
        "/preferences",
        headers=_auth_headers(token),
        json={
            "investor_type": "hodler",
            "crypto_assets": ["BTC"],
            "content_types": ["Market News"],
        },
    )

    response = client.get("/preferences", headers=_auth_headers(token))

    assert response.status_code == 200
    assert response.json()["investor_type"] == "hodler"


def test_post_preferences_sets_user_onboarded_true(client):
    token = _register_and_login(client)
    assert (
        client.get("/auth/me", headers=_auth_headers(token)).json()["onboarded"]
        is False
    )

    client.post(
        "/preferences",
        headers=_auth_headers(token),
        json={
            "investor_type": "hodler",
            "crypto_assets": ["BTC"],
            "content_types": ["Market News"],
        },
    )

    assert (
        client.get("/auth/me", headers=_auth_headers(token)).json()["onboarded"] is True
    )


def test_post_preferences_missing_investor_type_rejected(client):
    token = _register_and_login(client)

    response = client.post(
        "/preferences",
        headers=_auth_headers(token),
        json={"crypto_assets": ["BTC"], "content_types": ["Market News"]},
    )

    assert response.status_code == 422


def test_post_preferences_empty_crypto_assets_rejected(client):
    token = _register_and_login(client)

    response = client.post(
        "/preferences",
        headers=_auth_headers(token),
        json={
            "investor_type": "hodler",
            "crypto_assets": [],
            "content_types": ["Market News"],
        },
    )

    assert response.status_code == 422


def test_post_preferences_empty_content_types_rejected(client):
    token = _register_and_login(client)

    response = client.post(
        "/preferences",
        headers=_auth_headers(token),
        json={
            "investor_type": "hodler",
            "crypto_assets": ["BTC"],
            "content_types": [],
        },
    )

    assert response.status_code == 422


def test_post_preferences_invalid_investor_type_rejected(client):
    token = _register_and_login(client)

    response = client.post(
        "/preferences",
        headers=_auth_headers(token),
        json={
            "investor_type": "invalid_type",
            "crypto_assets": ["BTC"],
            "content_types": ["Market News"],
        },
    )

    assert response.status_code == 422


def test_post_preferences_unauthenticated_rejected(client):
    response = client.post(
        "/preferences",
        json={
            "investor_type": "hodler",
            "crypto_assets": ["BTC"],
            "content_types": ["Market News"],
        },
    )
    assert response.status_code == 401
