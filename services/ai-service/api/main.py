# api/main.py
import pandas as pd
import uvicorn
import numpy as np
from fastapi import FastAPI
import joblib
from sklearn.preprocessing import LabelEncoder

# ==========================
# Load artifacts
# ==========================
try:
    model = joblib.load("./models/model_visitor_prediction_final.pkl")
    print("✓ Model loaded successfully")
except Exception as e:
    print(f"✗ Error loading model: {e}")
    raise e

try:
    feature_columns = joblib.load("./models/feature_columns_final.pkl")
    print("✓ Feature columns loaded successfully")
except Exception as e:
    print(f"✗ Error loading feature columns: {e}")
    raise e

try:
    label_encoders = joblib.load("./models/label_encoders_final.pkl")
    print("✓ Label encoders loaded successfully")
except Exception as e:
    print(f"✗ Error loading label encoders: {e}")
    # fallback to empty dict if not needed
    label_encoders = {}

# ==========================
# Post-processing rules
# ==========================
def apply_post_processing_rules(prediction, metadata):
    """
    Apply intelligent rules based on temple status and conditions
    """
    processed = prediction
    rules_applied = []
    
    yatra_season = metadata.get('yatra_season', 1)
    temple_status = metadata.get('temple_open_status', 'Open')
    road_condition = metadata.get('road_condition', 'Good')
    weather = metadata.get('weather_condition', 'Clear')
    month = metadata.get('month', 6)
    extreme_weather = metadata.get('extreme_weather', 0)
    
    # Rule 1: Temple completely closed
    if yatra_season == 0:
        if month in [12, 1, 2]:  # Deep winter
            processed = min(processed, 150)
            rules_applied.append("Winter closure cap")
        else:
            processed = min(processed, 300)
            rules_applied.append("Regular closure cap")
    
    # Rule 2: Temple open but road closed
    if road_condition == 'Closed':
        processed = min(processed, 500)
        rules_applied.append("Road closure cap")
    
    # Rule 3: Extreme weather
    if extreme_weather == 1:
        processed = processed * 0.7
        rules_applied.append("Extreme weather reduction")
    
    # Rule 4: Heavy snow/rain
    if weather in ['Snowy', 'Heavy Rain']:
        processed = processed * 0.6
        rules_applied.append("Severe weather reduction")
    
    # Rule 5: Temple open - enforce minimum
    if yatra_season == 1:
        processed = max(processed, 100)
        rules_applied.append("Minimum visitors floor")
    
    # Rule 6: General floor
    processed = max(processed, 50)
    
    return int(processed), rules_applied

# ==========================
# FastAPI app
# ==========================
app = FastAPI(title="Trinetra - Kedarnath Crowd Prediction API")

@app.get("/")
def root():
    return {
        "message": "🚀 Trinetra AI - Kedarnath Crowd Prediction API is running!",
        "version": "1.0",
        "model": "Production Model with Post-Processing Rules"
    }

@app.post("/predict")
def predict(input_data: dict):
    """
    Expects input_data as JSON with required features
    """
    try:
        # Create DataFrame from input
        df = pd.DataFrame([input_data])
        
        # Apply label encoders
        for col, le in label_encoders.items():
            if col in df.columns:
                try:
                    df[col + '_encoded'] = le.transform(df[col].astype(str))
                except Exception:
                    pass

        # Align columns with training features
        df = df.reindex(columns=feature_columns, fill_value=0)
        
        # Get raw prediction
        raw_prediction = float(model.predict(df)[0])
        
        # Apply post-processing rules
        processed_prediction, rules_applied = apply_post_processing_rules(
            raw_prediction,
            input_data
        )
        
        # Calculate confidence interval
        lower_bound = int(processed_prediction * 0.85)
        upper_bound = int(processed_prediction * 1.15)
        
        # Determine crowd level
        if processed_prediction < 2000:
            crowd_level = "Low"
        elif processed_prediction < 5000:
            crowd_level = "Medium"
        elif processed_prediction < 8000:
            crowd_level = "High"
        else:
            crowd_level = "Very High"
        
        return {
            "status": "success",
            "predicted_visitors": processed_prediction,
            "raw_prediction": int(raw_prediction),
            "confidence_interval": {
                "lower": lower_bound,
                "upper": upper_bound
            },
            "crowd_level": crowd_level,
            "rules_applied": rules_applied
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Prediction failed"
        }

# ==========================
# Run with uvicorn
# ==========================
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
