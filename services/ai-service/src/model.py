"""
MANDIR PRAHARI - FINAL PRODUCTION MODEL
Enhanced with post-processing rules for closed season handling

This version adds intelligent rules to handle edge cases:
1. Caps predictions when temple is closed
2. Applies minimum thresholds for open season
3. Handles extreme weather conditions
4. Better boundary detection
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import LabelEncoder
import joblib
import warnings
warnings.filterwarnings('ignore')

print("="*80)
print("🛡️  MANDIR PRAHARI - FINAL PRODUCTION MODEL")
print("     With Closed Season Handling & Post-Processing Rules")
print("="*80)
print()

# ============================================================================
# STEP 1: LOAD DATA
# ============================================================================

print("📂 STEP 1: Loading Dataset...")
print("-" * 80)

try:
    df = pd.read_csv('./data/kedarnath_temple_mock_dataset.csv')
    print("✅ Loaded V2 dataset")
except:
    df = pd.read_csv('../data/kedarnath_temple_mock_dataset.csv')
    print("✅ Loaded V1 dataset")

df['date'] = pd.to_datetime(df['date'])
df = df.sort_values('date').reset_index(drop=True)

print(f"   Total records: {len(df):,}")
print(f"   Date range: {df['date'].min().date()} to {df['date'].max().date()}")
print()

# ============================================================================
# STEP 2: FEATURE ENGINEERING (Same as before)
# ============================================================================

print("⚙️  STEP 2: Advanced Feature Engineering...")
print("-" * 80)

# Encode categorical
categorical_columns = ['weather_condition', 'yatra_phase', 'temple_open_status', 'road_condition']
label_encoders = {}

for col in categorical_columns:
    if col in df.columns:
        le = LabelEncoder()
        df[col + '_encoded'] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le

# Time features
df['day_of_month'] = df['date'].dt.day
df['quarter'] = df['date'].dt.quarter
df['is_month_start'] = (df['date'].dt.day <= 7).astype(int)
df['is_month_end'] = (df['date'].dt.day >= 24).astype(int)

# Cyclical encoding
df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
df['day_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
df['day_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
df['week_sin'] = np.sin(2 * np.pi * df['week_of_year'] / 52)
df['week_cos'] = np.cos(2 * np.pi * df['week_of_year'] / 52)

# Weather interactions
df['temp_humidity_interaction'] = df['temperature_avg'] * df['humidity'] / 100
df['rainfall_temp'] = df['rainfall'] * df['temperature_avg']
df['extreme_weather'] = ((df['rainfall'] > 50) | (df['temperature_avg'] < 5)).astype(int)

# Calendar interactions
df['weekend_festival'] = df['is_weekend'] * df['is_festival']
df['holiday_weekend'] = df['is_holiday'] * df['is_weekend']
df['weekend_vacation'] = df['is_weekend'] * df['school_vacation']
df['peak_weekend'] = df['is_weekend'] * df['yatra_season']

# Season tracking
df['days_since_season_start'] = 0
season_changes = df['yatra_season'].ne(df['yatra_season'].shift()).cumsum()
for season_id in season_changes.unique():
    mask = season_changes == season_id
    if mask.sum() > 0:
        df.loc[mask, 'days_since_season_start'] = range(mask.sum())

# Lag features
for lag in [1, 2, 3, 7, 14]:
    df[f'visitors_lag_{lag}'] = df['visitors_today'].shift(lag)

# Rolling features
for window in [3, 7, 14, 30]:
    df[f'visitors_rolling_mean_{window}'] = df['visitors_today'].shift(1).rolling(window=window, min_periods=1).mean()
    df[f'visitors_rolling_std_{window}'] = df['visitors_today'].shift(1).rolling(window=window, min_periods=1).std().fillna(0)
    df[f'visitors_rolling_max_{window}'] = df['visitors_today'].shift(1).rolling(window=window, min_periods=1).max()
    df[f'visitors_rolling_min_{window}'] = df['visitors_today'].shift(1).rolling(window=window, min_periods=1).min()

# Trend features
df['visitor_trend_7d'] = df['visitors_today'].shift(1).rolling(7, min_periods=2).apply(
    lambda x: np.polyfit(range(len(x)), x, 1)[0] if len(x) > 1 else 0, raw=True
)
df['visitor_momentum'] = df['visitors_today'].shift(1) - df['visitors_today'].shift(8)

# EWM features
df['visitors_ewm_7'] = df['visitors_today'].shift(1).ewm(span=7, adjust=False).mean()
df['visitors_ewm_30'] = df['visitors_today'].shift(1).ewm(span=30, adjust=False).mean()

# Historical patterns
df['dow_avg_visitors'] = df.groupby('day_of_week')['visitors_today'].transform(
    lambda x: x.shift(1).expanding().mean()
)
df['month_avg_visitors'] = df.groupby('month')['visitors_today'].transform(
    lambda x: x.shift(1).expanding().mean()
)

# External interactions
df['occupancy_booking_ratio'] = df['hotel_occupancy_rate'] / (df['bus_bookings'] + 1)
df['demand_pressure'] = (df['google_trends_score'] * df['bus_bookings']) / 1000
df['festival_within_3days'] = (df['days_to_next_festival'] <= 3).astype(int)
df['festival_within_week'] = (df['days_to_next_festival'] <= 7).astype(int)

print(f"✅ Feature engineering complete!")
print(f"   Total features created: {df.shape[1]}")
print()

# ============================================================================
# STEP 3: FEATURE SELECTION
# ============================================================================

print("🎯 STEP 3: Selecting Features...")
print("-" * 80)

exclude_features = [
    'date', 'visitors_today', 'next_day_visitors',
    'visitors_yesterday', 'visitors_last_week', 'visitors_avg_7days', 'visitors_avg_30days',
    'weather_condition', 'yatra_phase', 'temple_open_status', 'road_condition',
    'holiday_name', 'festival_name'
]

feature_columns = [col for col in df.columns if col not in exclude_features]
feature_columns = [col for col in feature_columns if df[col].dtype in ['int64', 'float64', 'int32', 'float32']]

print(f"✅ Selected {len(feature_columns)} features for modeling")
print()

# ============================================================================
# STEP 4: PREPARE DATA
# ============================================================================

print("📊 STEP 4: Preparing Data for Training...")
print("-" * 80)

df_clean = df.dropna(subset=['next_day_visitors'])
X = df_clean[feature_columns].copy()
y = df_clean['next_day_visitors'].copy()
dates = df_clean['date'].copy()

# Store metadata for post-processing
metadata = df_clean[['yatra_season', 'temple_open_status', 'road_condition', 
                      'weather_condition', 'month', 'extreme_weather']].copy()

# Fill NaN
for col in X.columns:
    if X[col].isna().any():
        X[col] = X[col].fillna(X[col].median())

# Time-based split
split_index = int(len(X) * 0.8)

X_train = X[:split_index]
X_test = X[split_index:]
y_train = y[:split_index]
y_test = y[split_index:]
dates_train = dates[:split_index]
dates_test = dates[split_index:]
metadata_test = metadata[split_index:]

print(f"✅ Data cleaned")
print(f"   Training set: {len(X_train):,} samples ({dates_train.min().date()} to {dates_train.max().date()})")
print(f"   Testing set:  {len(X_test):,} samples ({dates_test.min().date()} to {dates_test.max().date()})")
print()

# ============================================================================
# STEP 5: TRAIN MODELS
# ============================================================================

print("🚀 STEP 5: Training Multiple Models...")
print("-" * 80)

models = {
    'XGBoost': XGBRegressor(
        n_estimators=200, learning_rate=0.05, max_depth=6,
        min_child_weight=3, subsample=0.8, colsample_bytree=0.8,
        reg_alpha=0.1, reg_lambda=1, random_state=42, n_jobs=-1
    ),
    'GradientBoosting': GradientBoostingRegressor(
        n_estimators=150, learning_rate=0.05, max_depth=5,
        min_samples_split=10, min_samples_leaf=5, subsample=0.8, random_state=42
    ),
    'RandomForest': RandomForestRegressor(
        n_estimators=150, max_depth=15, min_samples_split=10,
        min_samples_leaf=5, max_features='sqrt', random_state=42, n_jobs=-1
    )
}

results = {}

for name, model in models.items():
    print(f"\n🔹 Training {name}...")
    model.fit(X_train, y_train)
    
    y_pred_train = model.predict(X_train)
    y_pred_test_raw = model.predict(X_test)
    
    # Store raw predictions
    results[name] = {
        'model': model,
        'predictions_raw': y_pred_test_raw.copy()
    }

# ============================================================================
# STEP 6: POST-PROCESSING RULES (KEY IMPROVEMENT)
# ============================================================================

print("\n" + "="*80)
print("🔧 STEP 6: Applying Post-Processing Rules...")
print("="*80)

def apply_post_processing_rules(predictions, metadata_df):
    """
    Apply intelligent rules based on temple status and conditions
    
    Rules:
    1. If temple closed (yatra_season=0) → cap at 300 visitors
    2. If temple open but road closed → cap at 500 visitors
    3. If extreme weather → reduce by 30%
    4. If temple open and good conditions → minimum 100 visitors
    5. Winter months (Dec-Feb) and closed → cap at 150 visitors
    """
    processed = predictions.copy()
    
    for idx in range(len(processed)):
        pred = processed[idx]
        
        yatra_season = metadata_df.iloc[idx]['yatra_season']
        temple_status = metadata_df.iloc[idx]['temple_open_status']
        road_status = metadata_df.iloc[idx]['road_condition']
        weather = metadata_df.iloc[idx]['weather_condition']
        month = metadata_df.iloc[idx]['month']
        extreme = metadata_df.iloc[idx]['extreme_weather']
        
        # Rule 1: Temple completely closed
        if yatra_season == 0:
            if month in [12, 1, 2]:  # Deep winter
                processed[idx] = min(pred, 150)
            else:
                processed[idx] = min(pred, 300)
        
        # Rule 2: Temple open but road closed
        elif road_status == 'Closed':
            processed[idx] = min(pred, 500)
        
        # Rule 3: Extreme weather
        elif extreme == 1:
            processed[idx] = pred * 0.7
        
        # Rule 4: Heavy snow/rain
        elif weather in ['Snowy', 'Heavy Rain']:
            processed[idx] = pred * 0.6
        
        # Rule 5: Temple open - enforce minimum
        elif yatra_season == 1:
            processed[idx] = max(pred, 100)
        
        # Rule 6: General floor
        processed[idx] = max(processed[idx], 50)
    
    return processed

print("Applying rules to all model predictions...")

for name in results.keys():
    raw_preds = results[name]['predictions_raw']
    processed_preds = apply_post_processing_rules(raw_preds, metadata_test)
    results[name]['predictions_processed'] = processed_preds
    
    # Calculate metrics
    mae_raw = mean_absolute_error(y_test, raw_preds)
    mae_processed = mean_absolute_error(y_test, processed_preds)
    
    r2_raw = r2_score(y_test, raw_preds)
    r2_processed = r2_score(y_test, processed_preds)
    
    mape_raw = np.mean(np.abs((y_test - raw_preds) / (y_test + 1))) * 100
    mape_processed = np.mean(np.abs((y_test - processed_preds) / (y_test + 1))) * 100
    
    results[name]['metrics'] = {
        'mae_raw': mae_raw,
        'mae_processed': mae_processed,
        'r2_raw': r2_raw,
        'r2_processed': r2_processed,
        'mape_raw': mape_raw,
        'mape_processed': mape_processed
    }
    
    print(f"\n{name}:")
    print(f"   Raw MAE: {mae_raw:.2f} | Processed MAE: {mae_processed:.2f}")
    print(f"   Raw MAPE: {mape_raw:.2f}% | Processed MAPE: {mape_processed:.2f}%")
    print(f"   Improvement: {((mae_raw - mae_processed) / mae_raw * 100):.1f}%")

# ============================================================================
# STEP 7: COMPARISON TABLE
# ============================================================================

print("\n" + "="*80)
print("📊 FINAL MODEL COMPARISON (With Post-Processing)")
print("="*80)
print(f"{'Model':<20} {'MAE (Raw)':<12} {'MAE (Proc)':<12} {'MAPE (Proc)':<12} {'R² (Proc)':<10}")
print("-"*80)

for name, res in results.items():
    m = res['metrics']
    print(f"{name:<20} {m['mae_raw']:<12.2f} {m['mae_processed']:<12.2f} {m['mape_processed']:<12.2f} {m['r2_processed']:<10.4f}")

print("="*80)

# Select best model
best_model_name = min(results, key=lambda x: results[x]['metrics']['mae_processed'])
best_model = results[best_model_name]['model']
best_mae = results[best_model_name]['metrics']['mae_processed']
best_mape = results[best_model_name]['metrics']['mape_processed']
best_r2 = results[best_model_name]['metrics']['r2_processed']

print(f"\n🏆 Best Model: {best_model_name}")
print(f"   MAE: ±{best_mae:.0f} visitors")
print(f"   MAPE: {best_mape:.2f}%")
print(f"   Accuracy: {100 - best_mape:.1f}%")
print(f"   R² Score: {best_r2:.4f}")
print()

# ============================================================================
# STEP 8: CLOSED VS OPEN SEASON BREAKDOWN
# ============================================================================

print("="*80)
print("📊 Performance Breakdown by Season")
print("="*80)

open_mask = metadata_test['yatra_season'] == 1
closed_mask = metadata_test['yatra_season'] == 0

if closed_mask.sum() > 0 and open_mask.sum() > 0:
    best_preds = results[best_model_name]['predictions_processed']
    
    # Open season
    y_test_open = y_test[open_mask]
    y_pred_open = best_preds[open_mask]
    mae_open = mean_absolute_error(y_test_open, y_pred_open)
    mape_open = np.mean(np.abs((y_test_open - y_pred_open) / (y_test_open + 1))) * 100
    
    # Closed season
    y_test_closed = y_test[closed_mask]
    y_pred_closed = best_preds[closed_mask]
    mae_closed = mean_absolute_error(y_test_closed, y_pred_closed)
    mape_closed = np.mean(np.abs((y_test_closed - y_pred_closed) / (y_test_closed + 1))) * 100
    
    print(f"\nOpen Season ({open_mask.sum()} days):")
    print(f"   MAE: ±{mae_open:.2f} visitors")
    print(f"   MAPE: {mape_open:.2f}%")
    print(f"   Avg actual visitors: {y_test_open.mean():.0f}")
    
    print(f"\nClosed Season ({closed_mask.sum()} days):")
    print(f"   MAE: ±{mae_closed:.2f} visitors")
    print(f"   MAPE: {mape_closed:.2f}%")
    print(f"   Avg actual visitors: {y_test_closed.mean():.0f}")
    print()

# ============================================================================
# STEP 9: SAVE MODELS
# ============================================================================

print("💾 STEP 9: Saving Models and Artifacts...")
print("-" * 80)

joblib.dump(best_model, 'model_visitor_prediction_final.pkl')
joblib.dump(feature_columns, 'feature_columns_final.pkl')
joblib.dump(label_encoders, 'label_encoders_final.pkl')

print(f"✅ Saved: model_visitor_prediction_final.pkl ({best_model_name})")
print(f"✅ Saved: feature_columns_final.pkl")
print(f"✅ Saved: label_encoders_final.pkl")
print()

# ============================================================================
# STEP 10: PRODUCTION PREDICTION FUNCTION
# ============================================================================

print("🔮 STEP 10: Creating Production Prediction Function...")
print("-" * 80)

def predict_next_day_visitors_with_rules(input_features_dict):
    """
    Production-ready prediction with post-processing rules
    
    Parameters:
    -----------
    input_features_dict : dict
        Must include: yatra_season, temple_open_status, road_condition,
                     weather_condition, month, extreme_weather
    
    Returns:
    --------
    dict with: predicted_visitors, confidence_interval, crowd_level, 
               rules_applied, model_used
    """
    model = joblib.load('model_visitor_prediction_final.pkl')
    features = joblib.load('feature_columns_final.pkl')
    
    # Create feature vector
    feature_vector = [input_features_dict.get(col, 0) for col in features]
    X = np.array(feature_vector).reshape(1, -1)
    
    # Get raw prediction
    prediction_raw = model.predict(X)[0]
    
    # Extract metadata for rules
    yatra_season = input_features_dict.get('yatra_season', 1)
    temple_status = input_features_dict.get('temple_open_status_encoded', 0)
    road_condition = input_features_dict.get('road_condition', 'Good')
    weather_condition = input_features_dict.get('weather_condition', 'Sunny')
    month = input_features_dict.get('month', 6)
    extreme_weather = input_features_dict.get('extreme_weather', 0)
    
    # Apply rules
    prediction = prediction_raw
    rules_applied = []
    
    if yatra_season == 0:
        if month in [12, 1, 2]:
            prediction = min(prediction, 150)
            rules_applied.append("Temple closed (winter) - capped at 150")
        else:
            prediction = min(prediction, 300)
            rules_applied.append("Temple closed - capped at 300")
    elif road_condition == 'Closed':
        prediction = min(prediction, 500)
        rules_applied.append("Road closed - capped at 500")
    elif extreme_weather == 1:
        prediction = prediction * 0.7
        rules_applied.append("Extreme weather - reduced 30%")
    elif weather_condition in ['Snowy', 'Heavy Rain']:
        prediction = prediction * 0.6
        rules_applied.append("Heavy weather - reduced 40%")
    elif yatra_season == 1:
        prediction = max(prediction, 100)
        rules_applied.append("Temple open - minimum 100")
    
    prediction = max(int(prediction), 50)
    
    # Confidence interval
    lower = int(prediction * 0.85)
    upper = int(prediction * 1.15)
    
    # Crowd level
    if prediction < 2000:
        crowd_level = "Low"
    elif prediction < 5000:
        crowd_level = "Medium"
    elif prediction < 8000:
        crowd_level = "High"
    else:
        crowd_level = "Very High"
    
    return {
        'predicted_visitors': prediction,
        'prediction_raw': int(prediction_raw),
        'confidence_interval': (lower, upper),
        'crowd_level': crowd_level,
        'rules_applied': rules_applied,
        'model_used': best_model_name
    }

print("✅ Production function created with rule-based post-processing!")
print()

# ============================================================================
# FINAL SUMMARY
# ============================================================================

print("="*80)
print("🎉 FINAL PRODUCTION MODEL COMPLETE!")
print("="*80)
print()
print("📊 Model Performance (With Post-Processing):")
print(f"   Best Model: {best_model_name}")
print(f"   MAE: ±{best_mae:.0f} visitors")
print(f"   MAPE: {best_mape:.1f}%")
print(f"   Accuracy: {100 - best_mape:.1f}%")
print(f"   R² Score: {best_r2:.4f}")
print()
print("✅ Key Features:")
print("   • Post-processing rules for closed season")
print("   • Handles extreme weather")
print("   • Minimum/maximum bounds enforced")
print("   • Separate logic for winter months")
print()
print("📦 Saved Files:")
print("   • model_visitor_prediction_final.pkl")
print("   • feature_columns_final.pkl")
print("   • label_encoders_final.pkl")
print()
print("🚀 Ready for deployment!")
print("="*80)