from sqlalchemy.orm import Session

from models.user import User
from schemas.auth import UserCreate
from services.security import hash_password, verify_password


class EmailAlreadyRegisteredError(Exception):
    pass


def register_user(db: Session, user_in: UserCreate) -> User:
    if db.query(User).filter(User.email == user_in.email).first() is not None:
        raise EmailAlreadyRegisteredError(user_in.email)

    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if user is None or not verify_password(password, user.hashed_password):
        return None
    return user
