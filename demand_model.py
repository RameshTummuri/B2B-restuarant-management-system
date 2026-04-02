import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_percentage_error
import joblib

# Load dataset
df = pd.read_csv("ml/data/daily_food_delivery_orders.csv")

# Convert date column
df['order_date'] = pd.to_datetime(df['order_date'])

# Count number of orders per day
daily_orders = df.groupby('order_date').size()

# Sort by date
daily_orders = daily_orders.sort_index()

# Train-test split
train_size = int(len(daily_orders) * 0.8)
train, test = daily_orders[:train_size], daily_orders[train_size:]

# Train ARIMA model
model = ARIMA(train, order=(5,1,0))
model_fit = model.fit()

# Forecast
forecast = model_fit.forecast(steps=len(test))

# Evaluate
mape = mean_absolute_percentage_error(test, forecast)

print("MAPE:", mape)

# Save model
joblib.dump(model_fit, "demand_model.pkl")

print("✅ Demand model trained and saved!")