import os
import sys
from typing import Generator

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from core.database import Base, get_db
from main import app
from models.user import User
from models.preferences import UserPreferences
from services.auth import register_user
from schemas.auth import UserCreate


SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db() -> Generator[Session, None, None]:
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    Base.metadata.create_all(bind=engine)
    yield from override_get_db()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db: Session):
    app.dependency_overrides[get_db] = lambda: db
    from fastapi.testclient import TestClient

    return TestClient(app)


@pytest.fixture(scope="function")
def test_user(db: Session) -> User:
    user_in = UserCreate(email="test@example.com", password="testpass123")
    user = register_user(db, user_in)
    return user


@pytest.fixture(scope="function")
def auth_headers(client, test_user: User) -> dict[str, str]:
    response = client.post(
        "/auth/login",
        json={"email": test_user.email, "password": "testpass123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
