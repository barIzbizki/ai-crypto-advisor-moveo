import pytest
from sqlalchemy.exc import IntegrityError

from models.preferences import UserPreferences
from models.user import User
from schemas.preferences import PreferencesCreate, PreferencesUpdate
from services.preferences import PreferencesService


def _create_user(db_session, email="user@example.com") -> User:
    user = User(email=email, hashed_password="hashed")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def test_get_by_user_id_returns_none_when_missing(db_session):
    assert PreferencesService.get_by_user_id(db_session, 999) is None


def test_get_by_user_id_returns_existing(db_session):
    user = _create_user(db_session)
    created = PreferencesService.create(
        db_session, user.id, PreferencesCreate(trading_strategy="long_term")
    )

    found = PreferencesService.get_by_user_id(db_session, user.id)

    assert found is not None
    assert found.id == created.id


def test_create_persists_all_fields(db_session):
    user = _create_user(db_session)

    preferences = PreferencesService.create(
        db_session,
        user.id,
        PreferencesCreate(
            trading_strategy="day_trading",
            risk_level="high",
            notification_preferences={"email": True},
        ),
    )

    assert preferences.user_id == user.id
    assert preferences.trading_strategy == "day_trading"
    assert preferences.risk_level == "high"
    assert preferences.notification_preferences == {"email": True}


def test_create_second_row_for_same_user_raises_integrity_error(db_session):
    user = _create_user(db_session)
    PreferencesService.create(
        db_session, user.id, PreferencesCreate(trading_strategy="long_term")
    )

    with pytest.raises(IntegrityError):
        PreferencesService.create(
            db_session, user.id, PreferencesCreate(trading_strategy="day_trading")
        )


def test_update_changes_only_provided_fields(db_session):
    user = _create_user(db_session)
    preferences = PreferencesService.create(
        db_session,
        user.id,
        PreferencesCreate(trading_strategy="long_term", risk_level="low"),
    )

    updated = PreferencesService.update(
        db_session, preferences, PreferencesUpdate(risk_level="high")
    )

    assert updated.trading_strategy == "long_term"
    assert updated.risk_level == "high"


def test_upsert_creates_when_missing_and_marks_user_onboarded(db_session):
    user = _create_user(db_session)
    assert user.onboarded is False

    preferences = PreferencesService.upsert(
        db_session, user.id, PreferencesCreate(trading_strategy="long_term")
    )
    db_session.refresh(user)

    assert preferences.trading_strategy == "long_term"
    assert user.onboarded is True


def test_upsert_updates_existing_without_creating_duplicate_row(db_session):
    user = _create_user(db_session)
    PreferencesService.upsert(
        db_session, user.id, PreferencesCreate(trading_strategy="long_term")
    )

    updated = PreferencesService.upsert(
        db_session, user.id, PreferencesCreate(trading_strategy="day_trading")
    )

    assert updated.trading_strategy == "day_trading"
    row_count = (
        db_session.query(UserPreferences)
        .filter(UserPreferences.user_id == user.id)
        .count()
    )
    assert row_count == 1
