from sqlalchemy.orm import Session

from models.feedback import Feedback
from schemas.feedback import FeedbackCreate, FeedbackUpdate


class FeedbackService:
    @staticmethod
    def get_by_user_and_content(
        db: Session, user_id: int, content_id: str
    ) -> Feedback | None:
        """Retrieve feedback vote for a specific user and content.

        Returns None if user has not voted on this content yet.
        """
        return (
            db.query(Feedback)
            .filter(Feedback.user_id == user_id, Feedback.content_id == content_id)
            .first()
        )

    @staticmethod
    def create(db: Session, user_id: int, feedback_in: FeedbackCreate) -> Feedback:
        """Create new feedback vote. Raises IntegrityError if duplicate exists."""
        feedback = Feedback(
            user_id=user_id,
            content_id=feedback_in.content_id,
            is_upvote=feedback_in.is_upvote,
        )
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return feedback

    @staticmethod
    def update(
        db: Session, feedback: Feedback, feedback_in: FeedbackUpdate
    ) -> Feedback:
        """Update existing feedback vote with new value."""
        update_data = feedback_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(feedback, field, value)
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return feedback

    @staticmethod
    def upsert(
        db: Session, user_id: int, feedback_in: FeedbackCreate
    ) -> tuple[Feedback, bool]:
        """Create or update feedback vote. Returns (feedback, is_new)."""
        existing_feedback = FeedbackService.get_by_user_and_content(
            db, user_id, feedback_in.content_id
        )

        if existing_feedback:
            update_in = FeedbackUpdate(is_upvote=feedback_in.is_upvote)
            updated_feedback = FeedbackService.update(db, existing_feedback, update_in)
            return updated_feedback, False
        else:
            new_feedback = FeedbackService.create(db, user_id, feedback_in)
            return new_feedback, True

    @staticmethod
    def get_votes_for_content(db: Session, content_id: str) -> list[Feedback]:
        """Retrieve all votes for a content item."""
        return db.query(Feedback).filter(Feedback.content_id == content_id).all()

    @staticmethod
    def get_by_user_and_content_ids(
        db: Session, user_id: int, content_ids: list[str]
    ) -> list[Feedback]:
        """Retrieve votes for a user across multiple content IDs.

        Returns empty list if content_ids is empty or no votes found.
        """
        if not content_ids:
            return []
        return (
            db.query(Feedback)
            .filter(
                Feedback.user_id == user_id, Feedback.content_id.in_(content_ids)
            )
            .all()
        )
