from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class FeedbackCreate(BaseModel):
    content_id: str = Field(..., min_length=1, max_length=255)
    rating: int = Field(..., ge=1, le=5)


class FeedbackUpdate(BaseModel):
    rating: int = Field(..., ge=1, le=5)


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    content_id: str
    rating: int
    created_at: datetime
    updated_at: datetime


class FeedbackWithVotesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    feedback: FeedbackResponse
    existing_votes: list[FeedbackResponse]
    dashboard_content: Optional[dict] = None
