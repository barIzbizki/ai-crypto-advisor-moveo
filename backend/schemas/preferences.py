from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from models.preferences import InvestorType


class PreferencesCreate(BaseModel):
    investor_type: InvestorType
    crypto_assets: list[str] = Field(..., min_length=1)
    content_types: list[str] = Field(..., min_length=1)


class PreferencesUpdate(BaseModel):
    investor_type: InvestorType
    crypto_assets: list[str] = Field(..., min_length=1)
    content_types: list[str] = Field(..., min_length=1)


class PreferencesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    investor_type: InvestorType
    crypto_assets: list[str]
    content_types: list[str]
    created_at: datetime
    updated_at: datetime
