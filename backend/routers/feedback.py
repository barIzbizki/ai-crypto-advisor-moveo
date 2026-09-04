from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from core.database import get_db
from models.user import User
from routers.auth import get_current_user
from schemas.feedback import FeedbackCreate, FeedbackWithVotesResponse
from services.feedback import FeedbackService

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackWithVotesResponse)
def submit_feedback(
    feedback_in: FeedbackCreate,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FeedbackWithVotesResponse:
    feedback, is_new = FeedbackService.upsert(db, current_user.id, feedback_in)

    all_votes = FeedbackService.get_votes_for_content(db, feedback_in.content_id)
    existing_votes = [v for v in all_votes if v.user_id != current_user.id]

    response.status_code = (
        status.HTTP_201_CREATED if is_new else status.HTTP_200_OK
    )

    return FeedbackWithVotesResponse(
        feedback=feedback,
        existing_votes=existing_votes,
        dashboard_content=None,
    )
