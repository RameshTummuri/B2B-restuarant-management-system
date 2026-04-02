from order_service import OrderService
from ml_service import MLService
import os

def test_persistence():
    print("--- 💾 SQLITE PERSISTENCE TEST (via OrderService) ---")
    ml_service = MLService()
    order_svc = OrderService(ml_service, db_path='restaurant.db')
    
    # 1. Create a persistent order
    items = [{"name": "Paneer Tikka", "quantity": 1}]
    new_order = order_svc.create_order(table_number=7, items=items)
    print(f"✅ Created Order {new_order['order_id']} for Table 7.")
    
    # 2. Simulate a Restart (New Instance)
    print("🔄 Simulating System Restart...")
    new_svc = OrderService(ml_service, db_path='restaurant.db')
    all_orders = new_svc.get_orders()
    
    found = False
    for o in all_orders:
        if o['order_id'] == new_order['order_id']:
            found = True
            print(f"✅ FOUND PREVIOUS DATA: Order {o['order_id']} for Table {o['table_number']} / Status: {o['status']}")
    
    if found:
        print("--- 🏁 PERSISTENCE TEST SUCCESSFUL ---")
    else:
        print("--- 🏁 PERSISTENCE TEST FAILED ---")

if __name__ == "__main__":
    test_persistence()
