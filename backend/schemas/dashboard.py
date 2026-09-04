from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class NewsItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    content_id: str
    headline: str
    description: str
    source: str
    date: str


class PriceData(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    symbol: str
    price: Optional[float] = None
    market_cap: Optional[float] = None
    change_24h: Optional[float] = None
    unavailable: bool = False


class PriceItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    content_id: str
    name: str
    symbol: str
    price: Optional[float] = None
    market_cap: Optional[float] = None
    change_24h: Optional[float] = None
    unavailable: bool = False


class InsightItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    content_id: str
    content: str


class MemeItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    content_id: str
    image_url: str
    caption: Optional[str] = None
