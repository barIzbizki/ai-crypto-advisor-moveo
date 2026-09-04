def _register_and_login(client, email="user@example.com", password="s3cret-password"):
    client.post("/auth/register", json={"email": email, "password": password})
    login_response = client.post(
        "/auth/login", json={"email": email, "password": password}
    )
    return login_response.json()["access_token"]


def _auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_post_feedback_unauthenticated_rejected(client):
    response = client.post(
        "/feedback", json={"content_id": "coin_1", "is_upvote": True}
    )
    assert response.status_code == 401


def test_post_feedback_creates_and_returns_201(client):
    token = _register_and_login(client)

    response = client.post(
        "/feedback",
        headers=_auth_headers(token),
        json={"content_id": "coin_1", "is_upvote": True},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["feedback"]["content_id"] == "coin_1"
    assert body["feedback"]["is_upvote"] is True
    assert body["existing_votes"] == []
    assert body["dashboard_content"] is None


def test_post_feedback_response_includes_submitted_feedback(client):
    token = _register_and_login(client)

    response = client.post(
        "/feedback",
        headers=_auth_headers(token),
        json={"content_id": "coin_1", "is_upvote": True},
    )

    body = response.json()
    feedback = body["feedback"]
    assert "id" in feedback
    assert feedback["user_id"] is not None
    assert feedback["created_at"] is not None
    assert feedback["updated_at"] is not None


def test_post_feedback_second_vote_returns_200_update(client):
    token = _register_and_login(client)
    client.post(
        "/feedback",
        headers=_auth_headers(token),
        json={"content_id": "coin_1", "is_upvote": True},
    )

    response = client.post(
        "/feedback",
        headers=_auth_headers(token),
        json={"content_id": "coin_1", "is_upvote": False},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["feedback"]["is_upvote"] is False


def test_post_feedback_includes_existing_votes(client):
    token1 = _register_and_login(client, "user1@example.com")
    token2 = _register_and_login(client, "user2@example.com")

    client.post(
        "/feedback",
        headers=_auth_headers(token1),
        json={"content_id": "coin_1", "is_upvote": True},
    )

    response = client.post(
        "/feedback",
        headers=_auth_headers(token2),
        json={"content_id": "coin_1", "is_upvote": False},
    )

    body = response.json()
    assert len(body["existing_votes"]) == 1
    assert body["existing_votes"][0]["is_upvote"] is True
    assert all(v["content_id"] == "coin_1" for v in body["existing_votes"])


def test_post_feedback_multiple_users_can_vote_on_same_content(client):
    token1 = _register_and_login(client, "user1@example.com")
    token2 = _register_and_login(client, "user2@example.com")

    response1 = client.post(
        "/feedback",
        headers=_auth_headers(token1),
        json={"content_id": "coin_1", "is_upvote": True},
    )
    response2 = client.post(
        "/feedback",
        headers=_auth_headers(token2),
        json={"content_id": "coin_1", "is_upvote": False},
    )

    assert response1.status_code == 201
    assert response2.status_code == 201


def test_post_feedback_missing_content_id_rejected(client):
    token = _register_and_login(client)

    response = client.post(
        "/feedback",
        headers=_auth_headers(token),
        json={"is_upvote": True},
    )

    assert response.status_code == 422


def test_post_feedback_missing_is_upvote_rejected(client):
    token = _register_and_login(client)

    response = client.post(
        "/feedback",
        headers=_auth_headers(token),
        json={"content_id": "coin_1"},
    )

    assert response.status_code == 422


def test_post_feedback_invalid_is_upvote_rejected(client):
    token = _register_and_login(client)

    response = client.post(
        "/feedback",
        headers=_auth_headers(token),
        json={"content_id": "coin_1", "is_upvote": "not-a-boolean"},
    )

    assert response.status_code == 422


def test_post_feedback_same_user_different_content(client):
    token = _register_and_login(client)

    response1 = client.post(
        "/feedback",
        headers=_auth_headers(token),
        json={"content_id": "coin_1", "is_upvote": True},
    )
    response2 = client.post(
        "/feedback",
        headers=_auth_headers(token),
        json={"content_id": "coin_2", "is_upvote": False},
    )

    assert response1.status_code == 201
    assert response2.status_code == 201
    body1 = response1.json()
    body2 = response2.json()
    assert body1["feedback"]["id"] != body2["feedback"]["id"]


def test_get_feedback_unauthenticated_rejected(client):
    response = client.get("/feedback?content_ids=coin_1")
    assert response.status_code == 401


def test_get_feedback_mixed_voted_unvoted_ids(client):
    token = _register_and_login(client)

    client.post(
        "/feedback",
        headers=_auth_headers(token),
        json={"content_id": "coin_1", "is_upvote": True},
    )
    client.post(
        "/feedback",
        headers=_auth_headers(token),
        json={"content_id": "coin_3", "is_upvote": False},
    )

    response = client.get(
        "/feedback?content_ids=coin_1&content_ids=coin_2&content_ids=coin_3",
        headers=_auth_headers(token),
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    content_ids = {vote["content_id"] for vote in body}
    assert content_ids == {"coin_1", "coin_3"}


def test_get_feedback_empty_list(client):
    token = _register_and_login(client)

    response = client.get("/feedback", headers=_auth_headers(token))

    assert response.status_code == 200
    body = response.json()
    assert body == []


def test_get_feedback_comma_separated_ids(client):
    token = _register_and_login(client)

    client.post(
        "/feedback",
        headers=_auth_headers(token),
        json={"content_id": "coin_1", "is_upvote": True},
    )

    response = client.get(
        "/feedback?content_ids=coin_1,coin_2",
        headers=_auth_headers(token),
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["content_id"] == "coin_1"


def test_get_feedback_scoped_to_requesting_user(client):
    token1 = _register_and_login(client, "user1@example.com")
    token2 = _register_and_login(client, "user2@example.com")

    client.post(
        "/feedback",
        headers=_auth_headers(token1),
        json={"content_id": "coin_1", "is_upvote": True},
    )
    client.post(
        "/feedback",
        headers=_auth_headers(token2),
        json={"content_id": "coin_1", "is_upvote": False},
    )

    response = client.get(
        "/feedback?content_ids=coin_1",
        headers=_auth_headers(token1),
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["is_upvote"] is True
