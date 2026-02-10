# Athlete Recovery AI: Predictive Recovery Engine

**GitHub Repo:** https://github.com/Gakwaya011/athlete-recovery-AI  
**Live API Demo:** https://athlete-recovery-ai.onrender.com/docs  
**Video Demonstration:** https://www.loom.com/share/422f7ed12dae46849046eb44aeb17eed

## Overview

Athlete Recovery AI is a specialized machine learning platform designed to optimize post-training recovery for athletes by predicting calories burned during a workout. This MVP focuses on a high-precision Machine Learning engine with a localized approach to fitness accessibility.

Our MVP addresses critical gaps in fitness technology through two core principles:

**Hardware Accessibility:** By removing dependencies on expensive wearable sensors (Heart Rate/Body Temperature), the system serves athletes regardless of their access to specialized hardware.

**Nutritional Localization:** While many apps suggest Western-centric diets (whey protein, blueberries, salmon), this platform is being engineered to recommend Rwandan local foods (e.g., Ibigori, Ibirayi, Amashaza) that provide the same recovery macronutrients at a fraction of the cost.

---

## Key Features

- ✅ **Wearable-Independent Predictions:** Works with basic fitness inputs, no expensive sensors required
- ✅ **Localized Recovery Protocols:** Recommends affordable, locally-available foods for optimal recovery
- ✅ **Real-Time API:** FastAPI backend for instant caloric burn predictions
- ✅ **Production-Ready:** Deployed on Render with automated CI/CD via GitHub
- ✅ **Accessibility-Focused:** Designed for athletes regardless of hardware or budget constraints

---

## Machine Learning Pipeline

### Data Engineering & Feature Selection

Our ML approach prioritizes real-world accessibility and local context:

**Strategic Feature Selection:** Dropped wearable-dependent features (Heart Rate, Body Temperature) to ensure the model functions in a local context without specialized sensors.

**Correlation Analysis:** Through rigorous data exploration, Duration emerged as the primary predictor of caloric burn with an R-value of 0.96, indicating an extremely strong linear relationship.

### Model Architecture

**Algorithm:** XGBoost Regressor (Extreme Gradient Boosting)

XGBoost is a decision-tree-based ensemble learning algorithm that uses a gradient boosting framework to iteratively improve predictions. This approach provides:

- Fast training and inference speeds
- Natural handling of non-linear relationships
- Robust performance across diverse athlete profiles
- Efficient memory usage suitable for cloud deployment

### Performance Metrics

| Metric | Value | Interpretation |
|--------|-------|-----------------|
| **R² Score** | 96.33% | Model explains 96.33% of caloric burn variance |
| **Mean Absolute Error (MAE)** | 8.54 Calories | Average prediction error is ±8.54 calories |
| **Accessibility** | Wearable-Free | No expensive sensors required |

---

## Backend Architecture

### API Specification

**Endpoint:** `POST /api/v1/calories/predict`

**Request Body:**
```json
{
  "age": 28,
  "weight": 75,
  "gender": "male",
  "duration": 45
}
```

**Response:**
```json
{
  "predicted_calories": 287.5,
  "confidence": "high",
  "timestamp": "2026-02-10T14:30:00Z"
}
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Web Framework** | FastAPI | High-performance async API |
| **ML Algorithm** | XGBoost | Gradient boosting predictions |
| **Model Serialization** | Pickle | Efficient binary model loading |
| **ASGI Server** | Uvicorn | Production-grade async server |
| **Deployment** | Render | Cloud hosting with auto CI/CD |
| **Python Version** | 3.12 | Latest stable Python release |

### Server-Side Logic

The backend uses FastAPI to serve the XGBoost model with the following design principles:

**Modular Routing:** The architecture is built using modular routing patterns, allowing for the easy addition of upcoming features like the localized nutrition engine.

**Scalability:** The API endpoint is designed to handle multiple concurrent requests efficiently, making it suitable for scaling as user base grows.

**Real-Time Inference:** Predictions are served in milliseconds, enabling interactive user experiences.

---

## Setup and Installation

### Prerequisites

- Python 3.12+
- Git
- pip or conda package manager

### Step 1: Clone the Repository
```bash
git clone https://github.com/Gakwaya011/athlete-recovery-AI.git
cd athlete-recovery-AI
```

### Step 2: Create Virtual Environment
```bash
python3.12 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Run the Development Server
```bash
uvicorn app.main:app --reload
```

Your API will be available at `http://localhost:8000`

### Step 5: Access API Documentation

