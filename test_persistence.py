import sqlite3
import json
from datetime import datetime

DB_PATH = 'restaurant.db'

def test_persistence():
    print("--- 💾 SQLITE PERSISTENCE TEST ---")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Create a test order
    order_id = "PERSIST-01"
    cursor.execute("INSERT OR REPLACE INTO orders (order_id, table_number, status, predicted_prep_time, order_time, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                   (order_id, 9, "Preparing", 15.5, "2026-04-02 12:00:00", "2026-04-02"))
    cursor.execute("INSERT INTO order_items (order_id, item_name, quantity) VALUES (?, ?, ?)", (order_id, "Test Samosa", 10))
    conn.commit()
    print(f"✅ Created Order {order_id} in Database.")
    
    # 2. Verify it exists
    cursor.execute("SELECT * FROM orders WHERE order_id = ?", (order_id,))
    row = cursor.fetchone()
    if row:
        print(f"✅ Verified Order {row[0]} exists with status {row[2]}.")
    
    # 3. Simulate a Restart (Close and Reopen)
    conn.close()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT item_name, quantity FROM order_items WHERE order_id = ?", (order_id,))
    items = cursor.fetchall()
    print(f"✅ After 'Restart', found {len(items)} items: {items}")
    
    conn.close()
    print("--- 🏁 TEST COMPLETE ---")

if __name__ == "__main__":
    test_persistence()
