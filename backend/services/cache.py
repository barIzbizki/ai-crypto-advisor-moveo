import time
from typing import Generic, TypeVar

T = TypeVar('T')


class TTLCache(Generic[T]):
    def __init__(self, ttl_seconds: float):
        self.ttl_seconds = ttl_seconds
        self._cache: dict[str, tuple[T, float]] = {}

    def get(self, key: str) -> T | None:
        if key not in self._cache:
            return None

        value, expiry_time = self._cache[key]
        if time.monotonic() >= expiry_time:
            del self._cache[key]
            return None

        return value

    def set(self, key: str, value: T) -> None:
        expiry_time = time.monotonic() + self.ttl_seconds
        self._cache[key] = (value, expiry_time)
