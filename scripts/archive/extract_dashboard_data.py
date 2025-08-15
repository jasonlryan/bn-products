#!/usr/bin/env python3
"""
Dashboard Data Extractor
Extracts product data from dashboard HTML files and updates product-config.json
"""

import os
import re
import json
from pathlib import Path
from bs4 import BeautifulSoup
from datetime import datetime

class DashboardDataExtractor:
    def __init__(self, dashboard_dir="../dashboard", config_file="../dashboard-react/config/product-config.json"):
        self.dashboard_dir = Path(dashboard_dir)
        self.config_file = Path(config_file)
        self.products = {}
        
    def extract_from_html(self, html_file):
        """Extract product data from individual HTML file"""
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            
            # Extract basic info
            product_data = {
                "name": self.extract_title(soup),
                "type": "PRODUCT",  # Default, can be overridden
                "content": {
                    "heroTitle": self.extract_hero_title(soup),
                    "heroSubtitle": self.extract_hero_subtitle(soup),
                    "description": self.extract_description(soup),
                    "perfectFor": self.extract_perfect_for(soup)
                },
                "pricing": self.extract_pricing(soup),
                "features": self.extract_features(soup),
                "benefits": self.extract_benefits(soup),
                "testimonial": self.extract_testimonial(soup),
                "keyMessages": self.extract_key_messages(soup),
                "cta": self.extract_cta(soup),
                "metadata": {
                    "extractedFrom": str(html_file),
                    "extractedAt": datetime.now().isoformat(),
                    "source": "dashboard-html"
                }
            }
            
            return product_data
            
        except Exception as e:
            print(f"Error extracting from {html_file}: {e}")
            return None
    
    def extract_title(self, soup):
        """Extract product title"""
        # Try nav logo text first
        nav_logo = soup.find('span', class_='nav-logo-text')
        if nav_logo:
            return nav_logo.get_text().strip()
        
        # Try page title
        title = soup.find('title')
        if title:
            title_text = title.get_text().strip()
            # Remove common suffixes
            title_text = re.sub(r' - .*$', '', title_text)
            return title_text
        
        return "Unknown Product"
    
    def extract_hero_title(self, soup):
        """Extract main hero title"""
        hero_h1 = soup.find('section', class_='hero')
        if hero_h1:
            h1 = hero_h1.find('h1')
            if h1:
                return h1.get_text().strip()
        return ""
    
    def extract_hero_subtitle(self, soup):
        """Extract hero subtitle/description"""
        hero = soup.find('section', class_='hero')
        if hero:
            subhead = hero.find('p', class_='subhead')
            if subhead:
                return subhead.get_text().strip()
        return ""
    
    def extract_description(self, soup):
        """Extract main product description"""
        # Try hero subtitle first
        hero_subtitle = self.extract_hero_subtitle(soup)
        if hero_subtitle:
            return hero_subtitle
        
        # Fallback to first paragraph in main content
        main_p = soup.find('p')
        if main_p:
            return main_p.get_text().strip()
        
        return ""
    
    def extract_perfect_for(self, soup):
        """Extract 'Perfect For' section"""
        perfect_for_section = soup.find('div', class_='product-perfect-for')
        if perfect_for_section:
            p = perfect_for_section.find('p')
            if p:
                return p.get_text().strip()
        return ""
    
    def extract_pricing(self, soup):
        """Extract pricing information"""
        pricing = {}
        
        # Try pricing options (multiple prices)
        pricing_options = soup.find('div', class_='pricing-options')
        if pricing_options:
            options = []
            for option in pricing_options.find_all('div', class_='price-option'):
                name_elem = option.find('h3')
                price_elem = option.find('div', class_='price')
                desc_elem = option.find('p')
                
                if name_elem and price_elem:
                    options.append({
                        "name": name_elem.get_text().strip(),
                        "price": price_elem.get_text().strip(),
                        "description": desc_elem.get_text().strip() if desc_elem else ""
                    })
            
            if options:
                pricing["options"] = options
                # Set main price as range
                prices = [opt["price"] for opt in options]
                pricing["mainPrice"] = f"{prices[0]} - {prices[-1]}" if len(prices) > 1 else prices[0]
        
        # Try single price badge
        price_badge = soup.find('div', class_='price-badge')
        if price_badge and not pricing:
            pricing["mainPrice"] = price_badge.get_text().strip()
        
        # Try product price span
        product_price = soup.find('span', class_='product-price')
        if product_price and not pricing:
            pricing["mainPrice"] = product_price.get_text().strip()
        
        return pricing
    
    def extract_features(self, soup):
        """Extract features list"""
        features = []
        
        # Try features grid
        features_grid = soup.find('div', class_='features-grid')
        if features_grid:
            for feature_item in features_grid.find_all('div', class_='feature-item'):
                icon_elem = feature_item.find('div', class_='feature-icon')
                title_elem = feature_item.find('h3')
                desc_elem = feature_item.find('p')
                
                if title_elem:
                    feature = {
                        "title": title_elem.get_text().strip(),
                        "description": desc_elem.get_text().strip() if desc_elem else "",
                        "icon": icon_elem.get_text().strip() if icon_elem else ""
                    }
                    features.append(feature)
        
        # Try features preview tags
        features_preview = soup.find('div', class_='features-preview')
        if features_preview and not features:
            for tag in features_preview.find_all('span', class_='feature-tag'):
                if 'more' not in tag.get('class', []):
                    features.append({
                        "title": tag.get_text().strip(),
                        "description": "",
                        "icon": ""
                    })
        
        return features
    
    def extract_benefits(self, soup):
        """Extract benefits list"""
        benefits = []
        
        # Try benefits grid
        benefits_grid = soup.find('div', class_='benefits-grid')
        if benefits_grid:
            for benefit_card in benefits_grid.find_all('div', class_='benefit-card'):
                title_elem = benefit_card.find('h3')
                desc_elem = benefit_card.find('p')
                
                if title_elem:
                    benefit = {
                        "title": title_elem.get_text().strip(),
                        "description": desc_elem.get_text().strip() if desc_elem else ""
                    }
                    benefits.append(benefit)
        
        # Try product benefits list
        product_benefits = soup.find('div', class_='product-benefits')
        if product_benefits and not benefits:
            ul = product_benefits.find('ul')
            if ul:
                for li in ul.find_all('li'):
                    if 'more-benefits' not in li.get('class', []):
                        benefits.append({
                            "title": li.get_text().strip(),
                            "description": ""
                        })
        
        return benefits
    
    def extract_testimonial(self, soup):
        """Extract testimonial"""
        testimonial_section = soup.find('section', class_='testimonial')
        if testimonial_section:
            quote_elem = testimonial_section.find('p', class_='testimonial-quote')
            author_elem = testimonial_section.find('p', class_='testimonial-author')
            
            if quote_elem:
                testimonial = {
                    "quote": quote_elem.get_text().strip(),
                    "author": author_elem.get_text().strip().replace('- ', '') if author_elem else ""
                }
                return testimonial
        
        return None
    
    def extract_key_messages(self, soup):
        """Extract key marketing messages"""
        messages = []
        
        messages_grid = soup.find('div', class_='messages-grid')
        if messages_grid:
            for message_item in messages_grid.find_all('div', class_='message-item'):
                h3 = message_item.find('h3')
                if h3:
                    messages.append(h3.get_text().strip())
        
        return messages
    
    def extract_cta(self, soup):
        """Extract call-to-action information"""
        cta = {}
        
        # Try final CTA section
        final_cta = soup.find('section', class_='final-cta')
        if final_cta:
            title_elem = final_cta.find('h2')
            desc_elem = final_cta.find('p')
            button_elem = final_cta.find('a', class_='cta-button-large')
            
            if title_elem:
                cta = {
                    "title": title_elem.get_text().strip(),
                    "description": desc_elem.get_text().strip() if desc_elem else "",
                    "buttonText": button_elem.get_text().strip() if button_elem else "Learn More"
                }
        
        return cta
    
    def extract_from_index(self):
        """Extract product list from index.html"""
        index_file = self.dashboard_dir / "index.html"
        if not index_file.exists():
            print(f"Index file not found: {index_file}")
            return {}
        
        with open(index_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        soup = BeautifulSoup(content, 'html.parser')
        products = {}
        
        # Find all product cards
        product_cards = soup.find_all('a', class_='product-card')
        
        for card in product_cards:
            # Extract basic info from card
            header = card.find('div', class_='product-header')
            if header:
                name_elem = header.find('h3')
                price_elem = header.find('span', class_='product-price')
                type_elem = header.find('span', class_='product-type')
                
                if name_elem:
                    name = name_elem.get_text().strip()
                    
                    # Generate ID from name
                    product_id = re.sub(r'[^a-zA-Z0-9]', '_', name.lower())
                    product_id = re.sub(r'_+', '_', product_id).strip('_')
                    
                    # Extract href for detailed page
                    href = card.get('href', '')
                    
                    products[product_id] = {
                        "name": name,
                        "type": type_elem.get_text().strip().upper() if type_elem else "PRODUCT",
                        "price": price_elem.get_text().strip() if price_elem else "",
                        "detailPage": href,
                        "indexData": {
                            "description": self.extract_card_description(card),
                            "perfectFor": self.extract_card_perfect_for(card),
                            "features": self.extract_card_features(card),
                            "benefits": self.extract_card_benefits(card)
                        }
                    }
        
        return products
    
    def extract_card_description(self, card):
        """Extract description from product card"""
        desc_div = card.find('div', class_='product-description')
        if desc_div:
            p = desc_div.find('p')
            if p:
                return p.get_text().strip()
        return ""
    
    def extract_card_perfect_for(self, card):
        """Extract perfect for from product card"""
        perfect_for_div = card.find('div', class_='product-perfect-for')
        if perfect_for_div:
            p = perfect_for_div.find('p')
            if p:
                return p.get_text().strip()
        return ""
    
    def extract_card_features(self, card):
        """Extract features from product card"""
        features = []
        features_div = card.find('div', class_='features-preview')
        if features_div:
            for tag in features_div.find_all('span', class_='feature-tag'):
                if 'more' not in tag.get('class', []):
                    features.append(tag.get_text().strip())
        return features
    
    def extract_card_benefits(self, card):
        """Extract benefits from product card"""
        benefits = []
        benefits_div = card.find('div', class_='product-benefits')
        if benefits_div:
            ul = benefits_div.find('ul')
            if ul:
                for li in ul.find_all('li'):
                    if 'more-benefits' not in li.get('class', []):
                        benefits.append(li.get_text().strip())
        return benefits
    
    def process_all_products(self):
        """Process all product HTML files"""
        print("🔍 Extracting product data from dashboard HTML files...")
        
        # First, get product list from index
        index_products = self.extract_from_index()
        print(f"📋 Found {len(index_products)} products in index.html")
        
        # Then extract detailed data from individual pages
        for product_id, product_data in index_products.items():
            detail_page = product_data.get('detailPage', '')
            if detail_page:
                detail_file = self.dashboard_dir / detail_page
                if detail_file.exists():
                    print(f"📄 Processing {detail_file.name}...")
                    detailed_data = self.extract_from_html(detail_file)
                    if detailed_data:
                        # Merge index data with detailed data
                        product_data.update(detailed_data)
                        # Keep the price from index if detailed extraction didn't find it
                        if not detailed_data.get('pricing', {}).get('mainPrice'):
                            if product_data.get('price'):
                                product_data['pricing'] = {"mainPrice": product_data['price']}
                else:
                    print(f"⚠️  Detail page not found: {detail_file}")
            
            self.products[product_id] = product_data
        
        print(f"✅ Extracted data for {len(self.products)} products")
        return self.products
    
    def update_config_file(self):
        """Update the product-config.json file"""
        print(f"💾 Updating {self.config_file}...")
        
        # Load existing config if it exists
        existing_config = {}
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    existing_config = json.load(f)
            except Exception as e:
                print(f"⚠️  Could not load existing config: {e}")
        
        # Create new config structure
        new_config = {
            "metadata": {
                "extractedFrom": "dashboard-html",
                "extractedAt": datetime.now().isoformat(),
                "totalProducts": len(self.products),
                "source": "dashboard-data-extractor",
                "version": "2.0.0"
            },
            "products": {}
        }
        
        # Convert extracted data to config format
        for product_id, product_data in self.products.items():
            # Generate a numbered ID (01_, 02_, etc.)
            numbered_id = f"{len(new_config['products']) + 1:02d}_{product_id}"
            
            new_config["products"][numbered_id] = {
                "name": product_data["name"],
                "type": product_data["type"],
                "pricing": product_data.get("pricing", {}),
                "content": product_data.get("content", {}),
                "features": product_data.get("features", []),
                "benefits": product_data.get("benefits", []),
                "testimonial": product_data.get("testimonial"),
                "keyMessages": product_data.get("keyMessages", []),
                "cta": product_data.get("cta", {}),
                "metadata": product_data.get("metadata", {})
            }
        
        # Preserve any existing rich content from Python-generated data
        if "products" in existing_config:
            for product_id, existing_product in existing_config["products"].items():
                if "stages" in existing_product:
                    # Find matching product in new config
                    for new_id, new_product in new_config["products"].items():
                        if (new_product["name"].lower().replace(" ", "_") in product_id.lower() or
                            product_id.lower().replace("_", " ") in new_product["name"].lower()):
                            new_config["products"][new_id]["stages"] = existing_product["stages"]
                            break
        
        # Save updated config
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(new_config, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Updated {self.config_file}")
        print(f"📊 Config now contains {len(new_config['products'])} products")
        
        return new_config

def main():
    print("🚀 Dashboard Data Extractor")
    print("=" * 50)
    
    extractor = DashboardDataExtractor()
    
    # Extract all product data
    products = extractor.process_all_products()
    
    # Update config file
    config = extractor.update_config_file()
    
    print("\n📈 Summary:")
    for product_id, product in products.items():
        name = product.get('name', 'Unknown')
        price = product.get('pricing', {}).get('mainPrice', 'No price')
        features_count = len(product.get('features', []))
        print(f"   {name}: {price}, {features_count} features")
    
    print(f"\n✅ Dashboard data successfully extracted to product-config.json")
    print(f"🎯 Next step: Update React dashboard to use this config file")

if __name__ == "__main__":
    main() 