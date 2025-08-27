#!/usr/bin/env python3
"""
STAGE 1: CSV to Products Pipeline (Optimized Version)
Generates clean product content files with separate context storage.

Usage:
  python3 01_csv_to_products_v2.py --all                    # Process all products
  python3 01_csv_to_products_v2.py --product 01_ai_power_hour  # Process specific product
  python3 01_csv_to_products_v2.py --list                   # List available products
"""

import csv
import os
import re
import json
import time
import argparse
from pathlib import Path
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    HAS_OPENAI = True
except ImportError:
    print("⚠️  OpenAI package not installed. Install with: pip install openai")
    HAS_OPENAI = False

class CSVToProductsProcessorV2:
    def __init__(self, csv_path="../data/BN Products List - 2025.csv", 
                 prompts_dir="../prompts", output_dir="../products",
                 business_context_path="../config/business_context.json"):
        self.csv_path = Path(csv_path)
        self.prompts_dir = Path(prompts_dir)
        self.output_dir = Path(output_dir)
        self.business_context_path = Path(business_context_path)
        
        # Ensure output directory exists
        self.output_dir.mkdir(exist_ok=True)
        
        # Load business context
        self.business_context = self.load_business_context()
        
        # Content type mapping - Resequenced 14-prompt pipeline
        self.content_types = {
            # Foundation & Product (5)
            "01_executive_positioning": "manifesto",
            "02_product_capabilities": "productCapabilities", 
            "03_audience_icps": "audienceICPs",
            "04_user_stories": "userStories",
            "05_functional_specification": "functionalSpec",
            
            # Market Intelligence (2)
            "06_competitor_analysis": "competitorAnalysis",
            "07_market_sizing": "marketSizing",
            
            # Sales Enablement (4)
            "08_key_messages": "keyMessages",
            "09_demo_script": "demoScript",
            "10_presentation_structure": "slideHeadlines",
            "11_discovery_qualification": "discoveryQualification",
            
            # Strategic Planning (3)
            "12_qa_prep": "qaPrep",
            "13_pricing_roi": "pricingStrategy",
            "14_gtm_strategy": "gtmStrategy"
        }

    def load_business_context(self):
        """Load business context from JSON file"""
        try:
            with open(self.business_context_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️  Could not load business context: {e}")
            return {}

    def clean_filename(self, text):
        """Convert text to a clean filename format"""
        text = re.sub(r'[^\w\s-]', '', text.lower())
        text = re.sub(r'[-\s]+', '_', text)
        return text.strip('_')

    def read_products_from_csv(self):
        """Read products from CSV file"""
        products = []
        with open(self.csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for i, row in enumerate(reader, 1):
                if not row.get('NAME'):
                    continue
                    
                # Clean column names and values
                cleaned_row = {}
                for key, value in row.items():
                    if key is not None:  # Fix for None keys
                        clean_key = key.strip()
                        clean_value = value.strip() if value else ""
                        cleaned_row[clean_key] = clean_value
                
                # Generate product ID
                product_id = f"{i:02d}_{self.clean_filename(cleaned_row['NAME'])}"
                cleaned_row['PRODUCT_ID'] = product_id
                products.append(cleaned_row)
        
        return products

    def read_prompts(self):
        """Read all prompt files from prompts directory"""
        prompts = []
        prompt_files = sorted([f for f in os.listdir(self.prompts_dir) if f.endswith('.md') and re.match(r'\d+_', f)])
        
        for filename in prompt_files:
            filepath = self.prompts_dir / filename
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
                
            # Extract prompt number and name
            match = re.match(r'(\d+)_(.+)\.md', filename)
            if match:
                prompt_number = int(match.group(1))
                prompt_name = match.group(2)
                
                # Extract the actual prompt from content
                kick_off_prompt = self.extract_prompt_from_content(content)
                
                prompts.append({
                    'number': prompt_number,
                    'name': prompt_name,
                    'filename': filename,
                    'content': content,
                    'prompt': kick_off_prompt
                })
        
        return prompts

    def extract_prompt_from_content(self, content):
        """Extract the kick-off prompt from markdown content"""
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if 'Kick-Off Prompt:' in line:
                # Find the actual prompt (usually in quotes)
                for j in range(i+1, min(i+10, len(lines))):
                    if lines[j].strip().startswith('"') and lines[j].strip().endswith('"'):
                        return lines[j].strip()[1:-1]  # Remove quotes
        return ""

    def save_product_context(self, product, product_dir):
        """Save product context as JSON file"""
        context = {
            "id": product['PRODUCT_ID'],
            "name": product['NAME'],
            "type": product.get('Type', 'PRODUCT'),
            "price": product.get('PRICE', ''),
            "primaryDeliverables": product.get('Primary Deliverables', ''),
            "description": product.get('DESCRIPTION', ''),
            "perfectFor": product.get('PERFECT FOR:', ''),
            "whatClientBuys": product.get('WHAT THE CLIENT IS ACTUALLY BUYING', ''),
            "idealClient": product.get('IDEAL CLIENT', ''),
            "keyFeatures": product.get('KEY FEATURES', ''),
            "benefits": product.get('BENEFITS', ''),
            "nextProduct": product.get('WHAT IS THE NEXT PRODUCT OR SERVICE?', ''),
            "extractedAt": time.strftime('%Y-%m-%d %H:%M:%S'),
            "source": "CSV"
        }
        
        context_file = product_dir / "product_context.json"
        with open(context_file, 'w', encoding='utf-8') as f:
            json.dump(context, f, indent=2)
        
        print(f"   ✅ Saved product context: {context_file.name}")

    def save_generation_metadata(self, metadata, product_dir):
        """Save generation metadata as JSON file"""
        meta_data = {
            "generatedAt": time.strftime('%Y-%m-%d %H:%M:%S'),
            "totalPrompts": len(metadata),
            "model": os.getenv('DEFAULT_OPENAI_MODEL', 'gpt-5-mini'),
            "prompts": metadata
        }
        
        meta_file = product_dir / "generation_metadata.json"
        with open(meta_file, 'w', encoding='utf-8') as f:
            json.dump(meta_data, f, indent=2)
        
        print(f"   ✅ Saved generation metadata: {meta_file.name}")

    def get_relevant_previous_outputs(self, current_prompt_num, all_previous_outputs):
        """Smart selection of relevant previous outputs based on prompt dependencies"""
        
        # Prompt dependency matrix - which prompts need which previous outputs
        dependencies = {
            # Foundation & Product (1-5): Logical build-up
            1: [],  # Executive positioning - standalone manifesto
            2: [1],  # Product capabilities - needs positioning
            3: [1],  # Audience ICPs - needs positioning context
            4: [1, 2, 3],  # User stories - needs positioning + capabilities + personas
            5: [1, 2, 4],  # Functional spec - needs positioning + capabilities + user stories
            
            # Market Intelligence (6-7): Competitive context
            6: [1, 2, 3],  # Competitor analysis - needs positioning + capabilities + audience
            7: [1, 2, 3, 6],  # Market sizing - needs market context
            
            # Sales Enablement (8-11): Needs product + market context
            8: [1, 2, 3],  # Key messages - needs positioning + capabilities + audience
            9: [1, 2, 8],  # Demo script - needs positioning + capabilities + messages
            10: [1, 2, 8, 9],  # Presentation structure - needs messages + demo
            11: [1, 2, 3, 8],  # Discovery qualification - needs positioning + audience + messages
            
            # Strategic Planning (12-14): Needs comprehensive context
            12: [1, 2, 3, 8, 9, 10],  # QA prep - needs sales enablement context
            13: [1, 2, 3, 6, 7],  # Pricing ROI - needs market analysis
            14: [1, 2, 3, 6, 7, 8]  # GTM strategy - needs market + messaging
        }
        
        # Get required prompt numbers for current prompt
        required_prompts = dependencies.get(current_prompt_num, [])
        
        if not required_prompts:
            return ""
        
        # Build relevant context from only the required previous outputs
        relevant_context = []
        for prompt_num in required_prompts:
            if prompt_num <= len(all_previous_outputs):
                output_data = all_previous_outputs[prompt_num - 1]  # 0-indexed
                # Add concise summary instead of full content
                relevant_context.append(f"--- {output_data['name']} (Summary) ---\n{output_data['content'][:500]}...\n")
        
        return "\n".join(relevant_context) if relevant_context else ""

    def call_llm(self, prompt, product_context_text, current_prompt_num, all_previous_outputs, model=None):
        """Call OpenAI API to generate content with smart context injection"""
        if not HAS_OPENAI or not client:
            return "[AI Content Generation Not Available - Install openai package and set OPENAI_API_KEY]"
        
        # Use model from environment variable if not specified
        if model is None:
            model = os.getenv('DEFAULT_OPENAI_MODEL', 'gpt-5-mini')
        
        try:
            # Build prompt with smart previous output selection
            full_prompt = f"{prompt}\n\n{product_context_text}"
            
            relevant_previous = self.get_relevant_previous_outputs(current_prompt_num, all_previous_outputs)
            if relevant_previous:
                full_prompt += f"\n\nRELEVANT CONTEXT FROM PREVIOUS OUTPUTS:\n{relevant_previous}"
            
            # Build parameters based on model capabilities
            create_params = {
                "model": model,
                "messages": [{"role": "user", "content": full_prompt}]
            }
            
            if model.startswith('gpt-5'):
                # GPT-5 models: use defaults (temperature=1, no explicit token limits)
                pass
            else:
                # Other models: can customize temperature and token limits
                create_params["temperature"] = 0.7
                create_params["max_tokens"] = 2000
                
            response = client.chat.completions.create(**create_params)
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"[Error generating content: {e}]"

    def format_product_context_text(self, product):
        """Format product data for LLM context with business context"""
        
        # Build business context section
        business_context_text = ""
        if self.business_context:
            bc = self.business_context
            business_context_text = f"""
BUSINESS CONTEXT:

**Company:** {bc.get('company', {}).get('name', 'Brilliant Noise')} - {bc.get('positioning', {}).get('primary', 'AI innovation partner for global brands')}
**Location:** {bc.get('company', {}).get('location', 'Brighton, UK')} ({bc.get('company', {}).get('type', 'B-Corp certified digital consultancy')})
**Founded:** {bc.get('company', {}).get('founded', '2009')} by {', '.join(bc.get('company', {}).get('founders', []))}

**Our Positioning:** {bc.get('positioning', {}).get('secondary', 'Marketing transformation agency')}
**Our Approach:** {bc.get('approach', {}).get('philosophy', 'Provide clarity, confidence, and capability in AI adoption')}
**Our Methodology:** {bc.get('approach', {}).get('methodology', 'Test-Learn-Lead™ process')}

**Key Differentiators:**
{chr(10).join([f"- {strength}" for strength in bc.get('competitive_positioning', {}).get('unique_strengths', [])])}

**We Are NOT:**
{chr(10).join([f"- {not_like}" for not_like in bc.get('competitive_positioning', {}).get('not_like', [])])}

**Our Clients:** {bc.get('clients', {}).get('type', 'Global brands')} including {', '.join(bc.get('clients', {}).get('examples', [])[:5])}
**Target Buyers:** {bc.get('target_market', {}).get('decision_makers', 'CMOs, CDOs, Innovation Directors')}
"""
        
        return f"""{business_context_text}

PRODUCT CONTEXT:

**Product Name:** {product['NAME']}
**Type:** {product.get('Type', 'PRODUCT')}
**Price:** {product.get('PRICE', '')}
**Primary Deliverables:** {product.get('Primary Deliverables', '')}

**Description:**
{product.get('DESCRIPTION', '')}

**Perfect For:**
{product.get('PERFECT FOR:', '')}

**What Client is Buying:**
{product.get('WHAT THE CLIENT IS ACTUALLY BUYING', '')}

**Ideal Client:**
{product.get('IDEAL CLIENT', '')}

**Key Features:**
{product.get('KEY FEATURES', '')}

**Benefits:**
{product.get('BENEFITS', '')}
"""

    def generate_ai_content(self, product, prompt, current_prompt_num, all_previous_outputs):
        """Generate clean AI content with smart context injection"""
        product_context_text = self.format_product_context_text(product)
        
        # Replace <n> placeholder with product name in prompt
        actual_prompt = prompt['prompt'].replace('<n>', product['NAME'])
        
        ai_content = self.call_llm(actual_prompt, product_context_text, current_prompt_num, all_previous_outputs)
        
        # Return clean content with minimal header
        clean_content = f"""# {product['NAME']} • {prompt['name'].replace('_', ' ').title()}

{ai_content}
"""
        return clean_content

    def process_product(self, product_id):
        """Process a specific product through all prompts"""
        print(f"\n🎯 Processing product: {product_id}")
        
        # Find the product in CSV
        products = self.read_products_from_csv()
        product = None
        for p in products:
            if p['PRODUCT_ID'] == product_id:
                product = p
                break
        
        if not product:
            print(f"❌ Product {product_id} not found in CSV")
            return False
        
        # Create product directory
        product_dir = self.output_dir / product_id
        product_dir.mkdir(exist_ok=True)
        
        # Save product context once per product
        self.save_product_context(product, product_dir)
        
        # Read prompts
        prompts = self.read_prompts()
        if not prompts:
            print(f"❌ No prompts found")
            return False
        
        print(f"📝 Found {len(prompts)} prompts")
        
        # Process each prompt for this product with smart context injection
        all_previous_outputs = []  # Store structured previous outputs
        generated_files = 0
        generation_metadata = []
        
        for prompt in prompts:
            print(f"   Processing prompt {prompt['number']:02d}: {prompt['name']}")
            
            # Generate content with smart context injection
            ai_content = self.generate_ai_content(product, prompt, prompt['number'], all_previous_outputs)
            
            # Save clean content file
            filename = f"{prompt['number']:02d}_{prompt['name']}.md"
            filepath = product_dir / filename
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(ai_content)
            
            generated_files += 1
            
            # Track generation metadata
            generation_metadata.append({
                'prompt_number': prompt['number'],
                'prompt_name': prompt['name'],
                'prompt_file': prompt['filename'],
                'model': os.getenv('DEFAULT_OPENAI_MODEL', 'gpt-5-mini'),
                'generated_at': time.strftime('%Y-%m-%d %H:%M:%S'),
                'content_length': len(ai_content),
                'filename': filename,
                'context_used': len(all_previous_outputs)  # Track how much context was available
            })
            
            # Store structured previous output for future prompts
            all_previous_outputs.append({
                'number': prompt['number'],
                'name': prompt['name'],
                'content': ai_content
            })
            
            # Small delay to avoid rate limits
            time.sleep(1)
        
        # Save generation metadata
        self.save_generation_metadata(generation_metadata, product_dir)
        
        print(f"✅ Generated {generated_files} files + context + metadata for {product_id}")
        return True

    def process_all_products(self):
        """Process all products in CSV"""
        products = self.read_products_from_csv()
        
        print(f"\n🚀 Processing {len(products)} products from CSV")
        
        success_count = 0
        for product in products:
            if self.process_product(product['PRODUCT_ID']):
                success_count += 1
        
        print(f"\n✅ Successfully processed {success_count}/{len(products)} products")
        return success_count == len(products)

    def list_products(self, interactive=False):
        """List all available products from CSV with optional interactive selection"""
        products = self.read_products_from_csv()
        
        print("\n📋 Available Products:")
        for i, product in enumerate(products, 1):
            print(f"   {i:2d}. {product['PRODUCT_ID']} - {product['NAME']} ({product.get('PRICE', 'Price TBD')})")
        
        print(f"\nTotal: {len(products)} products")
        
        if interactive:
            print("\n🎯 Enter product number to process (1-{}) or 'q' to quit: ".format(len(products)), end='')
            choice = input().strip()
            
            if choice.lower() == 'q':
                print("👋 Exiting...")
                return None
            
            try:
                num = int(choice)
                if 1 <= num <= len(products):
                    selected = products[num - 1]
                    print(f"\n✅ Selected: {selected['PRODUCT_ID']} - {selected['NAME']}")
                    return selected['PRODUCT_ID']
                else:
                    print(f"❌ Invalid number. Please choose between 1 and {len(products)}")
                    return None
            except ValueError:
                print("❌ Invalid input. Please enter a number.")
                return None
        
        return products

def main():
    parser = argparse.ArgumentParser(description='STAGE 1: Generate clean product content from CSV + prompts')
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--all', action='store_true', help='Process all products')
    group.add_argument('--product', type=str, help='Process specific product (e.g., 01_ai_power_hour or just 04)')
    group.add_argument('--list', action='store_true', help='List available products')
    group.add_argument('--select', action='store_true', help='List products and select interactively')
    
    args = parser.parse_args()
    
    processor = CSVToProductsProcessorV2()
    
    try:
        if args.list:
            processor.list_products()
        elif args.select:
            # Interactive selection mode
            selected_product = processor.list_products(interactive=True)
            if selected_product:
                processor.process_product(selected_product)
        elif args.all:
            processor.process_all_products()
        elif args.product:
            # Handle both full product ID and just number
            if args.product.isdigit():
                # If just a number, find the matching product
                products = processor.read_products_from_csv()
                product_num = int(args.product)
                if 1 <= product_num <= len(products):
                    product_id = products[product_num - 1]['PRODUCT_ID']
                    processor.process_product(product_id)
                else:
                    print(f"❌ Product number {product_num} not found. Use --list to see available products.")
            else:
                # Full product ID provided
                processor.process_product(args.product)
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())