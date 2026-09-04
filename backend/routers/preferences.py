from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from models.user import User
from routers.auth import get_current_user
from schemas.preferences import PreferencesCreate, PreferencesResponse
from services.preferences import PreferencesService

router = APIRouter(prefix="/preferences", tags=["preferences"])


@router.get("", response_model=PreferencesResponse, status_code=status.HTTP_200_OK)
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PreferencesResponse:
    preferences = PreferencesService.get_by_user_id(db, current_user.id)
    if preferences is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Preferences not found",
        )
    return preferences


@router.post(
    "", response_model=PreferencesResponse, status_code=status.HTTP_201_CREATED
)
def create_or_update_preferences(
    preferences_in: PreferencesCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PreferencesResponse:
    try:
        preferences = PreferencesService.upsert(db, current_user.id, preferences_in)
        return preferences
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
