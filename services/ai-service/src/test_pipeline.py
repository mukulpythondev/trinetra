"""
COMPLETE TESTING PIPELINE
Run this after generating data and training the model

Steps:
1. Generate optimal dataset
2. Train improved model
3. Test predictions
4. Visualize results
"""

import subprocess
import sys
import os

print("="*80)
print("🧪 MANDIR PRAHARI - COMPLETE TESTING PIPELINE")
print("="*80)
print()

# ============================================================================
# STEP 1: Generate Optimal Dataset
# ============================================================================

print("STEP 1: Generating Optimal Dataset...")
print("-"*80)

# Check if dataset already exists
if os.path.exists('kedarnath_temple_mock_dataset.csv'):
    print("⚠️  Dataset already exists. Skipping generation.")
    print("   Delete the file if you want to regenerate.")
else:
    print("🔄 Running data generation script...")
    # You would run: python optimal_data_generator.py
    print("   Please run the optimal data generator script first!")
    print("   Command: python optimal_data_generator.py")
print()

# ============================================================================
# STEP 2: Quick Data Validation
# ============================================================================

print("STEP 2: Validating Dataset...")
print("-"*80)

import pandas as pd
import numpy as np

try:
    df = pd.read_csv('kedarnath_temple_mock_dataset.csv')
    
    print(f"✅ Dataset loaded: {len(df):,} records")
    print(f"   Date range: {df['date'].min()} to {df['date'].max()}")
    print()
    
    # Check for issues
    print("🔍 Data Quality Checks:")
    
    # 1. Missing values
    missing = df.isnull().sum().sum()
    print(f"   Missing values: {missing} {'✅' if missing < 10 else '⚠️'}")
    
    # 2. Visitor range
    min_v = df['visitors_today'].min()
    max_v = df['visitors_today'].max()
    print(f"   Visitor range: {min_v:,.0f} to {max_v:,.0f} {'✅' if max_v < 20000 else '⚠️'}")
    
    # 3. Autocorrelation
    autocorr = df['visitors_today'].autocorr(lag=1)
    print(f"   Day-to-day correlation: {autocorr:.3f} {'✅' if autocorr > 0.5 else '⚠️'}")
    
    # 4. Crowd distribution
    def categorize(v):
        if v < 2000: return 'Low'
        elif v < 5000: return 'Medium'
        elif v < 8000: return 'High'
        else: return 'Very High'
    
    dist = df['visitors_today'].apply(categorize).value_counts(normalize=True) * 100
    print(f"\n   Crowd Distribution:")
    for level in ['Low', 'Medium', 'High', 'Very High']:
        if level in dist.index:
            pct = dist[level]
            status = '✅' if 15 < pct < 40 else '⚠️' if 10 < pct < 50 else '❌'
            print(f"      {level:12s}: {pct:5.1f}% {status}")
    
    print()
    
except FileNotFoundError:
    print("❌ Dataset not found! Please run optimal data generator first.")
    print("   Command: python optimal_data_generator.py")
    sys.exit(1)

# ============================================================================
# STEP 3: Test Model Training
# ============================================================================

print("STEP 3: Testing Model Training...")
print("-"*80)
print("   This will be done by running the improved model script")
print("   Command: python improved_visitor_model.py")
print()

# ============================================================================
# STEP 4: Test Predictions
# ============================================================================

print("STEP 4: Testing Prediction Function...")
print("-"*80)

