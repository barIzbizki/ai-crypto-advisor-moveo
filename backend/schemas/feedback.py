from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class FeedbackCreate(BaseModel):
    content_id: str = Field(..., min_length=1, max_length=255)
    is_upvote: bool


class FeedbackUpdate(BaseModel):
    is_upvote: bool


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    content_id: str
    is_upvote: bool
    created_at: datetime
    updated_at: datetime


class FeedbackWithVotesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    feedback: FeedbackResponse
    existing_votes: list[FeedbackResponse]
    dashboard_content: Optional[dict] = None
