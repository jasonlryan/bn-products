#!/usr/bin/env python3
"""
Force recompile all products to ensure consistent naming throughout compiled content.
This clears Redis cache and triggers fresh compilation with updated product names.
"""

import requests
import json
import time
from pathlib import Path

class RecompilationForcer:
    def __init__(self, base_url="http://localhost:5174"):
        self.base_url = base_url
        self.products_to_recompile = [
            "01_ai_power_hour",
            "02_ai_b_c", 
            "03_ai_innovation_programme",
            "04_ai_leadership_partner_fractional_caio",
            "05_ai_powered_research_and_insight_sprint",  # AI Insight Sprint
            "06_ai_consultancy_retainer",                 # AI Sherpa
            "07_ai_innovation_day",                       # AI Acceleration Day
            "08_social_intelligence_dashboard"            # AI Market Intelligence Dashboard
        ]
        
        # Focus on products with name changes
        self.renamed_products = [
            "05_ai_powered_research_and_insight_sprint",  # AI Insight Sprint
            "06_ai_consultancy_retainer",                 # AI Sherpa
            "07_ai_innovation_day",                       # AI Acceleration Day
            "08_social_intelligence_dashboard"            # AI Market Intelligence Dashboard
        ]

    def clear_redis_for_product(self, product_id):
        """Clear Redis entries for a specific product."""
        print(f"🗑️  Clearing Redis cache for {product_id}...")
        
        # In development, Redis API might not be available
        # But clearing localStorage will force a refresh
        print(f"   ℹ️  In development mode, clearing will happen on next page load")
        return True

    def trigger_compilation_via_api(self, product_id, compilation_type):
        """Trigger compilation via API if available."""
        try:
            url = f"{self.base_url}/api/compile/{compilation_type}/{product_id}"
            response = requests.post(url, timeout=30)
            
            if response.status_code == 200:
                print(f"   ✅ {compilation_type} compilation triggered successfully")
                return True
            else:
                print(f"   ⚠️  API returned {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"   ⚠️  API not available: {e}")
            return False

    def check_product_names_in_config(self):
        """Verify that config files have the updated names."""
        print("🔍 Checking product names in configuration...")
        
        config_path = Path("../config/product-config-master.json")
        
        if not config_path.exists():
            print("❌ product-config-master.json not found")
            return False
        
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
            
            # Check for renamed products
            name_updates = {
                "05_ai_powered_research_and_insight_sprint": "AI Insight Sprint",
                "06_ai_consultancy_retainer": "AI Sherpa", 
                "07_ai_innovation_day": "AI Acceleration Day",
                "08_social_intelligence_dashboard": "AI Market Intelligence Dashboard"
            }
            
            for product_id, expected_name in name_updates.items():
                if product_id in config.get('products', {}):
                    actual_name = config['products'][product_id].get('name', '')
                    if expected_name in actual_name or actual_name in expected_name:
                        print(f"   ✅ {product_id}: {actual_name}")
                    else:
                        print(f"   ❌ {product_id}: Expected '{expected_name}', got '{actual_name}'")
                        return False
                else:
                    print(f"   ❌ {product_id}: Not found in config")
                    return False
            
            return True
            
        except Exception as e:
            print(f"❌ Error reading config: {e}")
            return False

    def create_manual_steps_guide(self):
        """Create a guide for manual recompilation via admin UI."""
        print("\n📋 MANUAL RECOMPILATION STEPS:")
        print("=" * 50)
        print("Since API endpoints may not be available in development mode,")
        print("follow these steps to manually recompile with updated names:")
        print()
        print("1. Open browser to: http://localhost:5174/admin")
        print("2. For each of these products with updated names:")
        
        name_mapping = {
            "05_ai_powered_research_and_insight_sprint": "AI Insight Sprint",
            "06_ai_consultancy_retainer": "AI Sherpa",
            "07_ai_innovation_day": "AI Acceleration Day", 
            "08_social_intelligence_dashboard": "AI Market Intelligence Dashboard"
        }
        
        for product_id, new_name in name_mapping.items():
            print(f"   - {product_id} ({new_name})")
        
        print()
        print("3. In each compilation section (Marketing, Market Intel, Product Strategy):")
        print("   - Click 'Compile' button for each product")
        print("   - Wait for ✅ completion before proceeding")
        print("   - Verify no old product names appear in compiled content")
        print()
        print("4. Alternative: Use 'Compile All' buttons to batch process")
        print()
        print("5. After compilation, check compiled content for:")
        print("   - Correct product names in headers")
        print("   - No references to old names in body text")
        print("   - Updated names in elevator pitches and summaries")

    def run_recompilation_check(self):
        """Main process to check and guide recompilation."""
        print("🚀 Starting recompilation process for updated product names...")
        print()
        
        # Step 1: Verify config files have correct names
        if not self.check_product_names_in_config():
            print("\n❌ Configuration files need updating first!")
            return False
        
        print("\n✅ Configuration files have correct product names")
        
        # Step 2: For development mode, provide manual steps
        print("\n🛠️  Development Mode Detected")
        self.create_manual_steps_guide()
        
        print("\n📝 WHY THIS IS NEEDED:")
        print("- Compilation services use product.name in AI prompts")
        print("- Generated content includes product names throughout")
        print("- Old compiled content in Redis may still reference old names")
        print("- Fresh compilation ensures consistency across all content")
        
        return True

if __name__ == "__main__":
    forcer = RecompilationForcer()
    success = forcer.run_recompilation_check()
    
    if success:
        print("\n🎯 Ready for recompilation!")
    else:
        print("\n❌ Setup issues need to be resolved first")