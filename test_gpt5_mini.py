#!/usr/bin/env python3
"""Quick test of GPT-5 Mini functionality"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    HAS_OPENAI = True
except ImportError:
    print("❌ OpenAI package not installed")
    exit(1)

def test_gpt5_mini():
    """Test GPT-5 Mini with product content generation"""
    model = os.getenv('DEFAULT_OPENAI_MODEL', 'gpt-5-mini')
    
    print(f"🧪 Testing {model}...")
    
    test_prompt = """You are a startup co-founder. Draft a Product Manifesto for AI Power Hour with sections: Problem, Solution, Magic Moment. Keep it under 150 words total."""
    
    product_context = """
PRODUCT CONTEXT:
**Product Name:** AI Power Hour
**Type:** PRODUCT  
**Price:** £300
**Description:** Get unstuck on your biggest AI challenge in 60 minutes. You'll walk away with 3 specific solutions you can implement immediately plus a personalized roadmap that skips months of trial-and-error.
"""
    
    try:
        # Build create parameters based on model capabilities
        create_params = {
            "model": model,
            "messages": [{"role": "user", "content": f"{test_prompt}\n\n{product_context}"}]
        }
        
        # Add parameters based on model type
        if model.startswith('gpt-5'):
            # GPT-5 models: temperature=1 (default), no max_tokens
            pass
        else:
            # Other models: can use temperature and max_tokens
            create_params["temperature"] = 0.7
            create_params["max_tokens"] = 300
            
        response = client.chat.completions.create(**create_params)
        
        result = response.choices[0].message.content
        
        print(f"✅ Success! Model: {model}")
        print(f"✅ Response length: {len(result)} characters")
        print(f"✅ Sample output:")
        print("─" * 50)
        print(result[:200] + "..." if len(result) > 200 else result)
        print("─" * 50)
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_gpt5_mini()
    exit(0 if success else 1)