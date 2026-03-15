import re, os, json
import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.schemas.chat import ChatRequest, ChatResponse, SessionOut, SessionDetailOut
from app.services.agent import agent
from app.db.session import get_db
from app.db.models import ChatSession, ChatMessage, User, CaloriePrediction
from app.api.v1.endpoints.auth import get_current_user
from pydantic import BaseModel as PydanticBase

router = APIRouter()

# ── Load calories model ──────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
MODEL_PATH = os.path.join(BASE_DIR, "data", "calories_model.pkl")
META_PATH  = os.path.join(BASE_DIR, "data", "model_metadata.json")

FEATURE_COLS = [
    'Gender_encoded', 'Age', 'Height', 'Weight',
    'Duration', 'Heart_Rate', 'Body_Temp',
    'BMI', 'Weight_Duration', 'HR_Duration'
]

try:
    calories_model = joblib.load(MODEL_PATH)
    with open(META_PATH) as f:
        model_meta = json.load(f)
    print("✅ Calories model loaded.")
except Exception as e:
    calories_model = None
    model_meta     = None
    print(f"⚠️ Calories model not loaded: {e}")


def _predict_calories(
    gender: str, age: int, height: float, weight: float,
    duration: float, heart_rate: float, body_temp: float
) -> Optional[float]:
    if calories_model is None:
        return None
    try:
        gender_enc = 1 if gender.lower() == 'male' else 0
        bmi        = weight / ((height / 100) ** 2)
        weight_dur = weight * duration
        hr_dur     = heart_rate * duration

        features = pd.DataFrame(
            [[gender_enc, age, height, weight, duration, heart_rate, body_temp, bmi, weight_dur, hr_dur]],
            columns=FEATURE_COLS
        )
        pred = calories_model.predict(features.values)[0]
        return round(float(pred), 1)
    except Exception as e:
        print(f"⚠️ Calories prediction error: {e}")
        return None


