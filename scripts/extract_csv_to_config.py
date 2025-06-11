#!/usr/bin/env python3
"""
CSV to Config Extractor
Extracts complete product data directly from CSV and loads rich content from product markdown files
"""

import csv
import json
import re
import os
from pathlib import Path
from datetime import datetime

class CSVToConfigExtractor:
    def __init__(self, csv_path="../data/BN Products List   - 2025.csv", config_file="../dashboard-react/config/product-config.json", products_dir="../products"):
        self.csv_path = Path(csv_path)
        self.config_file = Path(config_file)
        self.products_dir = Path(products_dir)
        self.products = {}
        
        # Content type mapping for organizing markdown files
        self.content_types = {
            "01_big_idea_product_manifesto": "manifesto",
            "02_idea_exploration_functional_spec": "functionalSpec",
            "03_idea_exploration_audience_icps": "audienceICPs",
            "04_idea_exploration_user_stories": "userStories",
            "05_plan_competitor_sweep": "competitorAnalysis",
            "06_plan_tam_sizing": "marketSizing",
            "07_research_prd_skeleton": "prdSkeleton",
            "08_research_prd_ui_prompt": "uiPrompt",
            "09_build_generate_screens": "screenGeneration",
            "10_build_ui_landing_page_copy": "landingPageCopy",
            "11_build_ui_key_messages": "keyMessages",
            "12_demo_investor_deck": "investorDeck",
            "13_demo_demo_script": "demoScript",
            "14_demo_slide_headlines": "slideHeadlines",
            "15_demo_qa_prep": "qaPrep"
        }
        
    def clean_text(self, text):
        """Clean and format text content"""
        if not text or text.strip() == '':
            return ""
        
        # Remove extra whitespace and normalize line breaks
        text = re.sub(r'\s+', ' ', text.strip())
        # Convert bullet points to proper format
        text = re.sub(r'[•·-]\s*', '• ', text)
        return text
    
    def format_list_items(self, text):
        """Convert text to properly formatted list items"""
        if not text:
            return []
        
        # Split by bullet points or line breaks
        items = re.split(r'[•·-]\s*|\n', text)
        formatted_items = []
        
        for item in items:
            item = item.strip()
            if item and len(item) > 3:  # Filter out empty or very short items
                formatted_items.append(item)
        
        return formatted_items
    
    def generate_slug(self, name):
        """Generate URL-friendly slug from product name"""
        slug = re.sub(r'[^\w\s-]', '', name.lower())
        slug = re.sub(r'[-\s]+', '_', slug)
        return slug.strip('_')
    
    def extract_pricing_info(self, price_text):
        """Extract and structure pricing information"""
        if not price_text:
            return {"type": "contact", "display": "Contact for Pricing"}
        
        price_text = price_text.strip()
        
        # Handle different pricing formats
        if "bespoke" in price_text.lower() or "to be determined" in price_text.lower():
            return {"type": "contact", "display": "Contact for Pricing"}
        elif "£" in price_text:
            # Extract main price
            main_price_match = re.search(r'£([\d,]+)', price_text)
            if main_price_match:
                main_price = main_price_match.group(0)
                
                # Check for multiple pricing options
                all_prices = re.findall(r'£[\d,]+[^\n]*', price_text)
                if len(all_prices) > 1:
                    return {
                        "type": "tiered",
                        "display": main_price,
                        "options": [{"name": price.strip(), "price": price.strip()} for price in all_prices]
                    }
                else:
                    return {"type": "fixed", "display": main_price}
        
        return {"type": "contact", "display": price_text}
    
    def parse_markdown_file(self, file_path):
        """Parse a markdown file and extract structured content"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Extract metadata from the header
            metadata = {}
            lines = content.split('\n')
            
            # Find the title (first # line)
            title = ""
            for line in lines:
                if line.startswith('# '):
                    title = line[2:].strip()
                    break
            
            # Extract structured sections
            sections = {}
            current_section = None
            current_content = []
            
            for line in lines:
                if line.startswith('## '):
                    # Save previous section
                    if current_section:
                        sections[current_section] = '\n'.join(current_content).strip()
                    
                    # Start new section
                    current_section = line[3:].strip()
                    current_content = []
                elif current_section:
                    current_content.append(line)
            
            # Save last section
            if current_section:
                sections[current_section] = '\n'.join(current_content).strip()
            
            return {
                "title": title,
                "metadata": metadata,
                "sections": sections,
                "fullContent": content
            }
            
        except Exception as e:
            print(f"Warning: Could not parse {file_path}: {e}")
            return None
    
    def load_product_files(self):
        """Load and organize all product markdown files"""
        product_files = {}
        
        if not self.products_dir.exists():
            print(f"Warning: Products directory {self.products_dir} not found")
            return product_files
        
        # Get all markdown files
        md_files = list(self.products_dir.glob("*.md"))
        print(f"📁 Found {len(md_files)} markdown files in products directory")
        
        for file_path in md_files:
            filename = file_path.stem
            
            # Parse filename: {product_id}_{content_type}
            parts = filename.split('_')
            if len(parts) >= 3:
                product_num = parts[0]
                product_name_parts = []
                content_type_parts = []
                
                # Find where content type starts (look for known patterns)
                content_type_found = False
                for i, part in enumerate(parts[1:], 1):
                    # Check if this part starts a known content type
                    remaining_parts = '_'.join(parts[i:])
                    content_type_key = None
                    
                    for key in self.content_types.keys():
                        if remaining_parts.startswith(key):
                            content_type_key = key
                            content_type_found = True
                            break
                    
                    if content_type_found:
                        content_type_parts = parts[i:]
                        break
                    else:
                        product_name_parts.append(part)
                
                if content_type_found:
                    product_id = f"{product_num}_{'_'.join(product_name_parts)}"
                    content_type_raw = '_'.join(content_type_parts)
                    
                    # Map to clean content type
                    content_type = None
                    for key, value in self.content_types.items():
                        if content_type_raw.startswith(key):
                            content_type = value
                            break
                    
                    if content_type:
                        # Parse the file
                        parsed_content = self.parse_markdown_file(file_path)
                        if parsed_content:
                            if product_id not in product_files:
                                product_files[product_id] = {}
                            
                            product_files[product_id][content_type] = parsed_content
        
        print(f"📊 Organized content for {len(product_files)} products")
        return product_files
    
    def read_csv_data(self):
        """Read and parse CSV data"""
        products = []
        
        with open(self.csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Clean column names and values
                cleaned_row = {}
                for key, value in row.items():
                    clean_key = key.strip()
                    clean_value = value.strip() if value else ""
                    cleaned_row[clean_key] = clean_value
                
                if cleaned_row.get('NAME'):  # Only process rows with names
                    products.append(cleaned_row)
        
        return products
    
    def convert_to_config_format(self, csv_products, product_files):
        """Convert CSV data to React dashboard config format with rich content"""
        config_data = {
            "metadata": {
                "extractedFrom": "CSV + Product Files",
                "extractedAt": datetime.now().isoformat(),
                "totalProducts": len(csv_products),
                "totalProductFiles": sum(len(files) for files in product_files.values()),
                "source": str(self.csv_path),
                "productsSource": str(self.products_dir),
                "version": "3.0"
            },
            "products": {}
        }
        
        for i, product in enumerate(csv_products, 1):
            # Generate product ID
            product_id = f"{i:02d}_{self.generate_slug(product['NAME'])}"
            
            # Get rich content for this product
            rich_content = product_files.get(product_id, {})
            
            # Extract and structure all data
            product_data = {
                "id": product_id,
                "name": self.clean_text(product['NAME']),
                "type": product['Type'].strip().upper() if product.get('Type') else "PRODUCT",
                "pricing": self.extract_pricing_info(product.get('PRICE', '')),
                "content": {
                    "heroTitle": f"Transform Your Business with {self.clean_text(product['NAME'])}",
                    "heroSubtitle": self.clean_text(product.get('DESCRIPTION', '')),
                    "description": self.clean_text(product.get('DESCRIPTION', '')),
                    "primaryDeliverables": self.clean_text(product.get('Primary Deliverables', '')),
                    "perfectFor": self.clean_text(product.get('PERFECT FOR:', '')),
                    "whatClientBuys": self.clean_text(product.get('WHAT THE CLIENT IS ACTUALLY BUYING', '')),
                    "idealClient": self.clean_text(product.get('IDEAL CLIENT', '')),
                    "nextProduct": self.clean_text(product.get('WHAT IS THE NEXT PRODUCT OR SERVICE?', ''))
                },
                "features": self.format_list_items(product.get('KEY FEATURES', '')),
                "benefits": self.format_list_items(product.get('BENEFITS', '')),
                "perfectForList": self.format_list_items(product.get('PERFECT FOR:', '')),
                "marketing": {
                    "tagline": f"Professional {product['Type'].lower()} for modern businesses",
                    "valueProposition": self.clean_text(product.get('DESCRIPTION', '')),
                    "keyMessages": [
                        f"Expert {product['Type'].lower()} delivery",
                        "Immediate business impact",
                        "Tailored to your needs",
                        "Professional support included"
                    ]
                },
                "richContent": rich_content,  # Add all the rich content from markdown files
                "metadata": {
                    "extractedAt": datetime.now().isoformat(),
                    "source": "CSV + Product Files",
                    "editable": True,  # Mark as editable in UI
                    "lastModified": datetime.now().isoformat(),
                    "richContentFiles": len(rich_content)
                }
            }
            
            config_data["products"][product_id] = product_data
        
        return config_data
    
    def save_config(self, config_data):
        """Save config data to JSON file"""
        # Ensure directory exists
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Save with pretty formatting
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2, ensure_ascii=False)
    
    def extract_and_save(self):
        """Main extraction process"""
        print("🔍 Reading CSV data...")
        csv_products = self.read_csv_data()
        print(f"📊 Found {len(csv_products)} products in CSV")
        
        print("📁 Loading product markdown files...")
        product_files = self.load_product_files()
        
        print("🔄 Converting to config format...")
        config_data = self.convert_to_config_format(csv_products, product_files)
        
        print("💾 Saving config file...")
        self.save_config(config_data)
        
        print(f"✅ Successfully created config with {len(config_data['products'])} products")
        print(f"📁 Saved to: {self.config_file}")
        
        return config_data

def main():
    print("🚀 CSV to Config Extraction Starting...")
    extractor = CSVToConfigExtractor()
    
    try:
        config_data = extractor.extract_and_save()
        
        print("\n📈 Extraction Summary:")
        print(f"   Total Products: {config_data['metadata']['totalProducts']}")
        print(f"   Total Product Files: {config_data['metadata']['totalProductFiles']}")
        print(f"   Config Version: {config_data['metadata']['version']}")
        print(f"   CSV Source: {config_data['metadata']['source']}")
        print(f"   Products Source: {config_data['metadata']['productsSource']}")
        
        # Show sample of extracted data
        print("\n🎯 Sample Products:")
        for i, (product_id, product) in enumerate(list(config_data['products'].items())[:3]):
            rich_files = product['metadata']['richContentFiles']
            print(f"   {i+1}. {product['name']} ({product['type']}) - {product['pricing']['display']} - {rich_files} rich files")
        
        # Show content types found
        all_content_types = set()
        for product in config_data['products'].values():
            all_content_types.update(product['richContent'].keys())
        
        print(f"\n📚 Rich Content Types Found:")
        for content_type in sorted(all_content_types):
            print(f"   • {content_type}")
        
        print(f"\n✨ All data extracted successfully!")
        print(f"🎨 Ready for React Dashboard with full rich content!")
        
    except Exception as e:
        print(f"❌ Error during extraction: {e}")
        raise

if __name__ == "__main__":
    main() 