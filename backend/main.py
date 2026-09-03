from fastapi import FastAPI

from routers import health

app = FastAPI(title="AI Crypto Advisor API")

app.include_router(health.router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "AI Crypto Advisor API"}
