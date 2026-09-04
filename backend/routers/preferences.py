from fastapi import APIRouter, Depends, HTTPException, Response, status
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


@router.post("", response_model=PreferencesResponse)
def create_or_update_preferences(
    preferences_in: PreferencesCreate,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PreferencesResponse:
    already_existed = PreferencesService.get_by_user_id(db, current_user.id) is not None
    try:
        preferences = PreferencesService.upsert(db, current_user.id, preferences_in)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    response.status_code = (
        status.HTTP_200_OK if already_existed else status.HTTP_201_CREATED
    )
    return preferences
