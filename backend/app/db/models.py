from sqlalchemy import Column, Integer, String, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name       = Column(String, nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow)
    sessions        = relationship("ChatSession", back_populates="user", cascade="all, delete")

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    title           = Column(String, nullable=True)
    sport           = Column(String, nullable=True)
    duration_mins   = Column(Float, nullable=True)
    intensity       = Column(String, nullable=True)
    goal            = Column(String, nullable=True)
    weight_kg       = Column(Float, nullable=True)
    age             = Column(Integer, nullable=True)
    sex             = Column(String, nullable=True)
    carbs_g         = Column(Float, nullable=True)
    protein_g       = Column(Float, nullable=True)
    calories_burned = Column(Float, nullable=True)
    meal_plan       = Column(Text, nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow)
    user            = relationship("User", back_populates="sessions")
    messages        = relationship("ChatMessage", back_populates="session", cascade="all, delete")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id         = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    role       = Column(String, nullable=False)
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    session    = relationship("ChatSession", back_populates="messages")

class CaloriePrediction(Base):
    __tablename__ = "calorie_predictions"
    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    gender          = Column(String, nullable=True)
    age             = Column(Integer, nullable=True)
    height          = Column(Float, nullable=True)
    weight_kg       = Column(Float, nullable=True)
    duration_mins   = Column(Float, nullable=True)
    heart_rate      = Column(Float, nullable=True)
    body_temp       = Column(Float, nullable=True)
    calories_burned = Column(Float, nullable=True)
    energy_needed   = Column(Float, nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow)
    user            = relationship("User", backref="calorie_predictions")
