# nutri_athlete AI 🏋️

> AI-powered sports nutrition assistant for East African athletes — personalized recovery meal plans using local foods, RAG-powered science, and ML-based calories prediction.

**GitHub Repo:** https://github.com/Gakwaya011/athlete-recovery-AI
**Live App:** https://athlete-recovery-ai.vercel.app
**Backend API:** https://athlete-recovery-ai.onrender.com
**Video Demo:** https://drive.google.com/file/d/1nRW5ONzEkljlcpa5NlIYCOIyhprG0QaM/view?usp=sharing

---

## Overview

nutri_athlete AI addresses a critical gap in sports nutrition technology for East African athletes. Most nutrition apps recommend Western-centric foods and require expensive wearables. This platform:

- Recommends **local East African foods** (Ugali, Matoke, Isambaza, Ikivuguto) for recovery
- Uses **peer-reviewed sports science** (FIFA, ACSM, IOC, UEFA) via RAG pipeline
- Predicts **calories burned** using a trained XGBoost model (R²=0.9996)
- Works **without expensive wearable devices** for the calories tracker

---

## Features

- 🤖 **RAG Nutrition Chatbot** — LLaMA 3.3 70B + ChromaDB retrieval from 4 peer-reviewed sports science PDFs
- 🍽️ **Personalized Meal Plans** — local East African foods matched to athlete macros
- 🔥 **Calories Burned Prediction** — XGBoost model trained on 15,000 samples (R²=0.9996, MAE=0.89)
- 📊 **Workout History Graph** — calories burned vs energy needed over time
- 🔐 **JWT Authentication** — secure user accounts with PostgreSQL
- 🌍 **Deployed** — React frontend on Vercel, FastAPI backend on Render

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Tailwind CSS, Recharts |
| Backend | FastAPI, Python 3.11 |
| AI/ML | Groq LLaMA 3.3 70B, RAG, ChromaDB, XGBoost |
| Database | PostgreSQL (Render) |
| Embeddings | HuggingFace BAAI/bge-large-en-v1.5 |
| Deployment | Vercel (frontend), Render (backend) |

---

## ML Model — Calories Prediction

### Dataset
- 15,000 samples from Kaggle fitness dataset
- Features: Gender, Age, Height, Weight, Duration, Heart Rate, Body Temperature

### Feature Engineering
- BMI = Weight / Height²
- Weight_Duration = Weight × Duration
- HR_Duration = Heart Rate × Duration (most important feature: 61.4% importance)

### Model Performance

| Metric | Value |
|--------|-------|
| R² Score | 0.9996 (99.96%) |
| RMSE | 1.28 calories |
| MAE | 0.89 calories |
| Algorithm | XGBoost Regressor |
| Training samples | 12,000 |

### Scientific Grounding (RAG Sources)
- FIFA Nutrition for Football (2006)
- ACSM/ADA Position Paper on Nutrition and Athletic Performance (2009)
- IOC Nutrition Booklet (2012)
- UEFA Expert Group Statement — Collins et al., BJSM (2020)

---

## Installation & Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL database

### Backend Setup
```bash
git clone https://github.com/Gakwaya011/athlete-recovery-AI.git
cd athlete-recovery-AI/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `.env` file in `backend/`:
```
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=your_secret_key
database_url=postgresql://user:password@host/dbname?sslmode=require
```

Run backend:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env` file in `frontend/`:
```
REACT_APP_API_URL=http://localhost:8000
```

Run frontend:
```bash
npm start
```

Open `http://localhost:3000`

---

## Project Structure
```
athlete-recovery-AI/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # FastAPI routes (chat, auth, calories)
│   │   ├── db/                 # SQLAlchemy models
│   │   ├── services/           # RAG agent (LLM + ChromaDB)
│   │   └── core/               # Config and settings
│   ├── data/
│   │   ├── East_Africa_Food_Dataset_FINAL.csv
│   │   ├── calories_model.pkl  # Trained XGBoost model
│   │   └── science_db_pro/     # ChromaDB vector store
│   └── main.py
├── frontend/
│   └── src/
│       ├── pages/              # Chat, Dashboard, Calories, History
│       ├── components/         # Sidebar, ChatWindow, Logo
│       └── api/                # Axios API calls
└── ML/
    └── notebooks/              # XGBoost training notebook
```

---

## Deployment

### Backend — Render Web Service
- **Platform:** Render
- **Runtime:** Python 3.11
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:** `GROQ_API_KEY`, `SECRET_KEY`, `database_url`

### Frontend — Vercel
- **Platform:** Vercel
- **Framework:** Create React App
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Environment Variables:** `REACT_APP_API_URL`

### Database — Render PostgreSQL
- Free tier PostgreSQL
- SSL required: `?sslmode=require`
- Tables: `users`, `chat_sessions`, `chat_messages`, `calorie_predictions`

---

## Testing

The system was tested under different conditions:

**Different sports:** Football, basketball, running, gym, volleyball, cycling

**Gatekeeper testing:** Non-sport inputs (hide and seek, coding) correctly rejected

**Different athlete profiles:**
- Male vs female (different iron and carb recommendations)
- Youth vs adult vs veteran (age-adjusted macros)
- Light vs moderate vs heavy intensity

**Calories prediction tested with:**
- Different genders, ages, weights, durations
- Light workout (yoga 10min) → 37 kcal ✅
- Heavy workout (football 30min, HR 155) → 237 kcal ✅

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login and get JWT token |
| POST | `/api/v1/chat` | Send message to nutrition agent |
| GET | `/api/v1/sessions` | Get all chat sessions |
| GET | `/api/v1/sessions/{id}` | Get session with messages |
| GET | `/api/v1/stats` | Get dashboard stats |
| POST | `/api/v1/predict-calories` | Predict calories burned |
| GET | `/api/v1/calorie-history` | Get calorie prediction history |

---

## License

MIT License

---

## Acknowledgments

- Groq for LLaMA 3.3 70B inference
- HuggingFace for BAAI/bge-large-en-v1.5 embeddings
- FIFA, ACSM, IOC, UEFA for peer-reviewed sports nutrition guidelines
- Kaggle for the calories prediction dataset

---

*Built to empower East African athletes with accessible, localized recovery science* 🌍
