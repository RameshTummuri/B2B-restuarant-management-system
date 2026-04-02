import joblib
import pandas as pd
import numpy as np

class MLService:
    def __init__(self):
        try:
            self.prep_model = joblib.load('prep_model.pkl')
            self.columns = joblib.load('columns.pkl')
            self.demand_model = joblib.load('demand_model.pkl')
            print("✅ All ML models loaded successfully!")
        except Exception as e:
            print(f"❌ Error loading models: {e}")
            raise e

    def predict_prep_time(self, data):
        """
        Data preprocessing for prep time prediction.
        Accepts: distance_km, weather, traffic_level, time_of_day, courier_experience
        """
        # Mapping input to DataFrame
        df = pd.DataFrame([{
            'Distance_km': data['distance_km'],
            'Weather': data['weather'],
            'Traffic_Level': data['traffic_level'],
            'Time_of_Day': data['time_of_day'],
            'Courier_Experience_yrs': data['courier_experience']
        }])
        
        # Convert to dummies - must match training preprocessing
        df_encoded = pd.get_dummies(df)
        
        # Reindex to align with training features
        df_final = df_encoded.reindex(columns=self.columns, fill_value=0)
        
        # Predict
        prediction = self.prep_model.predict(df_final)[0]
        return round(float(prediction), 2)

    def forecast_demand(self, days=7):
        """
        Forecasts demand for the next 'n' days using the loaded ARIMA model.
        """
        forecast = self.demand_model.forecast(steps=days)
        return forecast.tolist()

    def get_historical_demand_trend(self):
        """
        Returns recent historical demand trend for dashboard.
        Dynamically shifts dates to align with the current date (April 2026)
        and filter for the last 4 months as requested.
        """
        df_demand = pd.read_csv("ml/data/daily_food_delivery_orders.csv")
        df_demand['order_date'] = pd.to_datetime(df_demand['order_date'])
        
        # Calculate offset to bring max date to today
        today = pd.to_datetime('2026-04-02')
        max_csv_date = df_demand['order_date'].max()
        time_offset = today - max_csv_date
        
        df_demand['order_date'] = df_demand['order_date'] + time_offset
        
        # Filter for last 120 days (approx. 4 months) to provide a rich trend
        last_4_months = df_demand[df_demand['order_date'] > (today - pd.Timedelta(days=120))]
        daily = last_4_months.groupby('order_date').size()
        
        return {
            "dates": daily.index.strftime('%Y-%m-%d').tolist(),
            "counts": daily.values.tolist()
        }