try:
    import joblib
    
    # Load artifacts
    model = joblib.load('model_visitor_prediction_best.pkl')
    features = joblib.load('feature_columns_v2.pkl')
    
    print(f"✅ Model loaded successfully")
    print(f"   Features required: {len(features)}")
    print()
    
    # Create a sample prediction input
    print("🧪 Sample Prediction Test:")
    print("-"*40)
    
    # Get a sample from the dataset
    sample_row = df.iloc[-10]  # Use a recent day
    
    # Create input dict (only include features, not targets)
    input_dict = {}
    for col in features:
        if col in sample_row.index:
            input_dict[col] = sample_row[col]
        else:
            input_dict[col] = 0
    
    # Make prediction
    prediction = model.predict(pd.DataFrame([input_dict]))[0]
    prediction = max(int(prediction), 0)
    
    actual = sample_row['next_day_visitors']
    error = abs(prediction - actual)
    error_pct = (error / actual) * 100
    
    print(f"   Date: {sample_row['date']}")
    print(f"   Predicted: {prediction:,} visitors")
    print(f"   Actual: {actual:,.0f} visitors")
    print(f"   Error: ±{error:,.0f} ({error_pct:.1f}%)")
    print(f"   Status: {'✅ Good' if error_pct < 20 else '⚠️ Fair' if error_pct < 30 else '❌ Poor'}")
    print()
    
except FileNotFoundError:
    print("⚠️  Model not trained yet. Please run improved model script first.")
    print("   Command: python improved_visitor_model.py")
    print()

# ============================================================================
# STEP 5: Visualizations
# ============================================================================

print("STEP 5: Creating Visualizations...")
print("-"*80)

try:
    import matplotlib.pyplot as plt
    
    # Create figure with subplots
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle('Kedarnath Visitor Prediction - Model Analysis', fontsize=16, fontweight='bold')
    
    # 1. Time series plot
    axes[0, 0].plot(df['visitors_today'].values[-365:], label='Actual', alpha=0.7)
    axes[0, 0].set_title('Visitor Trend (Last Year)')
    axes[0, 0].set_xlabel('Days')
    axes[0, 0].set_ylabel('Visitors')
    axes[0, 0].legend()
    axes[0, 0].grid(alpha=0.3)
    
    # 2. Distribution histogram
    axes[0, 1].hist(df['visitors_today'], bins=50, edgecolor='black', alpha=0.7)
    axes[0, 1].set_title('Visitor Distribution')
    axes[0, 1].set_xlabel('Daily Visitors')
    axes[0, 1].set_ylabel('Frequency')
    axes[0, 1].grid(alpha=0.3)
    
    # 3. Day of week pattern
    dow_avg = df.groupby('day_of_week')['visitors_today'].mean()
    dow_labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    axes[1, 0].bar(range(7), dow_avg, tick_label=dow_labels, alpha=0.7)
    axes[1, 0].set_title('Average Visitors by Day of Week')
    axes[1, 0].set_ylabel('Average Visitors')
    axes[1, 0].grid(alpha=0.3, axis='y')
    
    # 4. Monthly pattern
    month_avg = df.groupby('month')['visitors_today'].mean()
    month_labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    axes[1, 1].bar(range(1, 13), month_avg, tick_label=month_labels, alpha=0.7)
    axes[1, 1].set_title('Average Visitors by Month')
    axes[1, 1].set_ylabel('Average Visitors')
    axes[1, 1].set_xticklabels(month_labels, rotation=45)
    axes[1, 1].grid(alpha=0.3, axis='y')
    
    plt.tight_layout()
    plt.savefig('visitor_analysis.png', dpi=300, bbox_inches='tight')
    print("✅ Saved: visitor_analysis.png")
    print()
    
except Exception as e:
    print(f"⚠️  Could not create visualizations: {str(e)}")
    print()

# ============================================================================
# FINAL SUMMARY
# ============================================================================

print("="*80)
print("📋 PIPELINE SUMMARY")
print("="*80)
print()
print("✅ Completed Steps:")
print("   1. Dataset validation")
print("   2. Data quality checks")
print("   3. Model testing (if trained)")
print("   4. Sample predictions")
print("   5. Visualizations")
print()
print("📌 Next Steps:")
print("   1. If model not trained yet:")
print("      → Run: python improved_visitor_model.py")
print()
print("   2. For production deployment:")
print("      → Create REST API wrapper")
print("      → Set up monitoring dashboard")
print("      → Integrate with mobile app")
print()
print("   3. For the hackathon presentation:")
print("      → Use visitor_analysis.png for visualizations")
print("      → Highlight accuracy metrics")
print("      → Demonstrate real-time prediction")
print()
print("="*80)