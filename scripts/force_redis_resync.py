#!/usr/bin/env python3
"""
Force Redis resync by triggering the sync API endpoint in production.
This script will call the Vercel deployment to resync the latest product configuration to Redis.
"""

import requests
import json

def force_redis_resync():
    """Trigger a Redis resync by calling the sync endpoint"""
    
    # Vercel production URL - update this to your actual Vercel URL
    base_url = "https://bn-products.vercel.app"  # Update this to your actual Vercel URL
    sync_endpoint = f"{base_url}/api/storage"
    
    print("🔄 Triggering Redis resync in production...")
    print(f"Calling: {sync_endpoint}")
    
    try:
        # Make a POST request to trigger sync
        response = requests.post(sync_endpoint, 
                               json={"action": "sync"}, 
                               timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Redis resync successful!")
            print(f"Response: {result}")
        else:
            print(f"❌ Failed to trigger resync. Status: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error calling sync endpoint: {e}")
        print("This might mean the API endpoint is not available or configured.")
        print("\nAlternative solutions:")
        print("1. Check if your Vercel deployment has the sync API endpoint")
        print("2. Manually trigger a rebuild in Vercel dashboard") 
        print("3. Clear Vercel's build cache")

if __name__ == "__main__":
    print("=== Force Redis Resync Script ===")
    print("This script will trigger a resync of product configuration to Redis in production.")
    print()
    
    # Ask for confirmation
    response = input("Do you want to proceed with forcing a Redis resync? (y/n): ")
    if response.lower() == 'y':
        force_redis_resync()
    else:
        print("❌ Aborted.")