# ── Chat endpoint ────────────────────────────────────────
@router.post("/chat", response_model=ChatResponse)
async def chat(
    request:      ChatRequest,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    reply, profile_confirmed = agent.chat(messages)

    session_id = request.session_id
    session    = None

    try:
        if session_id:
            session = db.query(ChatSession).filter(
                ChatSession.id      == session_id,
                ChatSession.user_id == current_user.id
            ).first()

        if session is None:
            first_user_msg = next((m["content"] for m in messages if m["role"] == "user"), "New chat")
            title   = first_user_msg[:60] + "..." if len(first_user_msg) > 60 else first_user_msg
            session = ChatSession(user_id=current_user.id, title=title)
            db.add(session)
            db.flush()
            session_id = session.id
            for m in messages:
                db.add(ChatMessage(session_id=session_id, role=m["role"], content=m["content"]))
        else:
            last_user = messages[-1]
            db.add(ChatMessage(session_id=session_id, role=last_user["role"], content=last_user["content"]))

        db.add(ChatMessage(session_id=session_id, role="assistant", content=reply))

        if profile_confirmed and 'What Your Body Needs' in reply:
            try:
                detected = agent._auto_detect(
                    " ".join([m["content"] for m in messages if m["role"] == "user"])
                )

                carbs_match   = re.search(r'Carbohydrates:\*\*\s*([\d.]+)g', reply)
                protein_match = re.search(r'Protein:\*\*\s*([\d.]+)g', reply)
                carbs_g   = float(carbs_match.group(1))   if carbs_match   else None
                protein_g = float(protein_match.group(1)) if protein_match else None

                weight_kg     = float(detected.get('weight_kg') or 70)
                duration_mins = float(detected.get('duration_mins') or 60)
                sex           = detected.get('sex', 'male')
                age_group     = detected.get('age_group', 'adult')
                intensity     = detected.get('intensity', 'moderate')

                age_map  = {'youth': 16, 'adult': 25, 'veteran': 45}
                hr_map   = {'light': 85, 'moderate': 110, 'heavy': 150}
                temp_map = {'light': 38.5, 'moderate': 39.2, 'heavy': 39.8}

                age_num    = age_map.get(age_group, 25)
                heart_rate = hr_map.get(intensity, 110)
                body_temp  = temp_map.get(intensity, 39.2)
                height     = 175.0 if sex == 'male' else 163.0

                calories_burned = _predict_calories(
                    gender=sex, age=age_num, height=height,
                    weight=weight_kg, duration=duration_mins,
                    heart_rate=heart_rate, body_temp=body_temp
                )

                session.sport           = detected.get('sport', 'general sport')
                session.duration_mins   = duration_mins
                session.intensity       = intensity
                session.goal            = detected.get('goal', 'recovery')
                session.weight_kg       = weight_kg
                session.sex             = sex
                session.carbs_g         = carbs_g
                session.protein_g       = protein_g
                session.calories_burned = calories_burned
                session.meal_plan       = reply

            except Exception as e:
                print(f"⚠️ Session update error: {e}")

        db.commit()

    except Exception as e:
        print(f"⚠️ DB error: {e}")
        db.rollback()

    return ChatResponse(reply=reply, profile_confirmed=profile_confirmed, session_id=session_id)


# ── Get all sessions ─────────────────────────────────────
@router.get("/sessions", response_model=List[SessionOut])
async def get_sessions(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    try:
        sessions = db.query(ChatSession)\
                     .filter(ChatSession.user_id == current_user.id)\
                     .order_by(ChatSession.created_at.desc())\
                     .limit(50)\
                     .all()
        return sessions
    except Exception as e:
        print(f"⚠️ DB error: {e}")
        db.rollback()
        return []


# ── Get single session with messages ─────────────────────
@router.get("/sessions/{session_id}", response_model=SessionDetailOut)
async def get_session(
    session_id:   int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    try:
        session = db.query(ChatSession).filter(
            ChatSession.id      == session_id,
            ChatSession.user_id == current_user.id
        ).first()
        if not session:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except Exception as e:
        db.rollback()
        raise


# ── Delete session ────────────────────────────────────────
@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id:   int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    try:
        session = db.query(ChatSession).filter(
            ChatSession.id      == session_id,
            ChatSession.user_id == current_user.id
        ).first()
        if not session:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Session not found")
        db.delete(session)
        db.commit()
        return {"deleted": True}
    except Exception as e:
        db.rollback()
        raise


# ── Stats for dashboard graph ─────────────────────────────
@router.get("/stats")
async def get_stats(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    try:
        sessions = db.query(ChatSession).filter(
            ChatSession.user_id         == current_user.id,
            ChatSession.calories_burned != None
        ).order_by(ChatSession.created_at.asc()).limit(20).all()

        return {
            "sessions": [
                {
                    "id":              s.id,
                    "date":            s.created_at.strftime("%b %d"),
                    "sport":           s.sport or "Unknown",
                    "duration_mins":   s.duration_mins,
                    "calories_burned": s.calories_burned,
                    "energy_needed":   round(s.calories_burned * 1.1, 1) if s.calories_burned else None,
                    "carbs_g":         s.carbs_g,
                    "protein_g":       s.protein_g,
                    "goal":            s.goal,
                }
                for s in sessions
            ],
            "total_sessions": len(sessions),
            "total_calories": round(sum(s.calories_burned for s in sessions if s.calories_burned), 1),
            "avg_calories":   round(sum(s.calories_burned for s in sessions if s.calories_burned) / len(sessions), 1) if sessions else 0,
        }
    except Exception as e:
        print(f"⚠️ Stats error: {e}")
        db.rollback()
        return {"sessions": [], "total_sessions": 0, "total_calories": 0, "avg_calories": 0}


# ── Calories prediction request schema ───────────────────
class CaloriesRequest(PydanticBase):
    gender:     str
    age:        int
    height:     float
    weight:     float
    duration:   float
    heart_rate: float
    body_temp:  float


# ── Predict calories + save to DB ────────────────────────
@router.post("/predict-calories")
async def predict_calories_endpoint(
    data:         CaloriesRequest,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    calories = _predict_calories(
        gender     = data.gender,
        age        = data.age,
        height     = data.height,
        weight     = data.weight,
        duration   = data.duration,
        heart_rate = data.heart_rate,
        body_temp  = data.body_temp,
    )
    if calories is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Model not available")

    energy = round(calories * 1.1, 1)

    try:
        prediction = CaloriePrediction(
            user_id         = current_user.id,
            gender          = data.gender,
            age             = data.age,
            height          = data.height,
            weight_kg       = data.weight,
            duration_mins   = data.duration,
            heart_rate      = data.heart_rate,
            body_temp       = data.body_temp,
            calories_burned = calories,
            energy_needed   = energy,
        )
        db.add(prediction)
        db.commit()
        print(f"✅ Prediction saved: {calories} kcal")
    except Exception as e:
        print(f"⚠️ Prediction save error: {e}")
        db.rollback()

    return {
        "calories_burned": calories,
        "energy_needed":   energy,
    }


# ── Calorie history for graph ─────────────────────────────
@router.get("/calorie-history")
async def get_calorie_history(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    try:
        predictions = db.query(CaloriePrediction)\
                        .filter(CaloriePrediction.user_id == current_user.id)\
                        .order_by(CaloriePrediction.created_at.asc())\
                        .limit(30)\
                        .all()
        return {
            "predictions": [
                {
                    "id":              p.id,
                    "date":            p.created_at.strftime("%b %d"),
                    "calories_burned": p.calories_burned,
                    "energy_needed":   p.energy_needed,
                    "duration_mins":   p.duration_mins,
                    "weight_kg":       p.weight_kg,
                }
                for p in predictions
            ]
        }
    except Exception as e:
        print(f"⚠️ History error: {e}")
        db.rollback()
        return {"predictions": []}