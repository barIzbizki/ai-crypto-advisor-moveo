def _register(client, email="user@example.com", password="s3cret-password"):
    return client.post("/auth/register", json={"email": email, "password": password})


def test_register_success(client):
    response = _register(client)
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "user@example.com"
    assert "password" not in body
    assert "hashed_password" not in body


def test_register_duplicate_email_rejected(client):
    _register(client)
    response = _register(client)
    assert response.status_code == 400


def test_login_success_returns_token(client):
    _register(client)
    response = client.post(
        "/auth/login",
        json={"email": "user@example.com", "password": "s3cret-password"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_login_wrong_password_rejected(client):
    _register(client)
    response = client.post(
        "/auth/login",
        json={"email": "user@example.com", "password": "wrong-password"},
    )
    assert response.status_code == 401


def test_login_unknown_email_rejected(client):
    response = client.post(
        "/auth/login",
        json={"email": "nobody@example.com", "password": "s3cret-password"},
    )
    assert response.status_code == 401


def test_me_with_valid_token_returns_current_user(client):
    _register(client)
    login_response = client.post(
        "/auth/login",
        json={"email": "user@example.com", "password": "s3cret-password"},
    )
    token = login_response.json()["access_token"]

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "user@example.com"


def test_me_without_token_rejected(client):
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_me_with_invalid_token_rejected(client):
    response = client.get(
        "/auth/me", headers={"Authorization": "Bearer not-a-valid-token"}
    )
    assert response.status_code == 401
