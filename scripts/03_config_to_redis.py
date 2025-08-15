#!/usr/bin/env python3
"""
STAGE 3: Config to Redis Pipeline
Loads JSON configuration data into Redis storage for React app consumption.

Usage:
  python3 03_config_to_redis.py --all                    # Load all products
  python3 03_config_to_redis.py --product 01_ai_power_hour  # Load specific product
  python3 03_config_to_redis.py --list                   # List available products
  python3 03_config_to_redis.py --clear                  # Clear all product data from Redis
"""

import json
import argparse
import os
import sys
from datetime import datetime
from pathlib import Path
import requests
import time

class ConfigToRedisProcessor:
    def __init__(self, config_file="../config/product-config-master.json"):
        self.config_file = Path(config_file)
        self.api_base = os.getenv('VITE_API_BASE_URL', '')  # Empty for production, local URL for dev
        
        # Redis key patterns (matches existing system)
        self.key_patterns = {
            'product_definition': 'bn:product:definition:{}',
            'product_list': 'bn:product:list',
            'product_metadata': 'bn:product:metadata:{}',
            'content': 'bn:content:{}:{}',  # productId:contentType
            'compiled': 'bn:compiled:{}:{}',  # type:productId
            'count': 'bn:count:{}:{}',  # type:productId
            'version': 'bn:version'
        }

    def load_config(self):
        """Load the JSON config file"""
        if not self.config_file.exists():
            print(f"❌ Config file not found: {self.config_file}")
            return None
        
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON in config file: {e}")
            return None

    def call_storage_api(self, action, **kwargs):
        """Call the storage API endpoint"""
        url = f"{self.api_base}/api/storage"
        
        payload = {"action": action, **kwargs}
        
        try:
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            if not result.get('ok'):
                print(f"❌ Storage API error: {result.get('error', 'Unknown error')}")
                return False
            
            return result
        
        except requests.exceptions.RequestException as e:
            print(f"❌ API request failed: {e}")
            return False
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON response: {e}")
            return False

    def store_product_definition(self, product_id, product_data):
        """Store product definition in Redis"""
        key = self.key_patterns['product_definition'].format(product_id)
        
        # Prepare product definition (core product data without rich content)
        definition = {
            "id": product_data["id"],
            "name": product_data["name"],
            "type": product_data["type"],
            "pricing": product_data["pricing"],
            "content": product_data["content"],
            "features": product_data.get("features", []),
            "benefits": product_data.get("benefits", []),
            "marketing": product_data.get("marketing", {}),
            "metadata": product_data["metadata"]
        }
        
        return self.call_storage_api("set", key=key, value=definition)

    def store_rich_content(self, product_id, rich_content):
        """Store rich content files in Redis"""
        success_count = 0
        
        for content_type, content_data in rich_content.items():
            key = self.key_patterns['content'].format(product_id, content_type)
            
            if self.call_storage_api("set", key=key, value=content_data):
                success_count += 1
            else:
                print(f"⚠️  Failed to store content: {product_id}:{content_type}")
        
        return success_count

    def store_product_metadata(self, product_id, metadata):
        """Store product metadata"""
        key = self.key_patterns['product_metadata'].format(product_id)
        return self.call_storage_api("set", key=key, value=metadata)

    def update_product_list(self, config):
        """Update the master product list"""
        product_list = []
        
        for product_id, product_data in config.get("products", {}).items():
            product_list.append({
                "id": product_id,
                "name": product_data["name"],
                "type": product_data["type"],
                "lastModified": product_data["metadata"].get("lastModified")
            })
        
        key = self.key_patterns['product_list']
        return self.call_storage_api("set", key=key, value=product_list)

    def update_version(self, config):
        """Update the version information"""
        version_info = {
            "configVersion": config["metadata"].get("version", "4.0"),
            "lastUpdate": datetime.now().isoformat(),
            "totalProducts": config["metadata"].get("totalProducts", 0),
            "source": "03_config_to_redis.py"
        }
        
        key = self.key_patterns['version']
        return self.call_storage_api("set", key=key, value=version_info)

    def load_product(self, product_id, config):
        """Load a specific product into Redis"""
        products = config.get("products", {})
        
        if product_id not in products:
            print(f"❌ Product {product_id} not found in config")
            return False
        
        product_data = products[product_id]
        
        print(f"🔄 Loading product: {product_id}")
        
        # Store product definition
        if not self.store_product_definition(product_id, product_data):
            print(f"❌ Failed to store product definition for {product_id}")
            return False
        
        # Store rich content
        rich_content = product_data.get("richContent", {})
        if rich_content:
            content_count = self.store_rich_content(product_id, rich_content)
            print(f"   📁 Stored {content_count}/{len(rich_content)} content files")
        
        # Store metadata
        if not self.store_product_metadata(product_id, product_data["metadata"]):
            print(f"⚠️  Failed to store metadata for {product_id}")
        
        print(f"✅ Successfully loaded {product_id}")
        return True

    def load_all_products(self, config):
        """Load all products from config into Redis"""
        products = config.get("products", {})
        
        if not products:
            print("❌ No products found in config")
            return False
        
        print(f"\n🚀 Loading {len(products)} products into Redis")
        
        success_count = 0
        for product_id in products.keys():
            if self.load_product(product_id, config):
                success_count += 1
        
        # Update global data
        print("\n🔄 Updating global data...")
        
        if self.update_product_list(config):
            print("   ✅ Updated product list")
        else:
            print("   ⚠️  Failed to update product list")
        
        if self.update_version(config):
            print("   ✅ Updated version info")
        else:
            print("   ⚠️  Failed to update version info")
        
        print(f"\n✅ Successfully loaded {success_count}/{len(products)} products into Redis")
        return success_count == len(products)

    def clear_all_products(self):
        """Clear all product data from Redis"""
        print("🗑️  Clearing all product data from Redis...")
        
        # Get list of all product keys
        patterns = [
            'bn:product:*',
            'bn:content:*',
            'bn:compiled:*',
            'bn:count:*'
        ]
        
        cleared_count = 0
        for pattern in patterns:
            result = self.call_storage_api("keys", pattern=pattern)
            if result and result.get('keys'):
                keys = result['keys']
                if keys:
                    # Delete all keys matching pattern
                    delete_result = self.call_storage_api("deletePattern", pattern=pattern)
                    if delete_result:
                        cleared_count += delete_result.get('count', 0)
                        print(f"   🗑️  Cleared {delete_result.get('count', 0)} keys matching {pattern}")
        
        print(f"✅ Cleared {cleared_count} keys from Redis")
        return True

    def list_products(self):
        """List all products available in config"""
        config = self.load_config()
        if not config:
            return []
        
        products = config.get("products", {})
        
        print("\n📋 Available Products in Config:")
        for i, (product_id, product_data) in enumerate(products.items(), 1):
            rich_files = len(product_data.get("richContent", {}))
            print(f"   {i:2d}. {product_id} - {product_data['name']} ({rich_files} content files)")
        
        print(f"\nTotal: {len(products)} products")
        print(f"Config: {self.config_file}")
        return list(products.keys())

    def check_redis_connection(self):
        """Test Redis connection"""
        print("🔗 Testing Redis connection...")
        
        test_result = self.call_storage_api("set", key="test:connection", value="ping", ttl=10)
        if test_result:
            print("✅ Redis connection successful")
            return True
        else:
            print("❌ Redis connection failed")
            return False

def main():
    parser = argparse.ArgumentParser(description='STAGE 3: Load config data into Redis')
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--all', action='store_true', help='Load all products')
    group.add_argument('--product', type=str, help='Load specific product (e.g., 01_ai_power_hour)')
    group.add_argument('--list', action='store_true', help='List available products')
    group.add_argument('--clear', action='store_true', help='Clear all product data from Redis')
    
    parser.add_argument('--config', type=str, 
                       default="../config/product-config-master.json",
                       help='Input config file path')
    
    args = parser.parse_args()
    
    processor = ConfigToRedisProcessor(config_file=args.config)
    
    try:
        if args.list:
            processor.list_products()
        elif args.clear:
            if not processor.check_redis_connection():
                return 1
            processor.clear_all_products()
        else:
            # Test connection first
            if not processor.check_redis_connection():
                return 1
            
            # Load config
            config = processor.load_config()
            if not config:
                return 1
            
            if args.all:
                processor.load_all_products(config)
            elif args.product:
                processor.load_product(args.product, config)
    
    except KeyboardInterrupt:
        print("\n❌ Operation cancelled by user")
        return 1
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())