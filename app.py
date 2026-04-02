from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime

from ml_service import MLService
from menu_service import MenuService
from inventory_service import InventoryService
from order_service import OrderService

app = Flask(__name__)
CORS(app)

# --- SERVICES ---
ml_service = MLService()
menu_service = MenuService()
inventory_service = InventoryService()
order_service = OrderService(ml_service)

# --- AUTHENTICATION ---
@app.route('/login', methods=['POST'])
def login():
    """Hardcoded admin login for demo."""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if username == "admin" and password == "admin123":
        return jsonify({
            "success": True, 
            "token": "demo-admin-token-12345", 
            "user": {"name": "Admin", "role": "Full-Access"}
        })
    else:
        return jsonify({"success": False, "message": "Invalid username or password"}), 401

# --- ORDER MANAGEMENT APIs ---
@app.route('/orders/create', methods=['POST'])
def create_order():
    """Real order creation from frontend form."""
    data = request.get_json()
    try:
        # data format example: { table_number: 1, items: [{name: "Paneer", quantity: 2}] }
        order = order_service.create_order(
            table_number=data.get('table_number'),
            items=data.get('items', []),
            weather=data.get('weather', 'Sunny'),
            traffic=data.get('traffic', 'Medium'),
            time_of_day=data.get('time_of_day', 'Evening'),
            courier_exp=data.get('courier_experience', 5)
        )
        return jsonify(order)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/orders', methods=['GET'])
def get_orders():
    """Retrieves all real orders, optionally filtered by date."""
    date_filter = request.args.get('date') # YYYY-MM-DD
    return jsonify(order_service.get_orders(date_filter))

@app.route('/orders/update-status', methods=['PUT'])
def update_order_status():
    """Manual status update (Queued -> Preparing -> Ready -> Served)"""
    data = request.get_json()
    order = order_service.update_order_status(data.get('order_id'), data.get('status'))
    if order:
        return jsonify(order)
    return jsonify({"error": "Order not found"}), 404

# --- ANALYTICS & DASHBOARD ---
@app.route('/dashboard/kpi', methods=['GET'])
def dashboard_kpi():
    """Retrieves live KPIs based on actual user-created orders."""
    try:
        current_kpis = order_service.get_kpis()
        historical_trend = ml_service.get_historical_demand_trend()
        inventory_alerts = inventory_service.get_all_inventory_alerts()
        
        return jsonify({
            "total_active": current_kpis["total_active"],
            "avg_prep_time": current_kpis["avg_prep_time"],
            "completion_rate": current_kpis["completion_rate"],
            "kitchen_load": current_kpis["kitchen_load"],
            "total_revenue": current_kpis["total_revenue"],
            "demand_trend": historical_trend,
            "inventory_alerts": inventory_alerts
        })
    except Exception as e:
        print("KPI ERROR:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/forecast/demand', methods=['GET'])
def forecast_demand():
    """ML Forecasting for demand (Next 7 days)."""
    days = int(request.args.get('days', 7))
    return jsonify({"forecast": ml_service.forecast_demand(days)})

# Original APIs kept for specific system modules
@app.route('/menu/optimize', methods=['POST'])
def menu_optimize():
    data = request.get_json()
    category = menu_service.optimize_menu(float(data.get('rating', 0)), int(data.get('popularity', 0)))
    return jsonify({"performance_category": category})

@app.route('/inventory/status', methods=['POST'])
def inventory_status():
    data = request.get_json()
    return jsonify(inventory_service.get_inventory_status(
        data.get('ingredient', 'Unknown'), 
        float(data.get('current_stock', 0)), 
        float(data.get('daily_usage', 1)), 
        float(data.get('reorder_level', 5))
    ))

if __name__ == '__main__':
    print("🚀 B2B RESTAURANT CORE ACTIVATED (Direct Action Mode)")
    app.run(host='0.0.0.0', port=5000, debug=False)