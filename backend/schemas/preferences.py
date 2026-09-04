from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class PreferencesCreate(BaseModel):
    trading_strategy: str = Field(..., min_length=1, max_length=255)
    risk_level: Optional[str] = Field(None, max_length=255)
    notification_preferences: Optional[dict] = None


class PreferencesUpdate(BaseModel):
    trading_strategy: Optional[str] = Field(None, min_length=1, max_length=255)
    risk_level: Optional[str] = Field(None, max_length=255)
    notification_preferences: Optional[dict] = None


class PreferencesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    trading_strategy: str
    risk_level: Optional[str]
    notification_preferences: Optional[dict]
    created_at: datetime
    updated_at: datetime
