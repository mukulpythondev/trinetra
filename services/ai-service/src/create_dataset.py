"""
IMPROVED DATA GENERATOR V2
Fixes:
1. Better distribution (not 50% low)
2. Stronger closed season signal
3. More realistic visitor patterns
4. Reduced missing values impact
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

np.random.seed(42)
random.seed(42)

START_DATE = datetime(2022, 1, 1)
END_DATE = datetime(2024, 12, 31)

MIN_VISITORS = 50
MAX_VISITORS = 12000  # Reduced cap for more realistic distribution
AUTOCORR_STRENGTH = 0.70  # Stronger day-to-day correlation

# Festival data (same as before)
festivals = {
    '2022': [('2022-01-26', 'Republic Day'), ('2022-03-18', 'Holi'), 
             ('2022-04-14', 'Ram Navami'), ('2022-05-16', 'Buddha Purnima'),
             ('2022-08-15', 'Independence Day'), ('2022-08-19', 'Raksha Bandhan'),
             ('2022-10-05', 'Dussehra'), ('2022-10-24', 'Diwali')],
    '2023': [('2023-01-26', 'Republic Day'), ('2023-03-08', 'Holi'),
             ('2023-03-30', 'Ram Navami'), ('2023-05-05', 'Buddha Purnima'),
             ('2023-08-15', 'Independence Day'), ('2023-08-30', 'Raksha Bandhan'),
             ('2023-10-24', 'Dussehra'), ('2023-11-12', 'Diwali')],
    '2024': [('2024-01-26', 'Republic Day'), ('2024-03-25', 'Holi'),
             ('2024-04-17', 'Ram Navami'), ('2024-05-23', 'Buddha Purnima'),
             ('2024-08-15', 'Independence Day'), ('2024-08-19', 'Raksha Bandhan'),
             ('2024-10-12', 'Dussehra'), ('2024-11-01', 'Diwali')]
}

all_festivals = []
for year_festivals in festivals.values():
    for date_str, name in year_festivals:
        all_festivals.append((datetime.strptime(date_str, '%Y-%m-%d'), name))

kedarnath_seasons = {
    2022: (datetime(2022, 5, 6), datetime(2022, 11, 7)),
    2023: (datetime(2023, 4, 25), datetime(2023, 11, 3)),
    2024: (datetime(2024, 5, 10), datetime(2024, 11, 5)),
}

summer_vacations = [
    (datetime(2022, 5, 15), datetime(2022, 6, 30)),
    (datetime(2023, 5, 15), datetime(2023, 6, 30)),
    (datetime(2024, 5, 15), datetime(2024, 6, 30)),
]

winter_vacations = [
    (datetime(2022, 12, 20), datetime(2023, 1, 5)),
    (datetime(2023, 12, 20), datetime(2024, 1, 5)),
    (datetime(2024, 12, 20), datetime(2025, 1, 5)),
]

festival_strength = {
    'Diwali': 1.9, 'Dussehra': 1.7, 'Holi': 1.6, 'Ram Navami': 1.5,
    'Raksha Bandhan': 1.4, 'Buddha Purnima': 1.3, 
    'Independence Day': 1.2, 'Republic Day': 1.15
}

def is_in_vacation(date, vacation_list):
    for start, end in vacation_list:
        if start <= date <= end:
            return 1
    return 0

def days_to_nearest_festival(date, festival_dates):
    differences = [(abs((f[0] - date).days), f[1]) for f in festival_dates]
    differences.sort()
    return differences[0][0], differences[0][1]

def get_yatra_phase(date, year):
    if year not in kedarnath_seasons:
        return 'Closed', 0
    open_date, close_date = kedarnath_seasons[year]
    if date < open_date or date > close_date:
        return 'Closed', 0
    total_days = max((close_date - open_date).days, 1)
    days_from_open = (date - open_date).days
    frac = days_from_open / total_days
    if frac < 0.2:
        return 'Pre-Peak', 1
    elif frac < 0.8:
        return 'Peak', 1
    else:
        return 'Post-Peak', 1

def get_monthly_baseline(month, yatra_phase):
    """IMPROVED: Better distribution of baselines"""
    baselines = {
        1: 150, 2: 200, 3: 1200, 4: 3000,
        5: 6500, 6: 8000, 7: 7500, 8: 7000,
        9: 5500, 10: 4000, 11: 2000, 12: 150
    }
    baseline = baselines.get(month, 500)
    if yatra_phase == 'Closed':
        baseline = min(baseline, 250)
    return baseline

print("="*80)
print("GENERATING IMPROVED DATASET V2")
print("="*80)

date_range = pd.date_range(START_DATE, END_DATE, freq='D')
data = []
visitors_history = []

for idx, date in enumerate(date_range):
    year = date.year
    month = date.month
    day_of_week = date.weekday()
    is_weekend = 1 if day_of_week >= 5 else 0
    
    yatra_phase, yatra_season = get_yatra_phase(date, year)
    base_mean = get_monthly_baseline(month, yatra_phase)
    
    # IMPROVED: Stronger autocorrelation
    if len(visitors_history) > 0:
        prev_day_visitors = visitors_history[-1]
        autocorr_component = prev_day_visitors * AUTOCORR_STRENGTH
        base_mean = base_mean * (1 - AUTOCORR_STRENGTH) + autocorr_component * AUTOCORR_STRENGTH
    
    # Factors (same logic but better tuning)
    weekend_mult = 1.25 if (is_weekend and yatra_phase != 'Closed') else 1.0
    
    is_festival = 0
    festival_name = 'None'
    days_to_festival, nearest_fest = days_to_nearest_festival(date, all_festivals)
    
    festival_mult = 1.0
    for fdate, fname in all_festivals:
        if fdate == date:
            is_festival = 1
            festival_name = fname
            festival_mult = festival_strength.get(fname, 1.5)
            break
    else:
        if days_to_festival <= 3:
            festival_mult = 1.2
        elif days_to_festival <= 7:
            festival_mult = 1.08
    
    is_holiday = 1 if (is_festival or is_weekend) else 0
    holiday_name = festival_name if is_festival else ('Weekend' if is_weekend else 'None')
    
    is_long_weekend = 0
    if is_holiday:
        prev_holiday = ((date - timedelta(days=1)).weekday() >= 5)
        next_holiday = ((date + timedelta(days=1)).weekday() >= 5)
        if prev_holiday or next_holiday:
            is_long_weekend = 1
    long_weekend_mult = 1.15 if is_long_weekend else 1.0
    
    school_vacation = max(is_in_vacation(date, summer_vacations), 
                          is_in_vacation(date, winter_vacations))
    school_mult = 1.3 if (school_vacation and yatra_phase != 'Closed') else 1.0
    
    # Weather (same logic)
    if month in [12, 1, 2]:
        temp_max = np.random.normal(8, 4)
        temp_min = np.random.normal(-1, 3)
        rainfall = np.random.exponential(2) if np.random.random() < 0.25 else 0
        weather_condition = random.choices(
            ['Snowy', 'Foggy', 'Cloudy', 'Sunny'],
            weights=[0.3, 0.2, 0.3, 0.2]
        )[0]
        weather_mult = 0.45 if weather_condition == 'Snowy' else 0.75 if weather_condition == 'Foggy' else 0.88
    elif month in [6, 7, 8]:
        temp_max = np.random.normal(20, 3)
        temp_min = np.random.normal(14, 2)
        rainfall = np.random.exponential(12) if np.random.random() < 0.65 else 0
        weather_condition = random.choices(['Rainy', 'Cloudy', 'Sunny'], weights=[0.55, 0.35, 0.10])[0]
        weather_mult = 0.6 if rainfall > 25 else 0.78 if rainfall > 15 else 0.92
    else:
        temp_max = np.random.normal(18, 4)
        temp_min = np.random.normal(9, 3)
        rainfall = np.random.exponential(4) if np.random.random() < 0.2 else 0
        weather_condition = random.choices(['Rainy', 'Cloudy', 'Sunny'], weights=[0.15, 0.30, 0.55])[0]
        weather_mult = 0.88 if rainfall > 10 else 1.0
    
    temp_avg = (temp_max + temp_min) / 2
    humidity = np.clip(np.random.normal(65, 12), 30, 95)
    
    # Road condition
    if yatra_phase == 'Closed' or weather_condition == 'Snowy':
        road_condition = 'Closed'
        road_mult = 0.35  # Stronger signal
    elif rainfall > 30:
        road_condition = 'Poor'
        road_mult = 0.55
    elif rainfall > 15:
        road_condition = 'Fair'
        road_mult = 0.78
    else:
        road_condition = 'Good'
        road_mult = 1.0
    
    helicopter_service = 1 if (yatra_season == 1 and weather_condition in ['Sunny', 'Cloudy']) else 0
    helicopter_mult = 1.18 if helicopter_service else 1.0
    
    # Combine factors with dampening
    total_mult = weekend_mult * festival_mult * long_weekend_mult * school_mult * weather_mult * road_mult * helicopter_mult
    total_mult = 1 + 0.65 * (total_mult - 1)  # Dampen
    total_mult = np.clip(total_mult, 0.3, 2.3)
    
    expected_visitors = base_mean * total_mult
    
    # Stochastic sampling
    log_mean = np.log(max(expected_visitors, 1))
    log_sigma = 0.22  # Tighter variance
    visitors_sample = np.random.lognormal(log_mean, log_sigma)
    visitors = int(np.clip(visitors_sample, MIN_VISITORS, MAX_VISITORS))
    
    # Small noise
    noise = np.random.normal(1.0, 0.04)
    visitors = int(np.clip(visitors * noise, MIN_VISITORS, MAX_VISITORS))
    
    # Historical features
    visitors_yesterday = visitors_history[-1] if len(visitors_history) > 0 else visitors
    visitors_last_week = visitors_history[-7] if len(visitors_history) >= 7 else visitors
    visitors_avg_7days = int(np.mean(visitors_history[-7:])) if len(visitors_history) >= 7 else visitors
    visitors_avg_30days = int(np.mean(visitors_history[-30:])) if len(visitors_history) >= 30 else visitors
    
    # External indicators
    google_trends = int(np.clip(35 + (visitors / 120) + np.random.normal(0, 7), 5, 100))
    bus_bookings = int(np.clip(visitors * np.random.uniform(0.55, 0.82), 50, visitors))
    hotel_occupancy = float(np.clip(25 + (visitors / 150) + np.random.normal(0, 7), 15, 98))
    parking_utilization = float(np.clip(18 + (visitors / 110) + np.random.normal(0, 5), 10, 95))
    
    active_users_within_500m = int(visitors * np.random.uniform(0.27, 0.37))
    average_users_last_hour = int(active_users_within_500m * np.random.uniform(0.09, 0.16))
    peak_hour_users = int(active_users_within_500m * np.random.uniform(0.27, 0.42))
    
    temple_status = 'Open' if yatra_season == 1 else 'Closed'
    if yatra_phase in ('Pre-Peak', 'Post-Peak'):
        temple_status = 'Limited'
    
    row = {
        'date': date.strftime('%Y-%m-%d'),
        'day_of_week': day_of_week,
        'month': month,
        'is_weekend': is_weekend,
        'week_of_year': date.isocalendar()[1],
        'temperature_max': round(float(temp_max), 1),
        'temperature_min': round(float(temp_min), 1),
        'temperature_avg': round(float(temp_avg), 1),
        'rainfall': round(float(rainfall), 1),
        'humidity': round(float(humidity), 1),
        'weather_condition': weather_condition,
        'is_holiday': is_holiday,
        'holiday_name': holiday_name,
        'is_festival': is_festival,
        'festival_name': festival_name,
        'is_long_weekend': is_long_weekend,
        'days_to_next_festival': days_to_festival,
        'school_vacation': school_vacation,
        'yatra_season': yatra_season,
        'yatra_phase': yatra_phase,
        'temple_open_status': temple_status,
        'helicopter_service_available': helicopter_service,
        'road_condition': road_condition,
        'visitors_yesterday': int(visitors_yesterday),
        'visitors_last_week': int(visitors_last_week),
        'visitors_avg_7days': int(visitors_avg_7days),
        'visitors_avg_30days': int(visitors_avg_30days),
        'active_users_within_500m': int(active_users_within_500m),
        'average_users_last_hour': int(average_users_last_hour),
        'peak_hour_users': int(peak_hour_users),
        'google_trends_score': int(google_trends),
        'bus_bookings': int(bus_bookings),
        'hotel_occupancy_rate': round(float(hotel_occupancy), 1),
        'parking_utilization': round(float(parking_utilization), 1),
        'visitors_today': int(visitors),
        'next_day_visitors': 0
    }
    
    data.append(row)
    visitors_history.append(int(visitors))

df = pd.DataFrame(data)
df['next_day_visitors'] = df['visitors_today'].shift(-1)
df = df[:-1]

print(f"Records: {len(df):,}")
print("\nVisitor Distribution:")
def cat(v):
    if v < 2000: return 'Low'
    elif v < 5000: return 'Medium'
    elif v < 8000: return 'High'
    else: return 'Very High'

for level, count in df['visitors_today'].apply(cat).value_counts().sort_index().items():
    pct = (count / len(df)) * 100
    print(f"   {level:12s}: {pct:5.1f}%")

print(f"\nAutocorrelation (lag-1): {df['visitors_today'].autocorr(lag=1):.3f}")
print(f"Visitor stats: Mean={df['visitors_today'].mean():.0f}, Std={df['visitors_today'].std():.0f}")

df.to_csv('kedarnath_temple_mock_dataset_optimal_v2.csv', index=False)
print(f"\nSaved: kedarnath_temple_mock_dataset_optimal_v2.csv")