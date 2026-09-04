import pytest
from sqlalchemy.exc import IntegrityError

from models.preferences import InvestorType, UserPreferences
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
        db_session,
        user.id,
        PreferencesCreate(
            investor_type=InvestorType.HODLER,
            crypto_assets=["BTC", "ETH"],
            content_types=["Market News"],
        ),
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
            investor_type=InvestorType.DAY_TRADER,
            crypto_assets=["SOL", "ETH"],
            content_types=["Charts", "Social"],
        ),
    )

    assert preferences.user_id == user.id
    assert preferences.investor_type == "day_trader"
    assert preferences.crypto_assets == ["SOL", "ETH"]
    assert preferences.content_types == ["Charts", "Social"]


def test_create_second_row_for_same_user_raises_integrity_error(db_session):
    user = _create_user(db_session)
    PreferencesService.create(
        db_session,
        user.id,
        PreferencesCreate(
            investor_type=InvestorType.HODLER,
            crypto_assets=["BTC"],
            content_types=["Market News"],
        ),
    )

    with pytest.raises(IntegrityError):
        PreferencesService.create(
            db_session,
            user.id,
            PreferencesCreate(
                investor_type=InvestorType.NFT_COLLECTOR,
                crypto_assets=["BTC"],
                content_types=["Market News"],
            ),
        )


def test_update_changes_only_provided_fields(db_session):
    user = _create_user(db_session)
    preferences = PreferencesService.create(
        db_session,
        user.id,
        PreferencesCreate(
            investor_type=InvestorType.HODLER,
            crypto_assets=["BTC"],
            content_types=["Market News"],
        ),
    )

    updated = PreferencesService.update(
        db_session,
        preferences,
        PreferencesUpdate(
            investor_type=InvestorType.DAY_TRADER,
            crypto_assets=["SOL"],
            content_types=["Charts"],
        ),
    )

    assert updated.investor_type == "day_trader"
    assert updated.crypto_assets == ["SOL"]
    assert updated.content_types == ["Charts"]


def test_upsert_creates_when_missing_and_marks_user_onboarded(db_session):
    user = _create_user(db_session)
    assert user.onboarded is False

    preferences = PreferencesService.upsert(
        db_session,
        user.id,
        PreferencesCreate(
            investor_type=InvestorType.HODLER,
            crypto_assets=["BTC"],
            content_types=["Market News"],
        ),
    )
    db_session.refresh(user)

    assert preferences.investor_type == "hodler"
    assert user.onboarded is True


def test_upsert_updates_existing_without_creating_duplicate_row(db_session):
    user = _create_user(db_session)
    PreferencesService.upsert(
        db_session,
        user.id,
        PreferencesCreate(
            investor_type=InvestorType.HODLER,
            crypto_assets=["BTC"],
            content_types=["Market News"],
        ),
    )

    updated = PreferencesService.upsert(
        db_session,
        user.id,
        PreferencesCreate(
            investor_type=InvestorType.DAY_TRADER,
            crypto_assets=["ETH"],
            content_types=["Charts"],
        ),
    )

    assert updated.investor_type == "day_trader"
    row_count = (
        db_session.query(UserPreferences)
        .filter(UserPreferences.user_id == user.id)
        .count()
    )
    assert row_count == 1


def test_empty_crypto_assets_rejected_by_schema(db_session):
    from pydantic import ValidationError

    user = _create_user(db_session)

    with pytest.raises(ValidationError):
        PreferencesCreate(
            investor_type=InvestorType.HODLER,
            crypto_assets=[],
            content_types=["Market News"],
        )


def test_empty_content_types_rejected_by_schema(db_session):
    from pydantic import ValidationError

    user = _create_user(db_session)

    with pytest.raises(ValidationError):
        PreferencesCreate(
            investor_type=InvestorType.HODLER,
            crypto_assets=["BTC"],
            content_types=[],
        )
