import pytest
from sqlalchemy.exc import IntegrityError

from models.feedback import Feedback
from models.user import User
from schemas.feedback import FeedbackCreate, FeedbackUpdate
from services.feedback import FeedbackService


def _create_user(db_session, email="user@example.com") -> User:
    user = User(email=email, hashed_password="hashed")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def test_get_by_user_and_content_returns_none_when_missing(db_session):
    assert FeedbackService.get_by_user_and_content(db_session, 999, "coin_1") is None


def test_create_persists_feedback(db_session):
    user = _create_user(db_session)

    feedback = FeedbackService.create(
        db_session,
        user.id,
        FeedbackCreate(content_id="coin_1", is_upvote=True),
    )

    assert feedback.user_id == user.id
    assert feedback.content_id == "coin_1"
    assert feedback.is_upvote is True


def test_create_second_feedback_for_different_content_succeeds(db_session):
    user = _create_user(db_session)
    FeedbackService.create(
        db_session, user.id, FeedbackCreate(content_id="coin_1", is_upvote=True)
    )

    feedback2 = FeedbackService.create(
        db_session, user.id, FeedbackCreate(content_id="coin_2", is_upvote=False)
    )

    assert feedback2.content_id == "coin_2"


def test_create_duplicate_user_content_raises_integrity_error(db_session):
    user = _create_user(db_session)
    FeedbackService.create(
        db_session, user.id, FeedbackCreate(content_id="coin_1", is_upvote=True)
    )

    with pytest.raises(IntegrityError):
        FeedbackService.create(
            db_session, user.id, FeedbackCreate(content_id="coin_1", is_upvote=False)
        )


def test_update_changes_vote(db_session):
    user = _create_user(db_session)
    feedback = FeedbackService.create(
        db_session, user.id, FeedbackCreate(content_id="coin_1", is_upvote=True)
    )
    original_created_at = feedback.created_at

    updated = FeedbackService.update(
        db_session, feedback, FeedbackUpdate(is_upvote=False)
    )

    assert updated.is_upvote is False
    assert updated.created_at == original_created_at
    assert updated.updated_at >= feedback.updated_at


def test_upsert_creates_when_missing_and_returns_is_new_true(db_session):
    user = _create_user(db_session)

    feedback, is_new = FeedbackService.upsert(
        db_session, user.id, FeedbackCreate(content_id="coin_1", is_upvote=True)
    )

    assert feedback.is_upvote is True
    assert is_new is True


def test_upsert_updates_existing_and_returns_is_new_false(db_session):
    user = _create_user(db_session)
    FeedbackService.create(
        db_session, user.id, FeedbackCreate(content_id="coin_1", is_upvote=True)
    )

    feedback, is_new = FeedbackService.upsert(
        db_session, user.id, FeedbackCreate(content_id="coin_1", is_upvote=False)
    )

    assert feedback.is_upvote is False
    assert is_new is False
    row_count = (
        db_session.query(Feedback)
        .filter(Feedback.user_id == user.id, Feedback.content_id == "coin_1")
        .count()
    )
    assert row_count == 1


def test_get_votes_for_content_returns_all_votes(db_session):
    user1 = _create_user(db_session, "user1@example.com")
    user2 = _create_user(db_session, "user2@example.com")

    FeedbackService.create(
        db_session, user1.id, FeedbackCreate(content_id="coin_1", is_upvote=True)
    )
    FeedbackService.create(
        db_session, user2.id, FeedbackCreate(content_id="coin_1", is_upvote=False)
    )
    FeedbackService.create(
        db_session, user1.id, FeedbackCreate(content_id="coin_2", is_upvote=False)
    )

    votes = FeedbackService.get_votes_for_content(db_session, "coin_1")

    assert len(votes) == 2
    assert all(v.content_id == "coin_1" for v in votes)


def test_get_votes_for_content_returns_empty_list_when_no_votes(db_session):
    votes = FeedbackService.get_votes_for_content(db_session, "coin_999")
    assert votes == []


def test_user_deletion_cascades_to_feedback(db_session):
    user = _create_user(db_session)
    FeedbackService.create(
        db_session, user.id, FeedbackCreate(content_id="coin_1", is_upvote=True)
    )

    db_session.delete(user)
    db_session.commit()

    feedback = FeedbackService.get_by_user_and_content(db_session, user.id, "coin_1")
    assert feedback is None
