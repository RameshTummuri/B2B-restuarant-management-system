import sqlite3
import json
from datetime import datetime

class OrderService:
    def __init__(self, ml_service, db_path='restaurant.db'):
        self.ml_service = ml_service
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Initializes the SQLite database schema if it doesn't exist."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create Orders Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                order_id TEXT PRIMARY KEY,
                table_number INTEGER,
                status TEXT,
                predicted_prep_time REAL,
                order_time TEXT,
                created_at TEXT
            )
        ''')
        
        # Create Items Table (One-to-Many)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT,
                item_name TEXT,
                quantity INTEGER,
                FOREIGN KEY (order_id) REFERENCES orders (order_id)
            )
        ''')
        
        conn.commit()
        conn.close()

    def create_order(self, table_number, items, weather="Sunny", traffic="Medium", time_of_day="Evening", courier_exp=3):
        """
        Creates a persistent order and saves to SQLite.
        """
        # ML Prediction logic (remains the same)
        input_data = {
            "distance_km": 0.1, 
            "weather": weather,
            "traffic_level": traffic,
            "time_of_day": time_of_day,
            "courier_experience": courier_exp
        }
        predicted_time = self.ml_service.predict_prep_time(input_data)
        
        order_id = datetime.now().strftime("%H%M%S%f")[:8].upper()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        today_str = datetime.now().strftime("%Y-%m-%d")

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Insert Order
            cursor.execute('''
                INSERT INTO orders (order_id, table_number, status, predicted_prep_time, order_time, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (order_id, int(table_number), "Queued", predicted_time, now_str, today_str))
            
            # Insert Items
            for item in items:
                cursor.execute('''
                    INSERT INTO order_items (order_id, item_name, quantity)
                    VALUES (?, ?, ?)
                ''', (order_id, item.get('name'), int(item.get('quantity', 1))))
            
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

        # Return full object for frontend
        return {
            "order_id": order_id,
            "table_number": int(table_number),
            "items": items,
            "status": "Queued",
            "predicted_prep_time": predicted_time,
            "order_time": now_str
        }

    def get_orders(self, date_filter=None):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        if date_filter:
            cursor.execute('SELECT * FROM orders WHERE created_at = ?', (date_filter,))
        else:
            cursor.execute('SELECT * FROM orders')
        
        orders_rows = cursor.fetchall()
        orders = []
        
        for row in orders_rows:
            order_dict = dict(row)
            # Fetch items for this order
            cursor.execute('SELECT item_name as name, quantity FROM order_items WHERE order_id = ?', (order_dict['order_id'],))
            order_dict['items'] = [dict(i) for i in cursor.fetchall()]
            orders.append(order_dict)
            
        conn.close()
        return orders

    def update_order_status(self, order_id, status):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('UPDATE orders SET status = ? WHERE order_id = ?', (status, order_id))
        conn.commit()
        
        # Fetch updated order to return
        updated_order = None
        if cursor.rowcount > 0:
            cursor.execute('SELECT * FROM orders WHERE order_id = ?', (order_id,))
            row = cursor.fetchone()
            if row:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor() # Reuse with row_factory
                cursor.execute('SELECT * FROM orders WHERE order_id = ?', (order_id,))
                updated_order = dict(cursor.fetchone())
                cursor.execute('SELECT item_name as name, quantity FROM order_items WHERE order_id = ?', (order_id,))
                updated_order['items'] = [dict(i) for i in cursor.fetchall()]
        
        conn.close()
        return updated_order

    def get_kpis(self):
        orders = self.get_orders()
        active_orders = [o for o in orders if o["status"] != "Served"]
        completed_orders = [o for o in orders if o["status"] == "Served"]
        
        avg_prep_time = 0
        if orders:
            avg_prep_time = sum(o["predicted_prep_time"] for o in orders) / len(orders)
            
        completion_rate = 0
        if orders:
            completion_rate = (len(completed_orders) / len(orders)) * 100
            
        load_level = "Low"
        if len(active_orders) > 10: load_level = "High"
        elif len(active_orders) > 5: load_level = "Medium"
        
        total_revenue = 0
        for o in orders:
            for item in o["items"]:
                total_revenue += (item.get('quantity', 1) * 450)

        return {
            "total_active": len(active_orders),
            "avg_prep_time": round(avg_prep_time, 2),
            "completion_rate": round(completion_rate, 1),
            "kitchen_load": load_level,
            "total_revenue": total_revenue
        }
