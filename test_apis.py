import requests
import json

base_url = "http://localhost:5000"

def test_endpoint(endpoint, method="GET", data=None):
    url = f"{base_url}{endpoint}"
    print(f"Testing {url} [{method}]...")
    try:
        if method == "GET":
            response = requests.get(url)
        else:
            response = requests.post(url, json=data)
        
        if response.status_code == 200:
            print(f"✅ SUCCESS: {response.json()}")
        else:
            print(f"❌ FAILED [{response.status_code}]: {response.text}")
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    # Test 1: Predict Prep Time
    test_endpoint("/predict/prep-time", "POST", {
        "distance_km": 5.0,
        "weather": "Sunny",
        "traffic_level": "Medium",
        "time_of_day": "Evening",
        "courier_experience": 3
    })

    # Test 2: Forecast Demand
    test_endpoint("/forecast/demand?days=7")

    # Test 3: Menu Optimize
    test_endpoint("/menu/optimize", "POST", {
        "rating": 4.6,
        "popularity": 320
    })

    # Test 4: Inventory Status
    test_endpoint("/inventory/status", "POST", {
        "ingredient": "Paneer",
        "current_stock": 2.0,
        "daily_usage": 3.0,
        "reorder_level": 5.0
    })

    # Test 5: Dashboard KPI
    test_endpoint("/dashboard/kpi")
