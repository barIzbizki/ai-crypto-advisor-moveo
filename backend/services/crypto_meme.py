import random

from data.memes import MEMES_DATA


def get_meme(content_types: list[str]) -> dict:
    """Select and return a crypto meme."""
    prefer_fun = "Fun" in content_types

    tagged_memes = [m for m in MEMES_DATA if "fun" in m.get("tags", [])]

    if prefer_fun and tagged_memes:
        pool = tagged_memes
    else:
        pool = MEMES_DATA

    meme = random.choice(pool)

    return {
        "content_id": f"meme:{meme['slug']}",
        "image_url": meme["image_url"],
        "caption": meme.get("caption"),
    }
