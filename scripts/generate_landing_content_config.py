#!/usr/bin/env python3
"""
Generate landing page content configuration from markdown files.
Creates a master config file that the compilation service can use
to inject new content without modifying the CSV.
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Optional

class LandingContentGenerator:
    def __init__(self):
        self.markdown_dir = Path("../data/update_270825.md")
        self.config_dir = Path("../config")
        self.output_file = self.config_dir / "landing-page-content.json"
        
        # Map markdown files to product IDs and new names
        self.product_mapping = {
            "power_hour.md": {
                "id": "01_ai_power_hour",
                "name": "AI Power Hour"
            },
            "ai_b_c.md": {
                "id": "02_ai_b_c",
                "name": "AI-B-C™"
            },
            "ai_innovation.md": {
                "id": "03_ai_innovation_programme", 
                "name": "AI Innovation Programme"
            },
            "ai_leadership_partner.md": {
                "id": "04_ai_leadership_partner_fractional_caio",
                "name": "AI Leadership Partner (Fractional CAIO)"
            },
            "ai_sprint.md": {
                "id": "05_ai_powered_research_and_insight_sprint",
                "name": "AI Insight Sprint"
            },
            "ai_sherpa.md": {
                "id": "06_ai_consultancy_retainer",
                "name": "AI Sherpa"
            },
            "ai_acceleration_day.md": {
                "id": "07_ai_innovation_day",
                "name": "AI Acceleration Day"
            },
            "ai_market_intelligence_platform.md": {
                "id": "08_social_intelligence_dashboard",
                "name": "AI Market Intelligence Dashboard"
            }
        }

    def parse_section_content(self, content: str, section_name: str) -> Dict:
        """Parse specific section content based on template structure."""
        lines = content.strip().split('\n')
        
        if section_name == "Hero":
            # First line is title, second is subhead, look for price and CTA
            title = lines[0] if lines else ""
            subhead = lines[1] if len(lines) > 1 else ""
            
            # Extract price from lines containing £
            price = ""
            for line in lines:
                if '£' in line:
                    price = line.strip()
                    break
            
            return {
                "headline": title,
                "subhead": subhead,
                "badge": "PRODUCT",  # Will be updated based on CSV type
                "price": price,
                "ctaText": "Get started"  # Default, can be customized
            }
        
        elif section_name == "Why teams choose this":
            benefits = []
            current_benefit = None
            
            for line in lines:
                if line.strip().startswith('###'):
                    if current_benefit:
                        benefits.append(current_benefit)
                    current_benefit = {
                        "title": line.strip('#').strip(),
                        "description": ""
                    }
                elif current_benefit and line.strip():
                    current_benefit["description"] = line.strip()
            
            if current_benefit:
                benefits.append(current_benefit)
            
            return {
                "title": "Why teams choose this",
                "benefits": benefits[:4]  # Limit to 4
            }
        
        elif section_name == "How it works":
            steps = []
            current_step = None
            
            for line in lines:
                if line.strip().startswith('###'):
                    if current_step:
                        steps.append(current_step)
                    # Extract verb and title from format "### Verb: Title"
                    step_text = line.strip('#').strip()
                    if ':' in step_text:
                        verb, title = step_text.split(':', 1)
                    else:
                        verb = f"Step {len(steps) + 1}"
                        title = step_text
                    
                    current_step = {
                        "verb": verb.strip(),
                        "title": title.strip(),
                        "description": ""
                    }
                elif current_step and line.strip():
                    current_step["description"] = line.strip()
            
            if current_step:
                steps.append(current_step)
            
            return {
                "title": "How it works",
                "steps": steps[:5]  # Limit to 5
            }
        
        elif section_name == "Client testimonials":
            # Extract quote and attribution
            quote = ""
            attribution = ""
            
            for line in lines:
                if line.strip().startswith('"') or (quote and not attribution):
                    quote += line.strip() + " "
                elif line.strip().startswith('—') or line.strip().startswith('-'):
                    attribution = line.strip(' —-')
            
            return {
                "title": "What our clients say",
                "testimonial": {
                    "quote": quote.strip(' "'),
                    "attribution": attribution
                }
            }
        
        elif section_name == "What about...?":
            items = []
            current_qa = None
            
            for line in lines:
                if line.strip().startswith('###'):
                    if current_qa:
                        items.append(current_qa)
                    current_qa = {
                        "question": line.strip('#').strip(' ?'),
                        "answer": ""
                    }
                elif current_qa and line.strip():
                    current_qa["answer"] = line.strip()
            
            if current_qa:
                items.append(current_qa)
            
            return {
                "title": "What about...?",
                "items": items[:3]  # Limit to 3
            }
        
        elif section_name == "What you get":
            deliverables = []
            outcomes = []
            price = ""
            in_outcomes = False
            
            for line in lines:
                if '£' in line and not price:
                    price = line.strip()
                elif line.strip().startswith('###') and 'Outcomes' in line:
                    in_outcomes = True
                elif line.strip().startswith('-') or line.strip().startswith('•'):
                    item = line.strip(' -•')
                    if in_outcomes:
                        outcomes.append(item)
                    else:
                        deliverables.append(item)
            
            return {
                "title": "What you get",
                "price": price,
                "deliverables": deliverables[:5],
                "outcomes": outcomes[:4],
                "ctaText": "Get started",
                "ctaLink": "#contact"
            }
        
        return {}

    def parse_markdown_file(self, md_path: Path) -> Dict:
        """Parse a markdown file and extract all sections."""
        content = md_path.read_text(encoding='utf-8')
        
        # Split by ## headers
        sections = {}
        current_section = None
        current_content = []
        
        for line in content.split('\n'):
            if line.startswith('## '):
                if current_section:
                    sections[current_section] = '\n'.join(current_content)
                current_section = line.strip('#').strip()
                current_content = []
            elif current_section:
                current_content.append(line)
        
        if current_section:
            sections[current_section] = '\n'.join(current_content)
        
        # Parse each section according to template
        landing_data = {
            "hero": self.parse_section_content(sections.get("Hero", ""), "Hero"),
            "whyChooseThis": self.parse_section_content(sections.get("Why teams choose this", ""), "Why teams choose this"),
            "howItWorks": self.parse_section_content(sections.get("How it works", ""), "How it works"),
            "clientTestimonials": self.parse_section_content(sections.get("Client testimonials", ""), "Client testimonials"),
            "objections": self.parse_section_content(sections.get("What about...?", ""), "What about...?"),
            "offer": self.parse_section_content(sections.get("What you get", ""), "What you get")
        }
        
        return landing_data

    def generate_config(self):
        """Generate the master landing page content configuration."""
        print("🚀 Generating landing page content configuration...\n")
        
        config = {
            "version": "1.0",
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
            landing_data = self.parse_markdown_file(md_path)
            
            # Update hero section with product name
            landing_data["hero"]["headline"] = product_name
            
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
        
        return config

    def update_compilation_service_hint(self):
        """Print instructions for updating the compilation service."""
        print("\n📝 Next steps to integrate this config:")
        print("1. Update the compilation service to read from landing-page-content.json")
        print("2. Modify marketingCompiler.ts to use this content during compilation")
        print("3. Run compilation for all products to update Redis")
        print("4. Clear browser cache and refresh the UI")
        
        print("\n💡 Example code to add to marketingCompiler.ts:")
        print("""
// Load landing page content config
import landingConfig from '../config/landing-page-content.json'

// In compileMarketingPage function:
const landingData = landingConfig.products[product.id]?.landingPageData
if (landingData) {
  // Use landingData in compilation
  compiledContent.landingPageData = landingData
}
""")

if __name__ == "__main__":
    generator = LandingContentGenerator()
    config = generator.generate_config()
    generator.update_compilation_service_hint()