Navigate to `http://localhost:8000/docs` to explore the interactive Swagger UI and test endpoints in real-time.

---

## API Usage Examples

### Using cURL
```bash
curl -X POST "http://localhost:8000/api/v1/calories/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 28,
    "weight": 75,
    "gender": "male",
    "duration": 45
  }'
```

### Using Python
```python
import requests

url = "http://localhost:8000/api/v1/calories/predict"
data = {
    "age": 28,
    "weight": 75,
    "gender": "male",
    "duration": 45
}

response = requests.post(url, json=data)
result = response.json()
print(f"Predicted Calories: {result['predicted_calories']}")
```

### Using JavaScript
```javascript
const data = {
  age: 28,
  weight: 75,
  gender: "male",
  duration: 45
};

fetch("http://localhost:8000/api/v1/calories/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
})
  .then(res => res.json())
  .then(result => console.log(`Predicted Calories: ${result.predicted_calories}`));
```

---

## Deployment

The project is currently deployed on **Render** at https://athlete-recovery-ai.onrender.com/docs

### Deployment Configuration

- **Platform:** Render (Cloud Hosting)
- **Runtime:** Python 3.12
- **Server:** Uvicorn with Gunicorn
- **CI/CD:** Automated deployment from GitHub push

### Accessing Live API
```bash
curl -X POST "https://athlete-recovery-ai.onrender.com/api/v1/calories/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 28,
    "weight": 75,
    "gender": "male",
    "duration": 45
  }'
```

---

## Future Roadmap & Localized Nutrition Strategy

### Phase 1: MVP (Current ✅)
- ✅ Core XGBoost prediction engine
- ✅ FastAPI backend with REST API
- ✅ Render deployment with CI/CD
- ✅ Swagger/OpenAPI documentation

### Phase 2: Localized Recovery Protocols (In Progress)

The next phase of development involves the `nutrition.py` endpoint. Instead of standard Western recovery suggestions, the system will map caloric needs to locally available Rwandan ingredients:

**Carbohydrate Replenishment:** Focus on Sweet Potatoes (Ibijumba) and Cassava (Imyumbati)
- These are nutrient-dense, affordable staples across Rwanda
- Provide rapid glucose replenishment for muscle glycogen restoration
- Culturally relevant and widely accessible

**Protein Recovery:** Focus on Beans (Ibihyimbo) and Groundnuts (Ibigori)
- Complete protein sources with essential amino acids
- Cost-effective compared to imported protein supplements
- Support muscle repair and adaptation after training

**Cost Efficiency:** The platform will provide athletes with a recovery plan that is:
- Scientifically accurate in meeting macronutrient requirements
- Economically feasible within the local market
- Culturally appropriate and readily available
- Nutritionally complete without reliance on expensive imports

---

## Testing

Run the test suite:
```bash
pytest tests/
```

Run with coverage:
```bash
pytest --cov=app tests/
```

---

## Project Structure
```
athlete-recovery-ai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── endpoints/
│   │   │           ├── auth.py
│   │   │           ├── calories.py
│   │   │           └── nutrition.py
│   │   ├── pycache/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   │   └── calorie_model.pkl
│   │   ├── schemas/
│   │   └── services/
│   ├── main.py              # FastAPI application entry point
│   ├── venv/
│   ├── .env
│   ├── .gitignore
│   ├── Procfile
│   └── requirements.txt
├── ML/
│   ├── data/
│   │   └── calories.csv
│   ├── models/
│   │   └── calorie_model.pkl
│   └── notebooks/
│       └── energy_expenditure.ipynb
└── README.md
```

---

## Performance Metrics

- **Current Capacity:** ~10,000 predictions/day
- **Response Time:** <100ms average latency
- **Model Accuracy:** 96.33% R² Score
- **Prediction Precision:** ±8.54 calories MAE

---

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

## Support & Contact

Have questions or feedback?

- **GitHub Issues:** https://github.com/Gakwaya011/athlete-recovery-AI/issues
- **Live API:** https://athlete-recovery-ai.onrender.com/docs
- **Video Demo:** https://www.loom.com/share/422f7ed12dae46849046eb44aeb17eed

---

## Acknowledgments

- **XGBoost:** The gradient boosting framework powering our predictions
- **FastAPI:** Modern, fast web framework for building APIs
- **Render:** Cloud platform enabling seamless deployment
- **Rwandan Athlete Community:** Inspiration for localized nutrition approach

---

**Built to empower African athletes with accessible, localized recovery science**

*Last Updated: February 2026*