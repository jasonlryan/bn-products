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

class CleanProductConfigGenerator:
    def __init__(self, products_dir: str, output_file: str, schema_file: str):
        # Convert to absolute paths
        self.root_dir = Path(__file__).parent.parent
        self.products_dir = self._resolve_path(products_dir)
        self.output_file = self._resolve_path(output_file)
        self.schema_file = self._resolve_path(schema_file)
        
        # Create directories if they don't exist
        self.output_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Start with fresh config - no existing config loading
        self.config = {"products": {}}
        self.schema = self._load_schema()

    def _resolve_path(self, path: str) -> Path:
        """Convert relative paths to absolute paths."""
        p = Path(path)
        if not p.is_absolute():
            p = self.root_dir / p
        return p

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
                content_text = match.group(1).strip()
                if key == "overview":
                    spec[key] = content_text
                else:
                    spec[key] = [item.strip('• ').strip() for item in content_text.split('\n') if item.strip()]
        
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
        return {"raw_content": content}

    def _parse_competitor_sweep(self, content: str) -> dict:
        """Parse competitor sweep content."""
        return {"raw_content": content}

    def _parse_tam_sizing(self, content: str) -> dict:
        """Parse TAM sizing content."""
        return {"raw_content": content}

    def _parse_prd(self, content: str) -> dict:
        """Parse PRD content."""
        return {"raw_content": content}

    def _parse_ui_prompt(self, content: str) -> dict:
        """Parse UI prompt content."""
        return {"raw_content": content}

    def _parse_screens(self, content: str) -> dict:
        """Parse screens content."""
        return {"raw_content": content}

    def _parse_landing_copy(self, content: str) -> dict:
        """Parse landing copy content."""
        return {"raw_content": content}

    def _parse_key_messages(self, content: str) -> dict:
        """Parse key messages content."""
        return {"raw_content": content}

    def _parse_investor_deck(self, content: str) -> dict:
        """Parse investor deck content."""
        return {"raw_content": content}

    def _parse_demo_script(self, content: str) -> dict:
        """Parse demo script content."""
        return {"raw_content": content}

    def _parse_slide_headlines(self, content: str) -> dict:
        """Parse slide headlines content."""
        return {"raw_content": content}

    def _parse_qa_prep(self, content: str) -> dict:
        """Parse Q&A prep content."""
        return {"raw_content": content}

    def _get_product_info_from_filename(self, filename: str) -> tuple:
        """Extract product ID and clean name from filename."""
        # Expected format: 01_ai_power_hour_01_big_idea_product_manifesto.md
        parts = filename.split('_')
        
        if len(parts) < 3:
            return None, None
            
        product_id = parts[0]
        
        # Find where the stage number starts (first occurrence of 2-digit number after product ID)
        product_name_parts = []
        for i, part in enumerate(parts[1:], 1):
            if re.match(r'^\d{2}$', part) and i > 1:  # Stage number found
                break
            product_name_parts.append(part)
        
        if not product_name_parts:
            return product_id, None
            
        product_name = ' '.join(product_name_parts).title()
        product_key = f"{product_id}_{'_'.join(product_name_parts)}"
        
        return product_key, product_name

    def _categorize_stage(self, filename: str) -> Optional[tuple]:
        """Categorize stage based on filename."""
        # Extract the stage number from the filename using regex
        match = re.search(r'_(\d{2})_', filename)
        if not match:
            return None
        
        try:
            stage_num = match.group(1)
            
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

    def _get_stage_type(self, filename: str) -> str:
        """Determine stage type from filename."""
        stage_patterns = {
            r'01_.*_product_manifesto': 'manifesto',
            r'02_.*_functional_spec': 'functional_spec',
            r'03_.*_audience_icps': 'audience_icps',
            r'04_.*_user_stories': 'user_stories',
            r'05_.*_competitor_sweep': 'competitor_sweep',
            r'06_.*_tam_sizing': 'tam_sizing',
            r'07_.*_prd_skeleton': 'prd_skeleton',
            r'08_.*_ui_prompt': 'ui_prompt',
            r'09_.*_generate_screens': 'generate_screens',
            r'10_.*_landing_page_copy': 'landing_page_copy',
            r'11_.*_key_messages': 'key_messages',
            r'12_.*_investor_deck': 'investor_deck',
            r'13_.*_demo_script': 'demo_script',
            r'14_.*_slide_headlines': 'slide_headlines',
            r'15_.*_qa_prep': 'qa_prep'
        }
        
        for pattern, stage_type in stage_patterns.items():
            if re.search(pattern, filename):
                return stage_type
        return 'unknown'

    def process_product_files(self) -> None:
        """Process all product files and generate clean config."""
        # Get all MD files and sort them for consistent processing
        md_files = sorted(glob.glob(str(self.products_dir / "*.md")))
        
        # Group files by product using consistent naming
        products = {}
        for file in md_files:
            filename = os.path.basename(file)
            product_key, product_name = self._get_product_info_from_filename(filename)
            
            if not product_key or not product_name:
                logger.warning(f"Could not parse product info from: {filename}")
                continue
                
            if product_key not in products:
                products[product_key] = {
                    'name': product_name,
                    'files': []
                }
            products[product_key]['files'].append(file)

        logger.info(f"Found {len(products)} unique products")
        
        # Process each product
        for product_key, product_info in products.items():
            logger.info(f"Processing product: {product_key}")
            self._process_single_product(product_key, product_info['name'], product_info['files'])

        # Save config
        self._save_config()

    def _process_single_product(self, product_key: str, product_name: str, files: List[str]) -> None:
        """Process files for a single product."""
        
        # Initialize product config
        product_config = {
            "name": product_name,
            "type": "PRODUCT",
            "stages": {
                "foundation": {},
                "planning": {},
                "research": {},
                "build": {},
                "demo": {}
            }
        }

        # Process each file
        for file in sorted(files):  # Sort for consistent processing
            self._process_single_file(file, product_config)

        # Add to config
        self.config["products"][product_key] = product_config
        logger.info(f"Added product: {product_key} with {len(files)} files")

    def _process_single_file(self, file: str, product_config: dict) -> None:
        """Process a single MD file and update product config."""
        filename = os.path.basename(file)
        stage_type = self._get_stage_type(filename)
        
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            logger.error(f"Error reading file {filename}: {e}")
            return

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
                "status": "draft"
            },
            "generation_metadata": {
                "prompt_used": metadata["prompt_used"],
                "context_used": metadata["context_used"],
                "previous_outputs": len(metadata["context_used"])
            },
            "content": stage_content
        }

    def _save_config(self) -> None:
        """Save the clean config file."""
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=2, ensure_ascii=False)
        logger.info(f"Clean config saved to {self.output_file}")
        logger.info(f"Total products in config: {len(self.config['products'])}")

def main():
    parser = argparse.ArgumentParser(description='Generate clean product configuration from MD files')
    parser.add_argument('--products-dir', default='products',
                      help='Directory containing product MD files')
    parser.add_argument('--output', default='config/product-config-clean.json',
                      help='Output configuration file')
    parser.add_argument('--schema', default='product-config.schema.json',
                      help='JSON schema file')
    args = parser.parse_args()

    try:
        generator = CleanProductConfigGenerator(
            products_dir=args.products_dir,
            output_file=args.output,
            schema_file=args.schema
        )
        generator.process_product_files()
        
        print(f"\n✅ Successfully generated clean config with {len(generator.config['products'])} products")
        print(f"📁 Output file: {args.output}")
        
    except Exception as e:
        logger.error(f"Error generating clean config: {e}")
        raise

if __name__ == "__main__":
    main() 