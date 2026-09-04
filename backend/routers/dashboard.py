from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from models.user import User
from routers.auth import get_current_user
from schemas.dashboard import InsightItem, MemeItem, NewsItem, PriceItem
from services.ai_insight import get_or_create_daily_insight
from services.coin_prices import get_coin_prices
from services.crypto_meme import get_meme
from services.market_news import get_market_news
from services.preferences import PreferencesService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/news", response_model=list[NewsItem])
def get_dashboard_news(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[NewsItem]:
    preferences = PreferencesService.get_by_user_id(db, current_user.id)
    if preferences is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User preferences not found",
        )

    news = get_market_news(preferences.crypto_assets)
    return [
        NewsItem(
            content_id=item["content_id"],
            headline=item["headline"],
            description=item["description"],
            source=item["source"],
            date=item["date"],
        )
        for item in news
    ]


@router.get("/prices", response_model=list[PriceItem])
def get_dashboard_prices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[PriceItem]:
    preferences = PreferencesService.get_by_user_id(db, current_user.id)
    if preferences is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User preferences not found",
        )

    prices = get_coin_prices(preferences.crypto_assets)
    return [
        PriceItem(
            content_id=item["content_id"],
            name=item["name"],
            symbol=item["symbol"],
            price=item["price"],
            market_cap=item["market_cap"],
            change_24h=item["change_24h"],
            unavailable=item["unavailable"],
        )
        for item in prices
    ]


@router.get("/insight", response_model=InsightItem)
def get_dashboard_insight(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InsightItem:
    preferences = PreferencesService.get_by_user_id(db, current_user.id)
    if preferences is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User preferences not found",
        )

    insight = get_or_create_daily_insight(
        db,
        current_user.id,
        preferences.investor_type,
        preferences.crypto_assets,
        preferences.content_types,
    )

    return InsightItem(
        content_id=insight["content_id"],
        content=insight["content"],
    )


@router.get("/meme", response_model=MemeItem)
def get_dashboard_meme(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MemeItem:
    preferences = PreferencesService.get_by_user_id(db, current_user.id)
    if preferences is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User preferences not found",
        )

    meme = get_meme(preferences.content_types)

    return MemeItem(
        content_id=meme["content_id"],
        image_url=meme["image_url"],
        caption=meme.get("caption"),
    )
