import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
# Set style
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

# Load data
df = pd.read_csv('kedarnath_temple_mock_dataset.csv')
df['date'] = pd.to_datetime(df['date'])

# Create visualization dashboard
fig = plt.figure(figsize=(18, 12))

# 1. Daily visitors over time
ax1 = plt.subplot(3, 3, 1)
plt.plot(df['date'], df['visitors_today'], linewidth=0.8, alpha=0.7)
plt.title('Daily Visitor Count (3 Years)', fontsize=12, fontweight='bold')
plt.xlabel('Date')
plt.ylabel('Visitors')
plt.xticks(rotation=45)
plt.grid(True, alpha=0.3)

# 2. Monthly average visitors
ax2 = plt.subplot(3, 3, 2)
monthly_avg = df.groupby('month')['visitors_today'].mean()
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
plt.bar(range(1, 13), monthly_avg.values, color='steelblue', edgecolor='black')
plt.title('Average Visitors by Month', fontsize=12, fontweight='bold')
plt.xlabel('Month')
plt.ylabel('Average Visitors')
plt.xticks(range(1, 13), months, rotation=45)
plt.grid(True, alpha=0.3, axis='y')

# 3. Weekend vs Weekday
ax3 = plt.subplot(3, 3, 3)
weekend_data = df.groupby('is_weekend')['visitors_today'].mean()
plt.bar(['Weekday', 'Weekend'], weekend_data.values, color=['coral', 'lightgreen'], edgecolor='black')
plt.title('Weekday vs Weekend Visitors', fontsize=12, fontweight='bold')
plt.ylabel('Average Visitors')
plt.grid(True, alpha=0.3, axis='y')

# 4. Weather condition impact
ax4 = plt.subplot(3, 3, 4)
weather_avg = df.groupby('weather_condition')['visitors_today'].mean().sort_values()
plt.barh(weather_avg.index, weather_avg.values, color='skyblue', edgecolor='black')
plt.title('Impact of Weather Conditions', fontsize=12, fontweight='bold')
plt.xlabel('Average Visitors')
plt.grid(True, alpha=0.3, axis='x')

# 5. Festival impact
ax5 = plt.subplot(3, 3, 5)
festival_data = df.groupby('is_festival')['visitors_today'].mean()
plt.bar(['Regular Day', 'Festival'], festival_data.values, color=['lightcoral', 'gold'], edgecolor='black')
plt.title('Festival vs Regular Day', fontsize=12, fontweight='bold')
plt.ylabel('Average Visitors')
plt.grid(True, alpha=0.3, axis='y')

# 6. Yatra phase distribution
ax6 = plt.subplot(3, 3, 6)
phase_avg = df.groupby('yatra_phase')['visitors_today'].mean()
plt.bar(phase_avg.index, phase_avg.values, color='mediumpurple', edgecolor='black')
plt.title('Visitors by Yatra Phase', fontsize=12, fontweight='bold')
plt.ylabel('Average Visitors')
plt.xticks(rotation=45)
plt.grid(True, alpha=0.3, axis='y')

# 7. Temperature vs Visitors scatter
ax7 = plt.subplot(3, 3, 7)
plt.scatter(df['temperature_avg'], df['visitors_today'], alpha=0.3, s=10, color='orangered')
plt.title('Temperature vs Visitors', fontsize=12, fontweight='bold')
plt.xlabel('Average Temperature (°C)')
plt.ylabel('Visitors')
plt.grid(True, alpha=0.3)

# 8. Rainfall impact
ax8 = plt.subplot(3, 3, 8)
rainfall_bins = pd.cut(df['rainfall'], bins=[0, 5, 20, 50, 100], labels=['No Rain', 'Light', 'Moderate', 'Heavy'])
rainfall_impact = df.groupby(rainfall_bins)['visitors_today'].mean()
plt.bar(rainfall_impact.index, rainfall_impact.values, color='steelblue', edgecolor='black')
plt.title('Rainfall Impact on Visitors', fontsize=12, fontweight='bold')
plt.ylabel('Average Visitors')
plt.xticks(rotation=45)
plt.grid(True, alpha=0.3, axis='y')

# 9. Visitor distribution histogram
ax9 = plt.subplot(3, 3, 9)
plt.hist(df['visitors_today'], bins=50, color='seagreen', edgecolor='black', alpha=0.7)
plt.title('Visitor Count Distribution', fontsize=12, fontweight='bold')
plt.xlabel('Number of Visitors')
plt.ylabel('Frequency (Days)')
plt.grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.savefig('kedarnath_dataset_analysis.png', dpi=300, bbox_inches='tight')
plt.show()

print("✅ Visualization saved as 'kedarnath_dataset_analysis.png'")