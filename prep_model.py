import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib

# Load dataset
df = pd.read_csv("ml/data/Food_Delivery_Times.csv")

# Select required columns
df = df[[
    "Distance_km",
    "Weather",
    "Traffic_Level",
    "Time_of_Day",
    "Courier_Experience_yrs",
    "Preparation_Time_min"
]]

# Drop missing values
df = df.dropna()

# Convert categorical columns
df = pd.get_dummies(df, drop_first=True)

# Split features & target
X = df.drop("Preparation_Time_min", axis=1)
y = df["Preparation_Time_min"]

# 🔥 SAVE FEATURE COLUMNS
feature_columns = X.columns
joblib.dump(feature_columns, "columns.pkl")

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Linear Regression
lr = LinearRegression()
lr.fit(X_train, y_train)
lr_pred = lr.predict(X_test)

print("Linear MAE:", mean_absolute_error(y_test, lr_pred))
print("Linear RMSE:", mean_squared_error(y_test, lr_pred) ** 0.5)

# XGBoost (optional tuned)
xgb_model = xgb.XGBRegressor(
    n_estimators=50,
    max_depth=3,
    learning_rate=0.1
)

xgb_model.fit(X_train, y_train)
xgb_pred = xgb_model.predict(X_test)

print("XGBoost MAE:", mean_absolute_error(y_test, xgb_pred))
print("XGBoost RMSE:", mean_squared_error(y_test, xgb_pred) ** 0.5)

# ✅ Save BEST model (Linear)
joblib.dump(lr, "prep_model.pkl")

print("✅ Model + columns saved!")