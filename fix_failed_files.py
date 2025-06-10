#!/usr/bin/env python3
"""
Fix Failed Files Script

This script regenerates only the files that failed due to token limits,
using GPT-4o-mini with reduced context to avoid the same issues.
"""

import csv
import os
import re
import json
import time
from pathlib import Path
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Will initialize OpenAI client later if API key is available
client = None

def read_failed_files_from_report():
    """Read the issues report to identify failed files"""
    failed_files = []
    
    # Find the latest issues report
    reports_dir = Path("reports")
    if not reports_dir.exists():
        print("❌ No reports directory found. Run analyze_products.py first.")
        return []
    
    # Get the latest issues report
    issue_files = list(reports_dir.glob("issues_report_*.csv"))
    if not issue_files:
        print("❌ No issues report found. Run analyze_products.py first.")
        return []
    
    latest_report = max(issue_files, key=lambda f: f.stat().st_mtime)
    print(f"📋 Reading failed files from: {latest_report}")
    
    with open(latest_report, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row['Issue Type'] == 'Generation Error':
                failed_files.append({
                    'product': row['Product'],
                    'stage': row['Stage'],
                    'file': row['File'],
                    'priority': row['Priority']
                })
    
    return failed_files

def read_products_from_csv(csv_path):
    """Read products from CSV file and return list of product dictionaries"""
    products = []
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Clean up the keys (remove extra spaces)
            cleaned_row = {k.strip(): v for k, v in row.items()}
            products.append(cleaned_row)
    
    return products

def read_prompts_from_directory(prompts_dir):
    """Read all prompt files from the prompts directory"""
    prompts = {}
    prompt_files = sorted([f for f in os.listdir(prompts_dir) if f.endswith('.md')])
    
    for filename in prompt_files:
        filepath = os.path.join(prompts_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
            
        # Extract prompt number and name from filename
        match = re.match(r'(\d+)_(.+)\.md', filename)
        if match:
            prompt_number = int(match.group(1))
            prompt_name = match.group(2)
            
            prompts[f"{prompt_number:02d}_{prompt_name}"] = {
                'number': prompt_number,
                'name': prompt_name,
                'filename': filename,
                'content': content
            }
    
    return prompts

def extract_prompt_details(content):
    """Extract the title, model, and kick-off prompt from the markdown content"""
    lines = content.split('\n')
    title = ""
    model = ""
    kick_off_prompt = ""
    
    for i, line in enumerate(lines):
        if line.startswith('# '):
            title = line[2:].strip()
        elif line.startswith('**Model:**'):
            model = line.replace('**Model:**', '').strip()
        elif 'Kick-Off Prompt:' in line:
            # Find the actual prompt (usually in quotes on the next few lines)
            for j in range(i+1, min(i+10, len(lines))):
                if lines[j].strip().startswith('"') and lines[j].strip().endswith('"'):
                    kick_off_prompt = lines[j].strip()[1:-1]  # Remove quotes
                    break
    
    return title, model, kick_off_prompt

def format_product_context(product):
    """Format product data for LLM context"""
    return f"""
PRODUCT CONTEXT:

**Product Name:** {product['NAME'].strip()}
**Type:** {product['Type'].strip()}
**Price:** {product['PRICE'].strip()}
**Primary Deliverables:** {product['Primary Deliverables'].strip()}

**Description:**
{product['DESCRIPTION'].strip()}

**Perfect For:**
{product['PERFECT FOR:'].strip()}

**What Client is Buying:**
{product['WHAT THE CLIENT IS ACTUALLY BUYING'].strip()}

**Ideal Client:**
{product['IDEAL CLIENT'].strip()}

**Key Features:**
{product['KEY FEATURES'].strip()}

**Benefits:**
{product['BENEFITS'].strip()}
"""

def get_reduced_context(product_name, stage_num):
    """Get only the most relevant previous outputs to reduce token usage"""
    products_dir = Path("products")
    relevant_outputs = []
    
    # Only include key strategic outputs, not all previous outputs
    key_stages = ["01_big_idea_product_manifesto", "05_plan_competitor_sweep", "07_research_prd_skeleton"]
    
    for stage in key_stages:
        # Find the file for this product and stage
        pattern = f"*{product_name.lower().replace(' ', '_')}*{stage}*.md"
        matching_files = list(products_dir.glob(pattern))
        
        if matching_files:
            try:
                with open(matching_files[0], 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                # Extract just the generated output section
                if "## Generated Output" in content:
                    output_section = content.split("## Generated Output")[1]
                    if "---" in output_section:
                        output_section = output_section.split("---")[0]
                    
                    # Truncate to first 500 characters to keep context manageable
                    output_section = output_section.strip()[:500] + "..."
                    
                    relevant_outputs.append({
                        'title': stage.replace('_', ' ').title(),
                        'content': output_section
                    })
            except Exception as e:
                print(f"Warning: Could not read {matching_files[0]}: {e}")
    
    return relevant_outputs

def call_llm_with_reduced_context(prompt, product_context, reduced_context):
    """Call the LLM with reduced context to avoid token limits"""
    global client
    
    # Build a more concise prompt
    context_summary = ""
    if reduced_context:
        context_summary = "\n\nKEY CONTEXT FROM PREVIOUS STAGES:\n"
        for output in reduced_context:
            context_summary += f"- {output['title']}: {output['content'][:200]}...\n"
    
    full_prompt = f"""You are an expert product strategist and AI consultant.

{product_context}
{context_summary}

TASK:
{prompt}

Please provide a comprehensive, professional response tailored to this product. Be specific and actionable.

Response:"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert product strategist and AI consultant. Provide detailed, actionable, and professional responses."},
                {"role": "user", "content": full_prompt}
            ],
            max_tokens=1500,  # Reduced from 2000
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"Error calling LLM: {e}")
        return f"Error generating content: {e}"

def regenerate_failed_file(failed_file, products, prompts):
    """Regenerate a single failed file"""
    global client
    
    # Create a mapping of filename patterns to products
    product_mapping = {
        'ai_power_hour': 'AI Power Hour',
        'ai_b_c': 'AI-B-C™',
        'ai_innovation_programme': 'AI Innovation Programme',
        'ai_leadership_partner_fractional_caio': 'AI Leadership Partner (Fractional CAIO)',
        'ai_powered_research_and_insight_sprint': 'AI-Powered Research and Insight Sprint',
        'ai_consultancy_retainer': 'AI Consultancy Retainer',
        'ai_innovation_day': 'AI Innovation Day',
        'social_intelligence_dashboard': 'Social Intelligence Dashboard'
    }
    
    # Find the product by matching filename pattern
    product = None
    for pattern, product_name in product_mapping.items():
        if pattern in failed_file['file'].lower():
            # Find the actual product in the CSV data
            for p in products:
                if p['NAME'].strip() == product_name:
                    product = p
                    break
            break
    
    if not product:
        print(f"❌ Could not find product for file: {failed_file['file']}")
        return False
    
    # Find the prompt
    stage_key = failed_file['stage']
    if stage_key not in prompts:
        print(f"❌ Could not find prompt for stage: {stage_key}")
        return False
    
    prompt_info = prompts[stage_key]
    
    # Extract prompt details
    title, model, kick_off_prompt = extract_prompt_details(prompt_info['content'])
    
    print(f"  🤖 Regenerating with GPT-4o-mini and reduced context...")
    
    # Get reduced context instead of all previous outputs
    reduced_context = get_reduced_context(product['NAME'].strip(), prompt_info['number'])
    
    # Format contexts
    product_context = format_product_context(product)
    
    # Replace <n> placeholder with product name in prompt
    actual_prompt = kick_off_prompt.replace('<n>', product['NAME'].strip())
    
    # Call LLM with reduced context
    llm_output = call_llm_with_reduced_context(actual_prompt, product_context, reduced_context)
    
    # Generate the full content
    content = f"""# {product['NAME'].strip()} • {title.split('•')[1].strip() if '•' in title else title}

**Generated using:** {title}  
**Model:** GPT-4o-mini (reduced context)  
**Date:** January 2025  
**Product:** {product['NAME'].strip()} ({product['PRICE'].strip()})

---

## Original Prompt
{kick_off_prompt}

---

## Product Context

### **Product Details**
- **Type:** {product['Type'].strip()}
- **Price:** {product['PRICE'].strip()}
- **Primary Deliverables:** {product['Primary Deliverables'].strip()}

### **Description**
{product['DESCRIPTION'].strip()}

### **Perfect For**
{product['PERFECT FOR:'].strip()}

### **What Client is Buying**
{product['WHAT THE CLIENT IS ACTUALLY BUYING'].strip()}

### **Ideal Client**
{product['IDEAL CLIENT'].strip()}

### **Key Features**
{product['KEY FEATURES'].strip()}

### **Benefits**
{product['BENEFITS'].strip()}

---

## Generated Output

{llm_output}

---

## Context Used
- Product data from CSV
- Reduced context from key previous stages (to avoid token limits)

**Generated on:** {time.strftime('%Y-%m-%d %H:%M:%S')}
"""

    # Write the file
    filepath = Path("products") / failed_file['file']
    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(content)
    
    return True

def main():
    global client
    
    print("🔧 Failed Files Recovery Script")
    print("=" * 50)
    
    # Check for OpenAI API key
    if not os.getenv('OPENAI_API_KEY'):
        print("❌ OPENAI_API_KEY environment variable not set.")
        print("   Set it with: export OPENAI_API_KEY='your-api-key-here'")
        return
    
    try:
        from openai import OpenAI
        client = OpenAI()
        print("✅ OpenAI API key found and client initialized")
    except ImportError:
        print("❌ OpenAI package not installed. Install with: pip install openai")
        return
    
    # Read failed files from the latest issues report
    failed_files = read_failed_files_from_report()
    if not failed_files:
        print("✅ No failed files found!")
        return
    
    print(f"📋 Found {len(failed_files)} failed files to regenerate")
    
    # Read products and prompts
    csv_path = 'data/BN Products List   - 2025.csv'
    prompts_dir = 'prompts'
    
    print("📖 Reading products and prompts...")
    products = read_products_from_csv(csv_path)
    prompts = read_prompts_from_directory(prompts_dir)
    
    # Regenerate each failed file
    success_count = 0
    for i, failed_file in enumerate(failed_files, 1):
        print(f"\n[{i:2d}/{len(failed_files)}] Regenerating: {failed_file['file']}")
        
        if regenerate_failed_file(failed_file, products, prompts):
            print(f"    ✅ Successfully regenerated")
            success_count += 1
            # Rate limiting
            time.sleep(1)
        else:
            print(f"    ❌ Failed to regenerate")
    
    print(f"\n🎉 Regeneration complete!")
    print(f"✅ Successfully regenerated: {success_count}/{len(failed_files)} files")
    
    if success_count > 0:
        print(f"\n💡 Next steps:")
        print(f"   1. Run: python3 analyze_products.py")
        print(f"   2. Run: python3 launch_dashboard.py")
        print(f"   3. Check the updated reports!")

if __name__ == "__main__":
    main() 