from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from routers import auth, dashboard, feedback, health, preferences

app = FastAPI(title="AI Crypto Advisor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(preferences.router)
app.include_router(feedback.router)
app.include_router(dashboard.router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "AI Crypto Advisor API"}
