class InventoryService:
    def get_inventory_status(self, ingredient, current_stock, daily_usage, reorder_level):
        """
        Calculates status, reorder quantity, and priority for inventory.
        
        Logic:
        1. days_left = current_stock / daily_usage
        2. Status:
           - Critical -> current_stock <= reorder_level
           - Warning -> days_left < 3
           - Safe -> otherwise
        3. Reorder:
           - Critical -> (daily_usage * 7) - current_stock
           - Warning -> (daily_usage * 5) - current_stock
           - Safe -> 0
        """
        # Handling zero usage
        days_left = current_stock / daily_usage if daily_usage > 0 else float('inf')
        
        # Categorization logic
        if current_stock <= reorder_level:
            status = "Critical"
            priority = "High"
            reorder_quantity = (daily_usage * 7) - current_stock
        elif days_left < 3:
            status = "Warning"
            priority = "Medium"
            reorder_quantity = (daily_usage * 5) - current_stock
        else:
            status = "Safe"
            priority = "Low"
            reorder_quantity = 0
            
        return {
            "ingredient": ingredient,
            "status": status,
            "reorder_quantity": max(0, round(reorder_quantity, 2)),
            "priority": priority,
            "days_left": round(days_left, 1) if days_left != float('inf') else "N/A"
        }

    def get_all_inventory_alerts(self):
        """
        Mock data to show alerts in the dashboard.
        In a real application, this would pull from a database.
        """
        mock_inventory = [
            {"ingredient": "Milk", "current_stock": 5.0, "daily_usage": 10.0, "reorder_level": 15.0},
            {"ingredient": "Paneer", "current_stock": 8.0, "daily_usage": 3.0, "reorder_level": 5.0},
            {"ingredient": "Rice", "current_stock": 50.0, "daily_usage": 5.0, "reorder_level": 10.0},
            {"ingredient": "Chicken", "current_stock": 2.0, "daily_usage": 4.0, "reorder_level": 5.0}
        ]
        
        alerts = []
        for item in mock_inventory:
            status_info = self.get_inventory_status(item["ingredient"], item["current_stock"], item["daily_usage"], item["reorder_level"])
            if status_info["status"] != "Safe":
                alerts.append(status_info)
                
        return alerts
