#!/usr/bin/env python3

import os
import re
import json
import glob
from datetime import datetime
from typing import Dict, List, Optional
import argparse
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ProductConfigGenerator:
    def __init__(self, products_dir: str, output_file: str, schema_file: str):
        # Convert to absolute paths
        self.root_dir = Path(__file__).parent.parent
        self.products_dir = self._resolve_path(products_dir)
        self.output_file = self._resolve_path(output_file)
        self.schema_file = self._resolve_path(schema_file)
        
        # Create directories if they don't exist
        self.output_file.parent.mkdir(parents=True, exist_ok=True)
        
        self.existing_config = self._load_existing_config()
        self.schema = self._load_schema()

    def _resolve_path(self, path: str) -> Path:
        """Convert relative paths to absolute paths."""
        p = Path(path)
        if not p.is_absolute():
            p = self.root_dir / p
        return p

    def _load_existing_config(self) -> dict:
        """Load existing config file if it exists."""
        if self.output_file.exists():
            try:
                with open(self.output_file, 'r') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON in {self.output_file}. Starting fresh.")
                return {"products": {}}
        return {"products": {}}

    def _load_schema(self) -> dict:
        """Load JSON schema for validation."""
        try:
            with open(self.schema_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logger.error(f"Failed to load schema from {self.schema_file}: {e}")
            raise

    def _parse_md_metadata(self, content: str) -> dict:
        """Extract metadata from MD file."""
        metadata = {
            "generated_date": None,
            "model": None,
            "prompt_used": None,
            "context_used": []
        }
        
        # Extract generation metadata
        date_match = re.search(r'\*\*Generated on:\*\* (.+)', content)
        if date_match:
            metadata["generated_date"] = date_match.group(1)

        model_match = re.search(r'\*\*Model:\*\* (.+)', content)
        if model_match:
            metadata["model"] = model_match.group(1)

        # Extract prompt
        prompt_section = re.search(r'## Original Prompt\n(.*?)\n---', content, re.DOTALL)
        if prompt_section:
            metadata["prompt_used"] = prompt_section.group(1).strip()

        # Extract context
        context_section = re.search(r'## Context Used\n(.*?)\n(?:---|$)', content, re.DOTALL)
        if context_section:
            metadata["context_used"] = [
                line.strip('- ') for line in context_section.group(1).splitlines() 
                if line.strip()
            ]

        return metadata

    def _parse_md_content(self, content: str, stage_type: str) -> dict:
        """Parse MD content based on stage type."""
        # First try to extract the Generated Output section
        output_section = re.search(r'## Generated Output\n(.*?)(?:\n---|\n\n##|\Z)', content, re.DOTALL)
        if not output_section:
            return {"raw_content": content}
        
        output_content = output_section.group(1).strip()
        
        # Parse based on stage type
        if stage_type == "manifesto":
            return self._parse_manifesto(output_content)
        elif stage_type == "functional_spec":
            return self._parse_functional_spec(output_content)
        elif stage_type == "audience_icps":
            return self._parse_audience_icps(output_content)
        elif stage_type == "user_stories":
            return self._parse_user_stories(output_content)
        elif stage_type == "competitor_sweep":
            return self._parse_competitor_sweep(output_content)
        elif stage_type == "tam_sizing":
            return self._parse_tam_sizing(output_content)
        elif stage_type == "prd_skeleton":
            return self._parse_prd(output_content)
        elif stage_type == "ui_prompt":
            return self._parse_ui_prompt(output_content)
        elif stage_type == "generate_screens":
            return self._parse_screens(output_content)
        elif stage_type == "landing_page_copy":
            return self._parse_landing_copy(output_content)
        elif stage_type == "key_messages":
            return self._parse_key_messages(output_content)
        elif stage_type == "investor_deck":
            return self._parse_investor_deck(output_content)
        elif stage_type == "demo_script":
            return self._parse_demo_script(output_content)
        elif stage_type == "slide_headlines":
            return self._parse_slide_headlines(output_content)
        elif stage_type == "qa_prep":
            return self._parse_qa_prep(output_content)
        
        return {"raw_content": output_content}

    def _parse_manifesto(self, content: str) -> dict:
        """Parse manifesto content."""
        manifesto = {}
        sections = ["Problem:", "Audience:", "Solution:", "Magic Moment:", "Why Excited:"]
        
        for section in sections:
            pattern = f"\\*\\*{section}\\*\\*\\s*([^*]+)"
            match = re.search(pattern, content)
            if match:
                key = section.lower().rstrip(':').replace(' ', '_')
                manifesto[key] = match.group(1).strip()
        
        return manifesto

    def _parse_functional_spec(self, content: str) -> dict:
        """Parse functional spec content."""
        spec = {
            "overview": "",
            "inputs": [],
            "process": [],
            "outputs": [],
            "limitations": []
        }
        
        sections = {
            "Overview": "overview",
            "Inputs": "inputs",
            "Process": "process",
            "Outputs": "outputs",
            "Limitations": "limitations"
        }
        
        for section, key in sections.items():
            pattern = f"\\*\\*{section}\\*\\*\\s*([^#]+)"
            match = re.search(pattern, content)
            if match:
                content = match.group(1).strip()
                if key == "overview":
                    spec[key] = content
                else:
                    spec[key] = [item.strip('• ').strip() for item in content.split('\n') if item.strip()]
        
        return spec

    def _parse_audience_icps(self, content: str) -> dict:
        """Parse audience ICPs content."""
        icps = []
        icp_sections = re.finditer(r'\*\*Ideal Customer Profile \d+:\*\*\s*(.*?)(?=\*\*Ideal Customer Profile|\Z)', content, re.DOTALL)
        
        for icp in icp_sections:
            icp_content = icp.group(1).strip()
            profile = {}
            
            # Extract sections
            sections = {
                "Profile": "profile",
                "Motivations": "motivations",
                "Pain Points": "pain_points",
                "Typical Day": "typical_day",
                "What Success Looks Like": "success_looks_like"
            }
            
            for section, key in sections.items():
                pattern = f"\\*\\*{section}:\\*\\*\\s*([^*]+)"
                match = re.search(pattern, icp_content)
                if match:
                    profile[key] = match.group(1).strip()
            
            if profile:
                icps.append(profile)
        
        return {"icps": icps}

    def _parse_user_stories(self, content: str) -> dict:
        """Parse user stories content."""
        stories = []
        story_pattern = r'As (.*?), I want (.*?), so that (.*?)(?=\n|$)'
        
        matches = re.finditer(story_pattern, content)
        for i, match in enumerate(matches, 1):
            stories.append({
                "as_a": match.group(1).strip(),
                "i_want": match.group(2).strip(),
                "so_that": match.group(3).strip(),
                "priority": i
            })
        
        return {"stories": stories}

    def _parse_competitor_sweep(self, content: str) -> dict:
        """Parse competitor sweep content."""
        competitors = []
        competitor_sections = re.finditer(r'\*\*Competing Product \d+:.*?\*\*(.*?)(?=\*\*Competing Product|\Z)', content, re.DOTALL)
        
        for comp in competitor_sections:
            comp_content = comp.group(1).strip()
            competitor = {}
            
            sections = {
                "Value Prop": "value_prop",
                "Pricing": "pricing",
                "Strength": "strength",
                "Weakness": "weakness",
                "Gap we exploit": "gap_we_exploit"
            }
            
            for section, key in sections.items():
                pattern = f"\\*\\*{section}:\\*\\*\\s*([^*]+)"
                match = re.search(pattern, comp_content)
                if match:
                    competitor[key] = match.group(1).strip()
            
            if competitor:
                competitors.append(competitor)
        
        return {"competitors": competitors}

    def _parse_tam_sizing(self, content: str) -> dict:
        """Parse TAM sizing content."""
        tam = {}
        
        # Extract market size
        market_size_section = re.search(r'TAM = (.*?)(?=\n|$)', content)
        if market_size_section:
            tam["market_size"] = {
                "total": market_size_section.group(1).strip(),
                "equation": market_size_section.group(0).strip()
            }
        
        # Extract assumptions
        assumptions_section = re.search(r'assumptions:(.*?)(?=\n\n|\Z)', content, re.DOTALL | re.IGNORECASE)
        if assumptions_section:
            tam["assumptions"] = [
                assumption.strip('• ').strip()
                for assumption in assumptions_section.group(1).split('\n')
                if assumption.strip()
            ]
        
        return tam

    def _parse_prd(self, content: str) -> dict:
        """Parse PRD content."""
        prd = {}
        sections = {
            "Goal": "goal",
            "Personas": "personas",
            "User Stories": "user_stories",
            "MVP": "mvp",
            "Success Metrics": "success_metrics",
            "Risks": "risks"
        }
        
        for section, key in sections.items():
            pattern = f"\\*\\*{section}:\\*\\*\\s*(.*?)(?=\\*\\*|\\Z)"
            match = re.search(pattern, content, re.DOTALL)
            if match:
                content = match.group(1).strip()
                if key in ["success_metrics", "risks"]:
                    prd[key] = [item.strip('• ').strip() for item in content.split('\n') if item.strip()]
                else:
                    prd[key] = content
        
        return prd

    def _parse_ui_prompt(self, content: str) -> dict:
        """Parse UI prompt content."""
        ui = {
            "design_system": {
                "colors": [],
                "typography": {"styles": []}
            },
            "components": []
        }
        
        # Extract design system
        design_section = re.search(r'Overall Style and Direction(.*?)(?=\n\n|\Z)', content, re.DOTALL)
        if design_section:
            ui["design_system"]["description"] = design_section.group(1).strip()
        
        # Extract components/screens
        screen_sections = re.finditer(r'\*\*(\d+\. .*?):\*\*(.*?)(?=\*\*\d+\.|\Z)', content, re.DOTALL)
        for screen in screen_sections:
            ui["components"].append({
                "name": screen.group(1).strip(),
                "description": screen.group(2).strip(),
                "elements": []
            })
        
        return ui

    def _parse_screens(self, content: str) -> dict:
        """Parse screen generation content."""
        screens = []
        screen_sections = re.finditer(r'\*\*(\d+\. .*?):\*\*(.*?)(?=\*\*\d+\.|\Z)', content, re.DOTALL)
        
        for screen in screen_sections:
            screens.append({
                "name": screen.group(1).strip(),
                "layout": screen.group(2).strip()
            })
        
        return {"screens": screens}

    def _parse_landing_copy(self, content: str) -> dict:
        """Parse landing page copy content."""
        landing = {}
        sections = {
            "Headline": "headline",
            "Subhead": "subheadline",
            "Benefit Bullets": "benefits",
            "Primary CTA": "cta",
            "Testimonial": "testimonial"
        }
        
        for section, key in sections.items():
            pattern = f"\\*\\*{section}:\\*\\*\\s*(.*?)(?=\\*\\*|\\Z)"
            match = re.search(pattern, content, re.DOTALL)
            if match:
                content = match.group(1).strip()
                if key == "benefits":
                    landing[key] = [item.strip('• ').strip() for item in content.split('\n') if item.strip()]
                else:
                    landing[key] = content
        
        return landing

    def _parse_key_messages(self, content: str) -> dict:
        """Parse key messages content."""
        messages = []
        message_pattern = r'"\d*\.\s*"?(.*?)"?\s*(?=\n|$)'
        
        matches = re.finditer(message_pattern, content)
        for match in matches:
            message = match.group(1).strip('"').strip()
            if message:
                messages.append(message)
        
        return {
            "messages": messages
        }

    def _parse_investor_deck(self, content: str) -> dict:
        """Parse investor deck content."""
        deck = {}
        sections = {
            "Vision": "vision",
            "Problem": "problem",
            "Solution": "solution",
            "Market Opportunity": "market",
            "Positioning": "positioning",
            "Business Model": "business_model",
            "Competitive Landscape": "competition",
            "Ask": "ask",
            "Closing Statement": "closing"
        }
        
        for section, key in sections.items():
            pattern = f"\\*\\*{section}:\\*\\*\\s*(.*?)(?=\\*\\*|\\Z)"
            match = re.search(pattern, content, re.DOTALL)
            if match:
                deck[key] = match.group(1).strip()
        
        return deck

    def _parse_demo_script(self, content: str) -> dict:
        """Parse demo script content."""
        script = {}
        sections = {
            "Hook": "hook",
            "Live Flow": "flow",
            "Wow Moment": "wow",
            "Call to Action": "cta"
        }
        
        for section, key in sections.items():
            pattern = f"\\*\\*\\[{section}\\]\\*\\*.*?Duration: .*?seconds\\*(.*?)(?=\\*\\*\\[|\\Z)"
            match = re.search(pattern, content, re.DOTALL)
            if match:
                script[key] = match.group(1).strip()
        
        return script

    def _parse_slide_headlines(self, content: str) -> dict:
        """Parse slide headlines content."""
        slides = []
        slide_sections = re.finditer(r'### Slide \d+: \*\*(.*?)\*\*\n- \*\*Content Overview:\*\*(.*?)(?=### Slide|\Z)', content, re.DOTALL)
        
        for slide in slide_sections:
            slides.append({
                "headline": slide.group(1).strip(),
                "content": slide.group(2).strip()
            })
        
        return {"slides": slides}

    def _parse_qa_prep(self, content: str) -> dict:
        """Parse Q&A prep content."""
        qa_pairs = []
        qa_sections = re.finditer(r'\*\*Question: (.*?)\*\*\n\n\s+\*\*Answer:\*\* (.*?)(?=\n\n\d+\.|$)', content, re.DOTALL)
        
        for qa in qa_sections:
            qa_pairs.append({
                "question": qa.group(1).strip(),
                "answer": qa.group(2).strip()
            })
        
        return {"qa_pairs": qa_pairs}

    def _get_stage_type(self, filename: str) -> str:
        """Determine stage type from filename."""
        stage_patterns = {
            r'01_big_idea_product_manifesto': 'manifesto',
            r'02_idea_exploration_functional_spec': 'functional_spec',
            r'03_idea_exploration_audience_icps': 'audience_icps',
            # Add patterns for other stages
        }
        
        for pattern, stage_type in stage_patterns.items():
            if re.search(pattern, filename):
                return stage_type
        return 'unknown'

    def process_product_files(self) -> None:
        """Process all product files and generate/update config."""
        # Get all MD files
        md_files = glob.glob(str(self.products_dir / "*.md"))
        
        # Group files by product
        products = {}
        for file in md_files:
            filename = os.path.basename(file)
            product_id = filename.split('_')[0]
            if product_id not in products:
                products[product_id] = []
            products[product_id].append(file)

        # Process each product
        for product_id, files in products.items():
            logger.info(f"Processing product {product_id}")
            self._process_single_product(product_id, files)

        # Save updated config
        self._save_config()

    def _process_single_product(self, product_id: str, files: List[str]) -> None:
        """Process files for a single product."""
        # Get the product name from the first file
        filename = os.path.basename(files[0])
        parts = filename.split('_')
        
        # Extract product name by joining all parts between the ID and the stage number
        product_name_parts = []
        for part in parts[1:]:
            if part.isdigit():  # Stop when we hit a number (stage number)
                break
            product_name_parts.append(part)
        
        product_key = f"{product_id}_{'_'.join(product_name_parts)}"
        
        # Initialize or get existing product config
        if product_key in self.existing_config["products"]:
            product_config = self.existing_config["products"][product_key]
            logger.info(f"Updating existing product: {product_key}")
        else:
            product_config = {
                "name": " ".join(product_name_parts).title(),
                "type": "PRODUCT",  # Default, could be extracted from content
                "stages": {
                    "foundation": {},
                    "planning": {},
                    "research": {},
                    "build": {},
                    "demo": {}
                }
            }
            logger.info(f"Creating new product: {product_key}")

        # Process each file
        for file in files:
            self._process_single_file(file, product_config)

        # Update config
        self.existing_config["products"][product_key] = product_config

    def _process_single_file(self, file: str, product_config: dict) -> None:
        """Process a single MD file and update product config."""
        filename = os.path.basename(file)
        stage_type = self._get_stage_type(filename)
        
        with open(file, 'r') as f:
            content = f.read()

        # Extract metadata
        metadata = self._parse_md_metadata(content)
        
        # Parse content based on stage type
        stage_content = self._parse_md_content(content, stage_type)
        
        # Determine stage category and name
        stage_info = self._categorize_stage(filename)
        if not stage_info:
            logger.warning(f"Could not categorize stage for file: {filename}")
            return

        category, stage_name = stage_info
        
        # Update product config
        if category not in product_config["stages"]:
            product_config["stages"][category] = {}
        
        product_config["stages"][category][stage_name] = {
            "file_metadata": {
                "file_path": filename,
                "generated_date": metadata["generated_date"],
                "model": metadata["model"],
                "status": "draft"  # Default status
            },
            "generation_metadata": {
                "prompt_used": metadata["prompt_used"],
                "context_used": metadata["context_used"],
                "previous_outputs": len(metadata["context_used"])
            },
            "content": stage_content
        }

    def _categorize_stage(self, filename: str) -> Optional[tuple]:
        """Categorize stage based on filename."""
        # Extract the stage number from the filename using regex
        match = re.search(r'_(\d{2})_', filename)
        if not match:
            return None
        
        try:
            stage_num = match.group(1)  # Get the stage number (e.g., "01", "02", etc.)
            
            # Map stage numbers to categories and names
            stage_map = {
                # Foundation (01-03)
                "01": ("foundation", "manifesto"),
                "02": ("foundation", "functional_spec"),
                "03": ("foundation", "audience_icps"),
                
                # Planning (04-06)
                "04": ("planning", "user_stories"),
                "05": ("planning", "competitor_sweep"),
                "06": ("planning", "tam_sizing"),
                
                # Research (07-08)
                "07": ("research", "prd_skeleton"),
                "08": ("research", "ui_prompt"),
                
                # Build (09-11)
                "09": ("build", "generate_screens"),
                "10": ("build", "landing_page_copy"),
                "11": ("build", "key_messages"),
                
                # Demo (12-15)
                "12": ("demo", "investor_deck"),
                "13": ("demo", "demo_script"),
                "14": ("demo", "slide_headlines"),
                "15": ("demo", "qa_prep")
            }
            
            return stage_map.get(stage_num)
        except (IndexError, ValueError):
            return None

    def _save_config(self) -> None:
        """Save the updated config file."""
        with open(self.output_file, 'w') as f:
            json.dump(self.existing_config, f, indent=2)
        logger.info(f"Config saved to {self.output_file}")

def main():
    parser = argparse.ArgumentParser(description='Generate product configuration from MD files')
    parser.add_argument('--products-dir', default='products',
                      help='Directory containing product MD files')
    parser.add_argument('--output', default='config/product-config.json',
                      help='Output configuration file')
    parser.add_argument('--schema', default='config/product-config.schema.json',
                      help='JSON schema file')
    args = parser.parse_args()

    try:
        generator = ProductConfigGenerator(
            products_dir=args.products_dir,
            output_file=args.output,
            schema_file=args.schema
        )
        generator.process_product_files()
    except Exception as e:
        logger.error(f"Error generating config: {e}")
        raise

if __name__ == "__main__":
    main() 