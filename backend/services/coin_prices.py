import httpx

from services.cache import TTLCache

cache = TTLCache[list[dict]](ttl_seconds=300)

ASSET_TO_COINGECKO_ID = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana",
}

STABLECOIN_MAP = {
    "tether": "USDT",
    "usd-coin": "USDC",
}

ALTCOIN_MAP = {
    "cardano": "ADA",
    "polkadot": "DOT",
    "chainlink": "LINK",
    "avalanche-2": "AVAX",
    "dogecoin": "DOGE",
}


def resolve_coin_ids(crypto_assets: list[str]) -> dict[str, str]:
    """Resolve user's crypto_assets to CoinGecko coin IDs.

    Returns dict mapping coin_id -> symbol.
    """
    resolved = {}

    for asset in crypto_assets:
        if asset in ASSET_TO_COINGECKO_ID:
            coin_id = ASSET_TO_COINGECKO_ID[asset]
            resolved[coin_id] = asset
        elif asset == "Stablecoins":
            resolved.update({cid: sym for cid, sym in STABLECOIN_MAP.items()})
        elif asset == "Altcoins":
            resolved.update({cid: sym for cid, sym in ALTCOIN_MAP.items()})

    return resolved


def get_coin_prices(crypto_assets: list[str]) -> list[dict]:
    """Fetch current coin prices from CoinGecko."""
    cache_key = ",".join(sorted(crypto_assets))
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return cached_result

    resolved = resolve_coin_ids(crypto_assets)

    if not resolved:
        return []

    coin_ids = list(resolved.keys())
    prices_data = {}

    try:
        response = httpx.get(
            "https://api.coingecko.com/api/v3/coins/markets",
            params={
                "vs_currency": "usd",
                "ids": ",".join(coin_ids),
                "order": "market_cap_desc",
                "per_page": 250,
                "sparkline": False,
            },
            timeout=5.0,
        )
        response.raise_for_status()
        data = response.json()
        for coin in data:
            coin_id = coin.get("id")
            prices_data[coin_id] = {
                "name": coin.get("name", ""),
                "symbol": coin.get("symbol", "").upper(),
                "price": coin.get("current_price"),
                "market_cap": coin.get("market_cap"),
                "change_24h": coin.get("price_change_percentage_24h"),
            }
    except (httpx.HTTPError, ValueError, KeyError, httpx.RequestError):
        prices_data = {}

    result = []
    for coin_id, symbol in resolved.items():
        if coin_id in prices_data:
            price_info = prices_data[coin_id]
            result.append(
                {
                    "content_id": f"price:{symbol.lower()}",
                    "name": price_info["name"],
                    "symbol": symbol,
                    "price": price_info["price"],
                    "market_cap": price_info["market_cap"],
                    "change_24h": price_info["change_24h"],
                    "unavailable": False,
                }
            )
        else:
            result.append(
                {
                    "content_id": f"price:{symbol.lower()}",
                    "name": "",
                    "symbol": symbol,
                    "price": None,
                    "market_cap": None,
                    "change_24h": None,
                    "unavailable": True,
                }
            )

    cache.set(cache_key, result)
    return result
