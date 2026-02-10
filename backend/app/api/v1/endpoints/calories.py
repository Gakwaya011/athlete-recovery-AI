from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pickle
import pandas as pd
from pathlib import Path
import os

router = APIRouter()

# Get the absolute path to the directory this file is in
current_file_path = os.path.abspath(__file__)
# Go up 3 levels to reach 'app' folder (endpoints -> v1 -> api -> app)
app_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(current_file_path))))
MODEL_PATH = os.path.join(app_root, "models", "calorie_model.pkl")

class CalorieRequest(BaseModel):
    gender: int  # 1 for male, 0 for female
    age: int
    height: float
    weight: float
    duration: float

@router.post("/predict")
async def predict_expenditure(data: CalorieRequest):
    try:
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        
        # --- THE FIX: FORCE CLEAR FEATURE NAMES ---
        # This stops XGBoost from being picky about column names
        if hasattr(model, 'get_booster'):
            model.get_booster().feature_names = None
        # ------------------------------------------

        # Data as a simple NumPy array to avoid name checks
        input_data = [[
            data.gender, data.age, data.height, data.weight, data.duration
        ]]
        
        # Predict using the raw array
        prediction = model.predict(input_data)
        
        return {"calories_burned": round(float(prediction[0]), 2)}
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))