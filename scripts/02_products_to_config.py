#!/usr/bin/env python3
"""
STAGE 2: Products to Config Pipeline (Optimized Version)
Converts clean product files + context to JSON configuration for React app.

Usage:
  python3 02_products_to_config_v2.py --all                    # Process all products
  python3 02_products_to_config_v2.py --product 01_ai_power_hour  # Process specific product
  python3 02_products_to_config_v2.py --list                   # List available products
"""

import os
import re
import json
import glob
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

class ProductsToConfigProcessorV2:
    def __init__(self, products_dir="products", 
                 output_file="config/product-config-master.json"):
        self.products_dir = Path(products_dir)
        self.output_file = Path(output_file)
        
        # Ensure output directory exists
        self.output_file.parent.mkdir(parents=True, exist_ok=True)
        
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

    def load_existing_config(self):
        """Load existing config file if it exists"""
        if self.output_file.exists():
            try:
                with open(self.output_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                print(f"⚠️  Invalid JSON in {self.output_file}. Starting fresh.")
        
        return {
            "metadata": {
                "extractedFrom": "Product Files (Optimized)",
                "extractedAt": datetime.now().isoformat(),
                "totalProducts": 0,
                "totalProductFiles": 0,
                "source": str(self.products_dir),
                "version": "5.0"
            },
            "products": {}
        }

    def load_product_context(self, product_dir):
        """Load product context from JSON file"""
        context_file = product_dir / "product_context.json"
        if not context_file.exists():
            print(f"❌ No product_context.json found in {product_dir}")
            return None
            
        try:
            with open(context_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON in {context_file}")
            return None

    def parse_markdown_content(self, content):
        """Parse markdown content into sections"""
        sections = {}
        lines = content.split('\n')
        
        if not lines:
            return {"Generated Output": content}
        
        # Extract title from first line
        title = lines[0].replace('#', '').strip() if lines[0].startswith('#') else "Generated Content"
        
        # The content after title is the generated output
        content_lines = lines[1:] if lines[0].startswith('#') else lines
        generated_output = '\n'.join(content_lines).strip()
        
        # Create sections similar to old format for compatibility
        sections = {
            title: generated_output,
            "Generated Output": generated_output
        }
        
        return sections

    def clean_text(self, text):
        """Clean and format text content"""
        if not text or text.strip() == '':
            return ""
        
        # Remove extra whitespace and normalize line endings
        text = re.sub(r'\n\s*\n', '\n\n', text.strip())
        
        # Remove markdown artifacts
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)  # Bold
        text = re.sub(r'\*(.*?)\*', r'\1', text)      # Italic
        
        return text

    def extract_lists_from_text(self, text):
        """Extract bullet point lists from text"""
        if not text:
            return []
        
        # First, fix any line break issues - join lines that don't start with list markers
        lines = text.split('\n')
        fixed_lines = []
        current_item = ""
        
        for line in lines:
            line_stripped = line.strip()
            
            # Check if this line starts a new list item
            if line_stripped.startswith(('- ', '* ', '•')):
                # Save previous item if exists
                if current_item:
                    fixed_lines.append(current_item)
                # Start new item
                current_item = line_stripped
            elif line_stripped and current_item:
                # This is a continuation of the previous item
                current_item += " " + line_stripped
            elif line_stripped and not current_item:
                # This is a non-list line at the beginning
                if line_stripped.startswith('-'):
                    current_item = line_stripped
                else:
                    # Try to be smart about non-standard list items
                    current_item = "- " + line_stripped
        
        # Don't forget the last item
        if current_item:
            fixed_lines.append(current_item)
        
        # Now extract the actual list items
        items = []
        for line in fixed_lines:
            line = line.strip()
            if line.startswith('- ') or line.startswith('* '):
                items.append(line[2:].strip())
            elif line.startswith('•'):
                items.append(line[1:].strip())
            elif line.startswith('-') and len(line) > 1:
                # Handle case where there's no space after dash
                items.append(line[1:].strip())
        
        return items

    def process_product_files(self, product_dir):
        """Process all files for a single product"""
        print(f"📂 Processing: {product_dir.name}")
        
        # Load product context
        context = self.load_product_context(product_dir)
        if not context:
            return None
        
        # Initialize product data structure
        product_data = {
            "id": context["id"],
            "name": context["name"],
            "type": context["type"],
            "pricing": {
                "type": "fixed" if "£" in context["price"] else "contact",
                "display": context["price"] or "Contact for Pricing"
            },
            "content": {
                "heroTitle": f"Transform Your Business with {context['name']}",
                "heroSubtitle": context["description"][:200] + "..." if len(context["description"]) > 200 else context["description"],
                "description": context["description"],
                "primaryDeliverables": context["primaryDeliverables"],
                "perfectFor": context["perfectFor"],
                "whatClientBuys": context["whatClientBuys"],
                "idealClient": context["idealClient"],
                "nextProduct": context["nextProduct"]
            },
            "features": self.extract_lists_from_text(context["keyFeatures"]),
            "benefits": self.extract_lists_from_text(context["benefits"]),
            "perfectForList": self.extract_lists_from_text(context["perfectFor"]),
            "marketing": {
                "keyMessages": [],
                "valueProposition": context["whatClientBuys"],
                "tagline": f"Professional {context['name']} Service"
            },
            "richContent": {},
            "metadata": {
                "extractedAt": datetime.now().isoformat(),
                "source": str(product_dir),
                "editable": True,
                "lastModified": datetime.now().isoformat(),
                "richContentFiles": 0
            }
        }
        
        # Process content files
        content_files_count = 0
        
        for prompt_key, content_type in self.content_types.items():
            content_file = product_dir / f"{prompt_key}.md"
            
            if content_file.exists():
                try:
                    with open(content_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Parse content into sections
                    sections = self.parse_markdown_content(content)
                    
                    # Create rich content entry  
                    first_key = list(sections.keys())[0] if sections else "Generated Content"
                    title = first_key.split('•')[1].strip() if '•' in first_key else first_key
                    
                    product_data["richContent"][content_type] = {
                        "metadata": {
                            "title": title,
                            "contentType": content_type,
                            "source": prompt_key,
                            "extractedAt": datetime.now().isoformat()
                        },
                        "sections": sections,
                        "fullContent": content
                    }
                    
                    content_files_count += 1
                    
                except Exception as e:
                    print(f"⚠️  Error processing {content_file}: {e}")
        
        product_data["metadata"]["richContentFiles"] = content_files_count
        print(f"   ✅ Processed {content_files_count} content files")
        
        return product_data

    def list_product_directories(self):
        """List all product directories"""
        if not self.products_dir.exists():
            print(f"❌ Products directory not found: {self.products_dir}")
            return []
        
        product_dirs = [d for d in self.products_dir.iterdir() if d.is_dir() and d.name.startswith(('01_', '02_', '03_', '04_', '05_', '06_', '07_', '08_'))]
        return sorted(product_dirs)

    def process_product(self, product_id):
        """Process a specific product"""
        product_dir = self.products_dir / product_id
        
        if not product_dir.exists():
            print(f"❌ Product directory not found: {product_dir}")
            return False
        
        # Load existing config
        config = self.load_existing_config()
        
        # Process this product
        product_data = self.process_product_files(product_dir)
        if not product_data:
            return False
        
        # Add to config
        config["products"][product_id] = product_data
        config["metadata"]["extractedAt"] = datetime.now().isoformat()
        config["metadata"]["totalProducts"] = len(config["products"])
        
        # Count total files
        total_files = sum(p["metadata"]["richContentFiles"] for p in config["products"].values())
        config["metadata"]["totalProductFiles"] = total_files
        
        # Save updated config
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Updated config for {product_id}")
        print(f"📄 Config saved: {self.output_file}")
        
        return True

    def process_all_products(self):
        """Process all products"""
        product_dirs = self.list_product_directories()
        
        if not product_dirs:
            print("❌ No product directories found")
            return False
        
        print(f"🚀 Processing {len(product_dirs)} products")
        
        # Load existing config
        config = self.load_existing_config()
        
        success_count = 0
        for product_dir in product_dirs:
            product_data = self.process_product_files(product_dir)
            if product_data:
                config["products"][product_dir.name] = product_data
                success_count += 1
        
        # Update metadata
        config["metadata"]["extractedAt"] = datetime.now().isoformat()
        config["metadata"]["totalProducts"] = len(config["products"])
        
        # Count total files
        total_files = sum(p["metadata"]["richContentFiles"] for p in config["products"].values())
        config["metadata"]["totalProductFiles"] = total_files
        
        # Save config
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Successfully processed {success_count}/{len(product_dirs)} products")
        print(f"📄 Config saved: {self.output_file}")
        
        return success_count == len(product_dirs)

    def list_products(self):
        """List all available products"""
        product_dirs = self.list_product_directories()
        
        print("\n📋 Available Product Directories:")
        for i, product_dir in enumerate(product_dirs, 1):
            context_file = product_dir / "product_context.json"
            if context_file.exists():
                try:
                    with open(context_file, 'r') as f:
                        context = json.load(f)
                    print(f"   {i:2d}. {product_dir.name} - {context['name']} ({context.get('price', 'Price TBD')})")
                except:
                    print(f"   {i:2d}. {product_dir.name} - [Context file error]")
            else:
                print(f"   {i:2d}. {product_dir.name} - [No context file]")
        
        print(f"\nTotal: {len(product_dirs)} products")
        return product_dirs

def main():
    parser = argparse.ArgumentParser(description='STAGE 2: Convert optimized product files to JSON config')
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--all', action='store_true', help='Process all products')
    group.add_argument('--product', type=str, help='Process specific product (e.g., 01_ai_power_hour)')
    group.add_argument('--list', action='store_true', help='List available products')
    
    args = parser.parse_args()
    
    processor = ProductsToConfigProcessorV2()
    
    try:
        if args.list:
            processor.list_products()
        elif args.all:
            processor.process_all_products()
        elif args.product:
            processor.process_product(args.product)
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())