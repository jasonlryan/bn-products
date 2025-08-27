#!/usr/bin/env python3
"""
Inject markdown content from /data/update_270825.md/ into product configuration
without modifying the CSV. This updates the product_context.json files with
the new content while preserving the existing pipeline structure.
"""

import json
import re
from pathlib import Path
from typing import Dict, Optional

class MarkdownContentInjector:
    def __init__(self):
        self.markdown_dir = Path("../data/update_270825.md")
        self.products_dir = Path("../products")
        
        # Map markdown files to product IDs
        self.product_mapping = {
            "ai_power_hour.md": "01_ai_power_hour",
            "ai_abc.md": "02_ai_b_c",
            "ai_innovation_programme.md": "03_ai_innovation_programme",
            "ai_leadership_partner.md": "04_ai_leadership_partner_fractional_caio",
            "ai_sprint.md": "05_ai_powered_research_and_insight_sprint",
            "ai_sherpa.md": "06_ai_consultancy_retainer",
            "ai_acceleration_day.md": "07_ai_innovation_day",
            "ai_market_intelligence.md": "08_social_intelligence_dashboard"
        }
        
        # New product names from markdown files
        self.new_names = {
            "05_ai_powered_research_and_insight_sprint": "AI Insight Sprint",
            "06_ai_consultancy_retainer": "AI Sherpa",
            "07_ai_innovation_day": "AI Acceleration Day",
            "08_social_intelligence_dashboard": "AI Market Intelligence Dashboard"
        }

    def parse_markdown_content(self, md_path: Path) -> Dict:
        """Parse markdown file and extract structured content."""
        content = md_path.read_text(encoding='utf-8')
        lines = content.strip().split('\n')
        
        parsed = {
            'name': lines[0].strip('#').strip() if lines else '',
            'sections': {}
        }
        
        current_section = None
        current_content = []
        
        for line in lines[1:]:
            if line.startswith('## '):
                if current_section:
                    parsed['sections'][current_section] = '\n'.join(current_content).strip()
                current_section = line.strip('#').strip()
                current_content = []
            elif current_section:
                current_content.append(line)
        
        if current_section:
            parsed['sections'][current_section] = '\n'.join(current_content).strip()
        
        return parsed

    def update_product_context(self, product_id: str, md_content: Dict) -> bool:
        """Update product_context.json with new content from markdown."""
        context_path = self.products_dir / product_id / "product_context.json"
        
        if not context_path.exists():
            print(f"❌ Product context not found: {context_path}")
            return False
        
        try:
            # Load existing context
            with open(context_path, 'r', encoding='utf-8') as f:
                context = json.load(f)
            
            # Update name if needed
            if product_id in self.new_names:
                context['name'] = self.new_names[product_id]
            
            # Extract key content from markdown sections
            sections = md_content.get('sections', {})
            
            # Update description from Hero section
            hero = sections.get('Hero', '')
            if hero:
                # Extract subhead (second line after title)
                lines = hero.strip().split('\n')
                if len(lines) >= 2:
                    context['description'] = lines[1].strip()
            
            # Update benefits from Why teams choose this
            why_choose = sections.get('Why teams choose this', '')
            if why_choose:
                benefits = []
                for line in why_choose.split('\n'):
                    if line.strip().startswith('###'):
                        benefit = line.strip('#').strip()
                        benefits.append(f"- {benefit}")
                if benefits:
                    context['benefits'] = '\n'.join(benefits[:4])  # Top 4 benefits
            
            # Update key features from How it works
            how_works = sections.get('How it works', '')
            if how_works:
                features = []
                for line in how_works.split('\n'):
                    if line.strip().startswith('###'):
                        feature = line.strip('#').strip()
                        features.append(f"- {feature}")
                if features:
                    context['keyFeatures'] = '\n'.join(features[:4])  # Top 4 features
            
            # Save updated context
            with open(context_path, 'w', encoding='utf-8') as f:
                json.dump(context, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Updated {product_id}: {context['name']}")
            return True
            
        except Exception as e:
            print(f"❌ Error updating {product_id}: {e}")
            return False

    def inject_all_content(self):
        """Process all markdown files and update product contexts."""
        print("🚀 Starting markdown content injection...\n")
        
        success_count = 0
        total_count = len(self.product_mapping)
        
        for md_file, product_id in self.product_mapping.items():
            md_path = self.markdown_dir / md_file
            
            if not md_path.exists():
                print(f"⚠️  Markdown file not found: {md_path}")
                continue
            
            # Parse markdown content
            md_content = self.parse_markdown_content(md_path)
            
            # Update product context
            if self.update_product_context(product_id, md_content):
                success_count += 1
        
        print(f"\n✅ Completed: {success_count}/{total_count} products updated")
        print("\n📝 Next steps:")
        print("1. Run the compilation script to update Redis")
        print("2. Clear browser cache and refresh the UI")

if __name__ == "__main__":
    injector = MarkdownContentInjector()
    injector.inject_all_content()