from datetime import date

import httpx
from sqlalchemy.orm import Session

from core.config import settings
from models.ai_insight import AIInsight

FALLBACK_INSIGHT = (
    "Today's crypto market shows mixed signals. Keep an eye on major support and resistance levels. "
    "Remember to diversify your portfolio and never invest more than you can afford to lose. "
    "Stay updated with latest market trends and regulatory news."
)

HODLER_PROMPT_TEMPLATE = (
    "Write a brief, personalized daily crypto insight for a long-term hodler interested in {assets}. "
    "Focus on long-term adoption, fundamental strength, and accumulation opportunities. "
    "Keep it to 2-3 sentences."
)

DAY_TRADER_PROMPT_TEMPLATE = (
    "Write a brief, personalized daily crypto insight for a day trader interested in {assets}. "
    "Focus on short-term price action, technical levels, and volatility opportunities. "
    "Keep it to 2-3 sentences."
)

NFT_COLLECTOR_PROMPT_TEMPLATE = (
    "Write a brief, personalized daily crypto insight for an NFT collector interested in {assets}. "
    "Focus on digital collectibles market trends, emerging projects, and marketplace activity. "
    "Keep it to 2-3 sentences."
)


def get_or_create_daily_insight(
    db: Session,
    user_id: int,
    investor_type: str,
    crypto_assets: list[str],
    content_types: list[str],
) -> dict:
    """Get or generate a daily AI insight for the user."""
    today = date.today()

    existing = (
        db.query(AIInsight)
        .filter(AIInsight.user_id == user_id, AIInsight.insight_date == today)
        .first()
    )

    if existing:
        return {
            "content_id": f"ai-insight:{user_id}:{today.isoformat()}",
            "content": existing.content,
        }

    prompt = build_prompt(investor_type, crypto_assets)

    content = FALLBACK_INSIGHT

    if settings.openrouter_api_key:
        content = fetch_insight_from_llm(prompt)
        if not content:
            content = FALLBACK_INSIGHT

    insight = AIInsight(
        user_id=user_id,
        insight_date=today,
        content=content,
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)

    return {
        "content_id": f"ai-insight:{user_id}:{today.isoformat()}",
        "content": insight.content,
    }


def build_prompt(investor_type: str, crypto_assets: list[str]) -> str:
    """Build a personalized prompt based on investor type and assets."""
    assets_str = ", ".join(crypto_assets[:5])

    if investor_type == "hodler":
        return HODLER_PROMPT_TEMPLATE.format(assets=assets_str)
    elif investor_type == "day_trader":
        return DAY_TRADER_PROMPT_TEMPLATE.format(assets=assets_str)
    elif investor_type == "nft_collector":
        return NFT_COLLECTOR_PROMPT_TEMPLATE.format(assets=assets_str)
    else:
        return f"Write a brief daily crypto insight for someone interested in {assets_str}. Keep it to 2-3 sentences."


def fetch_insight_from_llm(prompt: str) -> str | None:
    """Call OpenRouter to generate an insight."""
    try:
        response = httpx.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
            },
            json={
                "model": "openai/gpt-3.5-turbo",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens": 150,
            },
            timeout=15.0,
        )
        response.raise_for_status()
        data = response.json()
        if "choices" in data and len(data["choices"]) > 0:
            return data["choices"][0].get("message", {}).get("content", "").strip()
        return None
    except (httpx.HTTPError, httpx.RequestError, ValueError, KeyError, IndexError):
        return None
