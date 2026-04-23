from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from models.users import User as Users
from schemas.users import UserCreate, UserLogin
from utils.auth import hash_password, verify_password, create_access_token

def register_user(user: UserCreate, db: Session):
    existing_user = db.query(Users).filter(Users.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = hash_password(user.password)
    new_user = Users(name=user.name, email=user.email, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
        "message": "User registered successfully",
        "user": {
            "email": new_user.email,
            "user_id": new_user.user_id,
            "name": new_user.name
        }
    }

def login_user(user: UserLogin, db: Session):
    db_user = db.query(Users).filter(Users.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": db_user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": db_user.name,
        "user_id": db_user.user_id  # ✅ هذا السطر يحل المشكلة
    }
