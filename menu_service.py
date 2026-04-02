class MenuService:
    def optimize_menu(self, rating, popularity):
        """
        Rule-based performance categorization for menu items.
        - High -> rating >= 4.5 AND popularity >= 300
        - Medium -> rating >= 4.0 AND popularity >= 150
        - Low -> otherwise
        """
        # Logic to return categorization based on provided rules
        if rating >= 4.5 and popularity >= 300:
            category = "High"
        elif rating >= 4.0 and popularity >= 150:
            category = "Medium"
        else:
            category = "Low"
            
        return category

    def get_menu_recommendations(self):
        """
        Placeholder logic to categorize all menu items based on logic.
        In a real scenario, this would query a database.
        Let's simulate with some mock items.
        """
        mock_items = [
            {"item": "Paneer Butter Masala", "rating": 4.8, "popularity": 450, "price": 12.99},
            {"item": "Chicken Tikka Masala", "rating": 4.6, "popularity": 400, "price": 14.99},
            {"item": "Vegetable Biryani", "rating": 4.2, "popularity": 210, "price": 11.50},
            {"item": "Samosa (2 pcs)", "rating": 3.9, "popularity": 120, "price": 4.50},
            {"item": "Garlic Naan", "rating": 4.4, "popularity": 350, "price": 3.50},
            {"item": "Lassi", "rating": 3.5, "popularity": 80, "price": 2.99}
        ]
        
        for item in mock_items:
            item["category"] = self.optimize_menu(item["rating"], item["popularity"])
            
        return mock_items
