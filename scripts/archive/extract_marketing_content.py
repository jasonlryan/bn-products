#!/usr/bin/env python3

import os
import json
import re
from pathlib import Path
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MarketingContentExtractor:
    def __init__(self, config_file: str, output_file: str):
        self.config_file = config_file
        self.output_file = output_file
        self.marketing_data = {
            "generated_at": datetime.now().isoformat(),
            "products": {}
        }
    
    def extract_all_content(self):
        """Extract marketing content from all products"""
        logger.info("Loading product configuration...")
        
        with open(self.config_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        for product_id, product_data in config['products'].items():
            logger.info(f"Extracting marketing content for {product_data['name']}")
            self.marketing_data['products'][product_id] = self.extract_product_marketing(product_data)
        
        # Save marketing data
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(self.marketing_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Marketing content saved to {self.output_file}")
    
    def extract_product_marketing(self, product_data):
        """Extract marketing content for a single product"""
        marketing_content = {
            "name": product_data.get('name', ''),
            "type": product_data.get('type', ''),
            "hero": {},
            "features": [],
            "benefits": [],
            "use_cases": [],
            "target_audience": [],
            "competitive_advantages": [],
            "demo_info": {},
            "pricing_info": {},
            "technical_specs": {},
            "all_details": {}
        }
        
        stages = product_data.get('stages', {})
        
        # Extract from Product Manifesto
        manifesto = self._get_stage_content(stages, 'foundation', 'manifesto')
        if manifesto:
            marketing_content['hero'] = self._extract_hero_content(manifesto)
            marketing_content['benefits'] = self._extract_benefits(manifesto)
        
        # Extract from Landing Page Copy
        landing_copy = self._get_stage_content(stages, 'demo', 'landing_page_copy')
        if landing_copy:
            marketing_content['hero'].update(self._extract_landing_hero(landing_copy))
        
        # Extract from Key Messages
        key_messages = self._get_stage_content(stages, 'demo', 'key_messages')
        if key_messages:
            marketing_content['features'].extend(self._extract_key_features(key_messages))
        
        # Extract from User Stories
        user_stories = self._get_stage_content(stages, 'planning', 'user_stories')
        if user_stories:
            marketing_content['use_cases'] = self._extract_use_cases(user_stories)
        
        # Extract from Audience ICPs
        audience = self._get_stage_content(stages, 'foundation', 'audience_icps')
        if audience:
            marketing_content['target_audience'] = self._extract_target_audience(audience)
        
        # Extract from Competitor Analysis
        competitors = self._get_stage_content(stages, 'planning', 'competitor_sweep')
        if competitors:
            marketing_content['competitive_advantages'] = self._extract_competitive_advantages(competitors)
        
        # Extract from Functional Spec
        func_spec = self._get_stage_content(stages, 'foundation', 'functional_spec')
        if func_spec:
            marketing_content['technical_specs'] = self._extract_technical_specs(func_spec)
        
        # Extract from Demo Script
        demo_script = self._get_stage_content(stages, 'demo', 'demo_script')
        if demo_script:
            marketing_content['demo_info'] = self._extract_demo_info(demo_script)
        
        # Store all detailed content for comprehensive pages
        marketing_content['all_details'] = {
            'manifesto': manifesto,
            'functional_spec': func_spec,
            'user_stories': user_stories,
            'competitor_analysis': competitors,
            'landing_copy': landing_copy,
            'key_messages': key_messages,
            'demo_script': demo_script
        }
        
        return marketing_content
    
    def _get_stage_content(self, stages, category, stage_name):
        """Get content from a specific stage"""
        try:
            return stages.get(category, {}).get(stage_name, {}).get('content', {})
        except:
            return {}
    
    def _extract_hero_content(self, manifesto):
        """Extract hero section content from manifesto"""
        hero = {}
        
        if isinstance(manifesto, dict):
            # Look for common manifesto fields
            hero['headline'] = manifesto.get('product_name', '') or manifesto.get('title', '')
            hero['tagline'] = manifesto.get('tagline', '') or manifesto.get('subtitle', '')
            hero['description'] = manifesto.get('problem_statement', '') or manifesto.get('description', '')
            hero['value_proposition'] = manifesto.get('solution', '') or manifesto.get('value_proposition', '')
        elif isinstance(manifesto, str):
            # Extract from raw text
            lines = manifesto.split('\n')
            hero['headline'] = lines[0] if lines else ''
            hero['description'] = manifesto[:300] + '...' if len(manifesto) > 300 else manifesto
        
        return hero
    
    def _extract_landing_hero(self, landing_copy):
        """Extract hero content from landing page copy"""
        hero = {}
        
        if isinstance(landing_copy, dict):
            hero['headline'] = landing_copy.get('headline', '') or landing_copy.get('main_headline', '')
            hero['subheadline'] = landing_copy.get('subheadline', '') or landing_copy.get('subtitle', '')
            hero['cta_text'] = landing_copy.get('cta', '') or landing_copy.get('call_to_action', '')
        elif isinstance(landing_copy, str):
            # Extract headline from first line
            lines = landing_copy.split('\n')
            if lines:
                hero['headline'] = lines[0].strip('#').strip()
        
        return hero
    
    def _extract_benefits(self, manifesto):
        """Extract benefits from manifesto"""
        benefits = []
        
        if isinstance(manifesto, dict):
            # Look for benefits in various fields
            benefit_fields = ['benefits', 'advantages', 'value_props', 'key_benefits']
            for field in benefit_fields:
                if field in manifesto:
                    value = manifesto[field]
                    if isinstance(value, list):
                        benefits.extend(value)
                    elif isinstance(value, str):
                        benefits.append(value)
        
        return benefits[:5]  # Limit to top 5 benefits
    
    def _extract_key_features(self, key_messages):
        """Extract key features from key messages"""
        features = []
        
        if isinstance(key_messages, dict):
            feature_fields = ['features', 'key_features', 'capabilities', 'functionality']
            for field in feature_fields:
                if field in key_messages:
                    value = key_messages[field]
                    if isinstance(value, list):
                        features.extend(value)
                    elif isinstance(value, str):
                        features.append(value)
        
        return features[:6]  # Limit to top 6 features
    
    def _extract_use_cases(self, user_stories):
        """Extract use cases from user stories"""
        use_cases = []
        
        if isinstance(user_stories, dict):
            if 'user_stories' in user_stories:
                stories = user_stories['user_stories']
                if isinstance(stories, list):
                    for story in stories[:4]:  # Top 4 use cases
                        if isinstance(story, dict):
                            use_case = {
                                'title': story.get('title', ''),
                                'description': story.get('description', ''),
                                'user_type': story.get('user_type', '')
                            }
                            use_cases.append(use_case)
        
        return use_cases
    
    def _extract_target_audience(self, audience):
        """Extract target audience from audience ICPs"""
        target_audience = []
        
        if isinstance(audience, dict):
            if 'personas' in audience or 'icps' in audience:
                personas = audience.get('personas', audience.get('icps', []))
                if isinstance(personas, list):
                    for persona in personas[:3]:  # Top 3 personas
                        if isinstance(persona, dict):
                            target_audience.append({
                                'name': persona.get('name', ''),
                                'description': persona.get('description', ''),
                                'pain_points': persona.get('pain_points', [])
                            })
        
        return target_audience
    
    def _extract_competitive_advantages(self, competitors):
        """Extract competitive advantages"""
        advantages = []
        
        if isinstance(competitors, dict):
            if 'competitive_advantages' in competitors:
                advs = competitors['competitive_advantages']
                if isinstance(advs, list):
                    advantages = advs[:4]  # Top 4 advantages
        
        return advantages
    
    def _extract_technical_specs(self, func_spec):
        """Extract technical specifications"""
        specs = {}
        
        if isinstance(func_spec, dict):
            spec_fields = ['technical_requirements', 'specifications', 'architecture', 'tech_stack']
            for field in spec_fields:
                if field in func_spec:
                    specs[field] = func_spec[field]
        
        return specs
    
    def _extract_demo_info(self, demo_script):
        """Extract demo information"""
        demo_info = {}
        
        if isinstance(demo_script, dict):
            demo_info = {
                'demo_flow': demo_script.get('demo_flow', []),
                'key_moments': demo_script.get('key_moments', []),
                'demo_script': demo_script.get('script', '')
            }
        
        return demo_info

def main():
    extractor = MarketingContentExtractor(
        config_file='config/product-config.json',
        output_file='product-dashboard/public/marketing-content.json'
    )
    extractor.extract_all_content()
    print("✅ Marketing content extracted successfully!")

if __name__ == "__main__":
    main() 