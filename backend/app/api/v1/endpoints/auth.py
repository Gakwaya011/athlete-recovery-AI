from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from app.db.session import get_db
from app.db.models import User
from app.core.config import settings

router = APIRouter()

pwd_context   = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

ALGORITHM            = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


# ── Schemas ──────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email:     EmailStr
    password:  str
    full_name: str

class UserOut(BaseModel):
    id:        int
    email:     str
    full_name: str
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str
    user:         UserOut


# ── Helpers ───────────────────────────────────────────────
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ── Routes ────────────────────────────────────────────────
@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered.")
    user = User(
        email           = data.email,
        hashed_password = hash_password(data.password),
        full_name       = data.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, token_type="bearer", user=UserOut.from_orm(user))


@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, token_type="bearer", user=UserOut.from_orm(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user