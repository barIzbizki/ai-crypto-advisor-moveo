import httpx

from core.config import settings
from data.fallback_news import FALLBACK_NEWS_DATA
from services.cache import TTLCache

cache = TTLCache[list[dict]](ttl_seconds=300)


def get_market_news(crypto_assets: list[str]) -> list[dict]:
    cache_key = ",".join(sorted(crypto_assets))
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return cached_result

    news_items = []

    if settings.cryptopanic_api_key:
        try:
            response = httpx.get(
                "https://cryptopanic.com/api/v1/posts/",
                params={"auth_token": settings.cryptopanic_api_key, "public": "true"},
                timeout=5.0,
            )
            response.raise_for_status()
            data = response.json()
            if "results" in data:
                for item in data["results"][:10]:
                    news_items.append(
                        {
                            "content_id": f"news:{item.get('id', 'unknown')}",
                            "headline": item.get("title", ""),
                            "description": item.get("body", "")[:200],
                            "source": item.get("source", {}).get("title", "CryptoPanic"),
                            "date": item.get("published_at", ""),
                            "assets": extract_assets_from_title(item.get("title", ""), crypto_assets),
                        }
                    )
        except (httpx.HTTPError, ValueError, KeyError, httpx.RequestError):
            news_items = []

    if not news_items:
        news_items = FALLBACK_NEWS_DATA.copy()

    ranked_news = rank_by_assets(news_items, crypto_assets)

    cache.set(cache_key, ranked_news)
    return ranked_news


def extract_assets_from_title(title: str, user_assets: list[str]) -> list[str]:
    """Extract asset symbols mentioned in the title that match user's assets."""
    matched = []
    title_upper = title.upper()
    for asset in user_assets:
        if asset.upper() in title_upper:
            matched.append(asset)
    return matched


def rank_by_assets(news_items: list[dict], user_assets: list[str]) -> list[dict]:
    """Rank news items so that asset-relevant items come first."""
    user_assets_set = set(ua.upper() for ua in user_assets)

    relevant = []
    general = []

    for item in news_items:
        item_assets_set = set(ia.upper() for ia in item.get("assets", []))
        if item_assets_set & user_assets_set:
            relevant.append(item)
        else:
            general.append(item)

    return relevant + general
