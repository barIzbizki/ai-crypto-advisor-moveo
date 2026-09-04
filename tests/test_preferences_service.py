import os
import sys

import pytest
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from models.user import User
from schemas.preferences import PreferencesCreate, PreferencesUpdate
from services.preferences import PreferencesService


def test_get_by_user_id_existing(db: Session, test_user: User):
    """Test retrieving existing preferences."""
    preferences_in = PreferencesCreate(
        trading_strategy="aggressive",
        risk_level="high",
        notification_preferences={"email": True, "push": False},
    )
    created = PreferencesService.create(db, test_user.id, preferences_in)

    found = PreferencesService.get_by_user_id(db, test_user.id)
    assert found is not None
    assert found.id == created.id
    assert found.trading_strategy == "aggressive"


def test_get_by_user_id_non_existing(db: Session, test_user: User):
    """Test retrieving non-existing preferences returns None."""
    found = PreferencesService.get_by_user_id(db, test_user.id)
    assert found is None


def test_create_preferences(db: Session, test_user: User):
    """Test creating new preferences."""
    preferences_in = PreferencesCreate(
        trading_strategy="conservative",
        risk_level="low",
    )
    created = PreferencesService.create(db, test_user.id, preferences_in)

    assert created.id is not None
    assert created.user_id == test_user.id
    assert created.trading_strategy == "conservative"
    assert created.risk_level == "low"
    assert created.notification_preferences is None


def test_create_preferences_with_notifications(db: Session, test_user: User):
    """Test creating preferences with notification settings."""
    notifications = {"email": True, "sms": False}
    preferences_in = PreferencesCreate(
        trading_strategy="moderate",
        notification_preferences=notifications,
    )
    created = PreferencesService.create(db, test_user.id, preferences_in)

    assert created.notification_preferences == notifications


def test_update_preferences(db: Session, test_user: User):
    """Test updating existing preferences."""
    # Create initial preferences
    preferences_in = PreferencesCreate(trading_strategy="aggressive")
    preferences = PreferencesService.create(db, test_user.id, preferences_in)

    # Update preferences
    update_in = PreferencesUpdate(trading_strategy="conservative", risk_level="low")
    updated = PreferencesService.update(db, preferences, update_in)

    assert updated.id == preferences.id
    assert updated.trading_strategy == "conservative"
    assert updated.risk_level == "low"


def test_upsert_creates_new(db: Session, test_user: User):
    """Test upsert creates new preferences when none exist."""
    preferences_in = PreferencesCreate(trading_strategy="balanced")

    preferences = PreferencesService.upsert(db, test_user.id, preferences_in)

    assert preferences.id is not None
    assert preferences.trading_strategy == "balanced"

    # Verify user is marked as onboarded
    db.refresh(test_user)
    assert test_user.onboarded is True


def test_upsert_updates_existing(db: Session, test_user: User):
    """Test upsert updates existing preferences."""
    # Create initial preferences
    initial_in = PreferencesCreate(trading_strategy="aggressive")
    initial = PreferencesService.create(db, test_user.id, initial_in)

    # Upsert with new data
    update_in = PreferencesCreate(trading_strategy="conservative", risk_level="low")
    updated = PreferencesService.upsert(db, test_user.id, update_in)

    assert updated.id == initial.id
    assert updated.trading_strategy == "conservative"
    assert updated.risk_level == "low"


def test_upsert_sets_onboarded(db: Session, test_user: User):
    """Test upsert sets user.onboarded to True."""
    assert test_user.onboarded is False

    preferences_in = PreferencesCreate(trading_strategy="moderate")
    PreferencesService.upsert(db, test_user.id, preferences_in)

    db.refresh(test_user)
    assert test_user.onboarded is True


def test_unique_constraint_user_id(db: Session, test_user: User):
    """Test that unique constraint on user_id prevents duplicate preferences."""
    preferences_in = PreferencesCreate(trading_strategy="aggressive")
    PreferencesService.create(db, test_user.id, preferences_in)

    # Attempting to create another should fail
    with pytest.raises(Exception):  # SQLAlchemy will raise an integrity error
        PreferencesService.create(db, test_user.id, preferences_in)
        db.commit()
