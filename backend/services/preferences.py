from sqlalchemy.orm import Session

from models.preferences import UserPreferences
from models.user import User
from schemas.preferences import PreferencesCreate, PreferencesUpdate


class PreferencesService:
    @staticmethod
    def get_by_user_id(db: Session, user_id: int) -> UserPreferences | None:
        """Retrieve preferences for a user by user_id. Returns None if not found."""
        return (
            db.query(UserPreferences).filter(UserPreferences.user_id == user_id).first()
        )

    @staticmethod
    def create(
        db: Session, user_id: int, preferences_in: PreferencesCreate
    ) -> UserPreferences:
        """Create new preferences for a user.

        Raises IntegrityError if preferences already exist.
        """
        preferences = UserPreferences(
            user_id=user_id,
            trading_strategy=preferences_in.trading_strategy,
            risk_level=preferences_in.risk_level,
            notification_preferences=preferences_in.notification_preferences,
        )
        db.add(preferences)
        db.commit()
        db.refresh(preferences)
        return preferences

    @staticmethod
    def update(
        db: Session, preferences: UserPreferences, preferences_in: PreferencesUpdate
    ) -> UserPreferences:
        """Update existing preferences with new values.

        Only updates fields that are set.
        """
        update_data = preferences_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(preferences, field, value)
        db.add(preferences)
        db.commit()
        db.refresh(preferences)
        return preferences

    @staticmethod
    def upsert(
        db: Session, user_id: int, preferences_in: PreferencesCreate
    ) -> UserPreferences:
        """Create or update preferences for a user.

        Sets user.onboarded to True upon success.
        """
        existing_preferences = PreferencesService.get_by_user_id(db, user_id)

        if existing_preferences:
            update_in = PreferencesUpdate(**preferences_in.model_dump())
            updated_preferences = PreferencesService.update(
                db, existing_preferences, update_in
            )
        else:
            updated_preferences = PreferencesService.create(db, user_id, preferences_in)

        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.onboarded = True
            db.add(user)
            db.commit()

        return updated_preferences
