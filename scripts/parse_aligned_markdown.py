#!/usr/bin/env python3
"""
Parse aligned markdown files to generate landing page content configuration.
Works with the standardized format created by align_markdown_format.py
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Optional

class AlignedMarkdownParser:
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

    def parse_markdown_sections(self, content: str) -> Dict[str, List[str]]:
        """Parse markdown content into sections based on ### headers."""
        sections = {}
        current_section = None
        current_lines = []
        
        for line in content.split('\n'):
            if line.startswith('### Section'):
                # Save previous section
                if current_section:
                    sections[current_section] = current_lines
                
                current_section = line
                current_lines = []
            elif current_section:
                current_lines.append(line)
        
        # Save last section
        if current_section:
            sections[current_section] = current_lines
        
        return sections

    def parse_hero_section(self, lines: List[str]) -> Dict:
        """Parse hero section content."""
        hero = {
            "headline": "",
            "subhead": "",
            "badge": "PRODUCT",
            "price": "",
            "ctaText": "Get started"
        }
        
        # Remove empty lines
        lines = [line.strip() for line in lines if line.strip()]
        
        if len(lines) > 0:
            hero["headline"] = lines[0]
        
        # Find subhead and price
        subhead_parts = []
        for i in range(1, len(lines)):
            line = lines[i]
            if '£' in line:
                hero["price"] = line.strip('👉 ')
            elif line.startswith('[') and line.endswith(']'):
                hero["ctaText"] = line.strip('[]')
            else:
                subhead_parts.append(line)
        
        hero["subhead"] = ' '.join(subhead_parts)
        
        return hero

    def parse_why_section(self, lines: List[str]) -> Dict:
        """Parse Why teams choose this section."""
        benefits = []
        
        for line in lines:
            line = line.strip()
            if line.startswith('- '):
                # Extract benefit
                benefit_text = line[2:]
                
                # Check for bold title format: **Title**: Description
                if '**' in benefit_text and ':' in benefit_text:
                    match = re.match(r'\*\*(.+?)\*\*:\s*(.+)', benefit_text)
                    if match:
                        benefits.append({
                            "title": match.group(1),
                            "description": match.group(2)
                        })
                    else:
                        # Fallback
                        benefits.append({
                            "title": f"Benefit {len(benefits) + 1}",
                            "description": benefit_text
                        })
                else:
                    # Plain benefit
                    benefits.append({
                        "title": f"Benefit {len(benefits) + 1}",
                        "description": benefit_text
                    })
        
        return {
            "title": "Why teams choose this",
            "benefits": benefits[:4]  # Limit to 4
        }

    def parse_how_section(self, lines: List[str]) -> Dict:
        """Parse How it works section."""
        steps = []
        
        for line in lines:
            line = line.strip()
            if line.startswith('- '):
                step_text = line[2:]
                
                # Try to extract verb from the beginning
                if ' – ' in step_text:
                    parts = step_text.split(' – ', 1)
                    verb = parts[0].split()[0] if parts[0] else f"Step {len(steps) + 1}"
                    title = ' '.join(parts[0].split()[1:]) if len(parts[0].split()) > 1 else parts[0]
                    description = parts[1] if len(parts) > 1 else ""
                elif ' — ' in step_text:
                    parts = step_text.split(' — ', 1)
                    verb = parts[0].split()[0] if parts[0] else f"Step {len(steps) + 1}"
                    title = ' '.join(parts[0].split()[1:]) if len(parts[0].split()) > 1 else parts[0]
                    description = parts[1] if len(parts) > 1 else ""
                elif '**' in step_text:
                    # Format: **Verb** rest of text
                    match = re.match(r'\*\*(.+?)\*\*\s*(.+)', step_text)
                    if match:
                        verb = match.group(1)
                        rest = match.group(2)
                        # Split rest into title and description
                        if ' - ' in rest:
                            title, description = rest.split(' - ', 1)
                        else:
                            words = rest.split()
                            title = ' '.join(words[:3]) if len(words) > 3 else rest
                            description = ' '.join(words[3:]) if len(words) > 3 else ""
                    else:
                        verb = f"Step {len(steps) + 1}"
                        title = step_text
                        description = ""
                else:
                    # Try to extract first word as verb
                    words = step_text.split(' ', 2)
                    if len(words) > 0 and len(words[0]) < 15:
                        verb = words[0]
                        title = words[1] if len(words) > 1 else ""
                        description = words[2] if len(words) > 2 else ""
                    else:
                        verb = f"Step {len(steps) + 1}"
                        title = step_text
                        description = ""
                
                steps.append({
                    "verb": verb,
                    "title": title,
                    "description": description
                })
        
        return {
            "title": "How it works",
            "steps": steps[:5]  # Limit to 5
        }

    def parse_testimonial_section(self, lines: List[str]) -> Dict:
        """Parse testimonial section."""
        quote = ""
        attribution = ""
        
        for line in lines:
            line = line.strip()
            if line.startswith('> '):
                text = line[2:]
                if text.startswith('—') or text.startswith('-'):
                    attribution = text.strip('— -')
                else:
                    quote = text.strip('"')
        
        return {
            "title": "What our clients say",
            "testimonial": {
                "quote": quote,
                "attribution": attribution
            }
        }

    def parse_objections_section(self, lines: List[str]) -> Dict:
        """Parse objections section."""
        items = []
        
        for line in lines:
            line = line.strip()
            if line.startswith('- ') and '?' in line:
                # Format: - **Question?** Answer
                objection_text = line[2:]
                if '**' in objection_text:
                    match = re.match(r'\*\*(.+?\?)\*\*\s*(.+)', objection_text)
                    if match:
                        items.append({
                            "question": match.group(1),
                            "answer": match.group(2)
                        })
                else:
                    # Try to split by ?
                    parts = objection_text.split('?', 1)
                    if len(parts) == 2:
                        items.append({
                            "question": parts[0].strip() + "?",
                            "answer": parts[1].strip()
                        })
        
        return {
            "title": "What about...?",
            "items": items[:3]  # Limit to 3
        }

    def parse_offer_section(self, lines: List[str]) -> Dict:
        """Parse offer section."""
        price = ""
        deliverables = []
        outcomes = []
        in_outcomes = False
        
        for line in lines:
            line = line.strip()
            
            if '£' in line and not line.startswith('-'):
                price = line
            elif 'Outcomes' in line or 'outcomes' in line:
                in_outcomes = True
            elif line.startswith('- ') or line.startswith('• '):
                item = line[2:]
                if in_outcomes:
                    outcomes.append(item)
                else:
                    deliverables.append(item)
            elif line and not line.startswith('['):
                # Might be a deliverable without bullet
                if not in_outcomes and line and not line.lower().startswith('deliverables'):
                    deliverables.append(line)
        
        return {
            "title": "What you get",
            "price": price,
            "deliverables": deliverables[:5],
            "outcomes": outcomes[:4],
            "ctaText": "Get started",
            "ctaLink": "#contact"
        }

    def parse_markdown_file(self, filepath: Path, product_info: Dict) -> Dict:
        """Parse a single aligned markdown file."""
        content = filepath.read_text(encoding='utf-8')
        sections = self.parse_markdown_sections(content)
        
        landing_data = {
            "hero": {"badge": product_info["type"]},
            "whyChooseThis": {},
            "howItWorks": {},
            "clientTestimonials": {},
            "objections": {},
            "offer": {}
        }
        
        # Parse each section
        for section_header, lines in sections.items():
            if "Section 1: Hero" in section_header:
                landing_data["hero"] = self.parse_hero_section(lines)
                landing_data["hero"]["badge"] = product_info["type"]
            elif "Section 2: Why teams choose" in section_header:
                landing_data["whyChooseThis"] = self.parse_why_section(lines)
            elif "Section 3: How it works" in section_header:
                landing_data["howItWorks"] = self.parse_how_section(lines)
            elif "Section 4: What our clients say" in section_header:
                landing_data["clientTestimonials"] = self.parse_testimonial_section(lines)
            elif "Section 5: What about" in section_header:
                landing_data["objections"] = self.parse_objections_section(lines)
            elif "Section 6: What you get" in section_header:
                landing_data["offer"] = self.parse_offer_section(lines)
        
        return landing_data

    def generate_config(self):
        """Generate the landing page content configuration."""
        print("🚀 Parsing aligned markdown files...\n")
        
        config = {
            "version": "3.0",
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
            
            try:
                # Parse markdown content
                landing_data = self.parse_markdown_file(md_path, product_info)
                
                # Ensure product name is set
                if landing_data["hero"].get("headline") != product_name:
                    landing_data["hero"]["headline"] = product_name
                
                # Store in config
                config["products"][product_id] = {
                    "name": product_name,
                    "landingPageData": landing_data
                }
                
                print(f"   ✅ Successfully parsed")
                
            except Exception as e:
                print(f"   ❌ Error: {e}")
        
        # Save configuration
        self.config_dir.mkdir(exist_ok=True)
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Configuration saved to: {self.output_file}")
        print(f"📊 Total products configured: {len(config['products'])}")
        
        # Print sample
        if config['products']:
            sample_id = "05_ai_powered_research_and_insight_sprint"
            if sample_id in config['products']:
                sample = config['products'][sample_id]
                print(f"\n🔍 Sample parsed content for {sample['name']}:")
                print(f"   Hero subhead: {sample['landingPageData']['hero'].get('subhead', '')[:60]}...")
                print(f"   Benefits: {len(sample['landingPageData']['whyChooseThis'].get('benefits', []))} items")
                print(f"   Steps: {len(sample['landingPageData']['howItWorks'].get('steps', []))} items")
                print(f"   Testimonial: {bool(sample['landingPageData']['clientTestimonials'].get('testimonial', {}).get('quote'))}")

if __name__ == "__main__":
    parser = AlignedMarkdownParser()
    parser.generate_config()