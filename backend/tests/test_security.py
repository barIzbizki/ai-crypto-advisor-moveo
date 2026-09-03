import pytest

from services.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_hash_password_differs_from_plaintext():
    hashed = hash_password("s3cret-password")
    assert hashed != "s3cret-password"


def test_verify_password_accepts_correct_password():
    hashed = hash_password("s3cret-password")
    assert verify_password("s3cret-password", hashed) is True


def test_verify_password_rejects_incorrect_password():
    hashed = hash_password("s3cret-password")
    assert verify_password("wrong-password", hashed) is False


def test_access_token_round_trip():
    token = create_access_token({"sub": "user@example.com"})
    payload = decode_access_token(token)
    assert payload["sub"] == "user@example.com"


def test_decode_access_token_rejects_invalid_token():
    with pytest.raises(ValueError):
        decode_access_token("not-a-valid-token")
