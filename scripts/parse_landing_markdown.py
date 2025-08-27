#!/usr/bin/env python3
"""
Parse landing page markdown files with the actual format used.
The files use "Section N:" format instead of ## headers.
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Optional

class LandingMarkdownParser:
    def __init__(self):
        self.markdown_dir = Path("../data/update_270825_aligned")
        self.config_dir = Path("../config")
        self.output_file = self.config_dir / "landing-page-content.json"
        
        # Map markdown files to product IDs and types
        self.product_mapping = {
            "power_hour.md": {
                "id": "01_ai_power_hour",
                "name": "AI Power Hour",
                "type": "PRODUCT"
            },
            "ai_b_c.md": {
                "id": "02_ai_b_c",
                "name": "AI-B-C™",
                "type": "PRODUCT"
            },
            "ai_innovation.md": {
                "id": "03_ai_innovation_programme", 
                "name": "AI Innovation Programme",
                "type": "SERVICE"
            },
            "ai_leadership_partner.md": {
                "id": "04_ai_leadership_partner_fractional_caio",
                "name": "AI Leadership Partner (Fractional CAIO)",
                "type": "SERVICE"
            },
            "ai_sprint.md": {
                "id": "05_ai_powered_research_and_insight_sprint",
                "name": "AI Insight Sprint",
                "type": "PRODUCT"
            },
            "ai_sherpa.md": {
                "id": "06_ai_consultancy_retainer",
                "name": "AI Sherpa",
                "type": "SERVICE"
            },
            "ai_acceleration_day.md": {
                "id": "07_ai_innovation_day",
                "name": "AI Acceleration Day",
                "type": "PRODUCT"
            },
            "ai_market_intelligence_platform.md": {
                "id": "08_social_intelligence_dashboard",
                "name": "AI Market Intelligence Dashboard",
                "type": "PRODUCT"
            }
        }

    def parse_markdown_file(self, md_path: Path, product_info: Dict) -> Dict:
        """Parse a markdown file with Section N: format."""
        content = md_path.read_text(encoding='utf-8')
        lines = content.strip().split('\n')
        
        # Extract hero section from top lines
        hero_headline = product_info["name"]
        hero_subhead = ""
        hero_price = ""
        hero_cta = "Get started"
        
        # First few lines are hero content
        if len(lines) > 0:
            hero_headline = lines[0].strip()
        if len(lines) > 1:
            hero_subhead = lines[1].strip()
        if len(lines) > 2:
            # Continue reading until we find price or section
            for i in range(2, min(10, len(lines))):
                if '£' in lines[i]:
                    hero_price = lines[i].strip('👉 []')
                    break
                elif lines[i].strip().startswith('[') and lines[i].strip().endswith(']'):
                    hero_cta = lines[i].strip('[]')
                elif lines[i].strip() and not lines[i].startswith('Section'):
                    hero_subhead += " " + lines[i].strip()
        
        # Parse sections
        sections = {}
        current_section = None
        section_content = []
        
        for line in lines:
            # Check for section headers
            if line.startswith('Section'):
                if current_section:
                    sections[current_section] = '\n'.join(section_content)
                
                # Extract section name
                match = re.match(r'Section \d+:\s*(.+?)(?:\s*\(Frame \d+\))?', line)
                if match:
                    current_section = match.group(1).strip()
                    section_content = []
            elif current_section:
                # Skip visual instructions in curly braces
                if not (line.strip().startswith('{') and line.strip().endswith('}')):
                    section_content.append(line)
        
        # Save last section
        if current_section:
            sections[current_section] = '\n'.join(section_content)
        
        # Build landing page data structure
        landing_data = {
            "hero": {
                "headline": hero_headline,
                "subhead": hero_subhead.strip(),
                "badge": product_info["type"],
                "price": hero_price,
                "ctaText": hero_cta
            },
            "whyChooseThis": self._parse_why_section(sections.get("Why teams choose the " + hero_headline, "")),
            "howItWorks": self._parse_how_section(sections.get("How it works", "")),
            "clientTestimonials": self._parse_testimonial_section(sections.get("What our clients say", "")),
            "objections": self._parse_objections_section(sections.get("What about…?", "")),
            "offer": self._parse_offer_section(sections.get("What you get", ""))
        }
        
        return landing_data

    def _parse_why_section(self, content: str) -> Dict:
        """Parse Why teams choose this section."""
        benefits = []
        lines = content.strip().split('\n')
        
        for line in lines:
            if ':' in line and not line.startswith('Layout'):
                parts = line.split(':', 1)
                if len(parts) == 2:
                    benefits.append({
                        "title": parts[0].strip(),
                        "description": parts[1].strip()
                    })
        
        return {
            "title": "Why teams choose this",
            "benefits": benefits[:4]
        }

    def _parse_how_section(self, content: str) -> Dict:
        """Parse How it works section."""
        steps = []
        lines = content.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if line and not line.startswith('{') and not line.startswith('('):
                # Try to extract verb from various formats
                if ' – ' in line:
                    parts = line.split(' – ', 1)
                    verb_title = parts[0]
                    description = parts[1] if len(parts) > 1 else ""
                elif ' — ' in line:
                    parts = line.split(' — ', 1)
                    verb_title = parts[0]
                    description = parts[1] if len(parts) > 1 else ""
                else:
                    verb_title = line
                    description = ""
                
                # Split verb and title if space exists
                verb_parts = verb_title.split(' ', 1)
                if len(verb_parts) > 1:
                    verb = verb_parts[0]
                    title = verb_parts[1]
                else:
                    verb = f"Step {len(steps) + 1}"
                    title = verb_title
                
                steps.append({
                    "verb": verb,
                    "title": title,
                    "description": description
                })
        
        return {
            "title": "How it works",
            "steps": steps[:5]
        }

    def _parse_testimonial_section(self, content: str) -> Dict:
        """Parse testimonial section."""
        lines = content.strip().split('\n')
        quote = ""
        attribution = ""
        
        for line in lines:
            line = line.strip()
            if line.startswith('"') or (quote and not line.startswith('—')):
                quote += line.strip('"') + " "
            elif line.startswith('—') or line.startswith('-'):
                attribution = line.strip('— -')
        
        return {
            "title": "What our clients say",
            "testimonial": {
                "quote": quote.strip(),
                "attribution": attribution
            }
        }

    def _parse_objections_section(self, content: str) -> Dict:
        """Parse objections section."""
        items = []
        lines = content.strip().split('\n')
        
        for line in lines:
            if '?' in line and not line.startswith('Layout'):
                parts = line.split('?', 1)
                if len(parts) == 2:
                    items.append({
                        "question": parts[0].strip() + "?",
                        "answer": parts[1].strip()
                    })
        
        return {
            "title": "What about...?",
            "items": items[:3]
        }

    def _parse_offer_section(self, content: str) -> Dict:
        """Parse offer section."""
        lines = content.strip().split('\n')
        price = ""
        deliverables = []
        outcomes = []
        in_outcomes = False
        
        for line in lines:
            line = line.strip()
            if '£' in line:
                price = line
            elif 'Outcomes' in line:
                in_outcomes = True
            elif line.startswith('-') or line.startswith('•'):
                item = line.strip('- •')
                if in_outcomes:
                    outcomes.append(item)
                else:
                    deliverables.append(item)
            elif line and not line.startswith('Deliverables') and not line.startswith('['):
                # Regular line that might be a deliverable
                if not in_outcomes and line:
                    deliverables.append(line)
        
        return {
            "title": "What you get",
            "price": price,
            "deliverables": deliverables[:5],
            "outcomes": outcomes[:4],
            "ctaText": "Get started",
            "ctaLink": "#contact"
        }

    def generate_config(self):
        """Generate the landing page content configuration."""
        print("🚀 Parsing landing page markdown files...\n")
        
        config = {
            "version": "2.0",
            "generated_at": "2025-08-27",
            "products": {}
        }
        
        for md_file, product_info in self.product_mapping.items():
            md_path = self.markdown_dir / md_file
            
            if not md_path.exists():
                print(f"⚠️  Markdown file not found: {md_path}")
                continue
            
            product_id = product_info["id"]
            product_name = product_info["name"]
            
            print(f"📄 Processing {product_name}...")
            
            # Parse markdown content
            landing_data = self.parse_markdown_file(md_path, product_info)
            
            # Store in config
            config["products"][product_id] = {
                "name": product_name,
                "landingPageData": landing_data
            }
        
        # Save configuration
        self.config_dir.mkdir(exist_ok=True)
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Configuration saved to: {self.output_file}")
        print(f"📊 Total products configured: {len(config['products'])}")
        
        # Print sample of parsed content
        if config['products']:
            sample_id = list(config['products'].keys())[0]
            sample = config['products'][sample_id]
            print(f"\n🔍 Sample parsed content for {sample['name']}:")
            print(f"   Hero: {sample['landingPageData']['hero']['subhead'][:60]}...")
            print(f"   Benefits: {len(sample['landingPageData']['whyChooseThis']['benefits'])} items")
            print(f"   Steps: {len(sample['landingPageData']['howItWorks']['steps'])} items")

if __name__ == "__main__":
    parser = LandingMarkdownParser()
    parser.generate_config()