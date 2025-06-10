#!/usr/bin/env python3
"""
Product Prompt Generator Script with LLM Integration

This script reads products from the CSV file and prompts from the prompts directory,
then generates markdown files for each product-prompt combination by actually calling
an LLM to generate the content. Each prompt builds on previous outputs.

Usage: python generate_product_prompts.py
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

def clean_filename(text):
    """Convert text to a clean filename format"""
    # Remove special characters and convert to lowercase
    text = re.sub(r'[^\w\s-]', '', text.lower())
    # Replace spaces and multiple hyphens with single underscore
    text = re.sub(r'[-\s]+', '_', text)
    # Remove leading/trailing underscores
    text = text.strip('_')
    return text

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
    prompts = []
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
            
            prompts.append({
                'number': prompt_number,
                'name': prompt_name,
                'filename': filename,
                'content': content
            })
    
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

def format_previous_outputs(previous_outputs):
    """Format previous prompt outputs for context"""
    if not previous_outputs:
        return ""
    
    context = "\n\nPREVIOUS OUTPUTS (for context):\n"
    for output in previous_outputs:
        context += f"\n--- {output['title']} ---\n{output['content']}\n"
    
    return context

def call_llm(prompt, product_context, previous_outputs, model_preference="gpt-4o-mini"):
    """Call the LLM with the prompt and context"""
    global client
    
    # Build the full prompt
    full_prompt = f"""You are an expert product strategist and AI consultant. 

{product_context}
{format_previous_outputs(previous_outputs)}

TASK:
{prompt}

Please provide a comprehensive, professional response that builds on the product context{' and previous outputs' if previous_outputs else ''}. Be specific, actionable, and tailored to this exact product.

Response:"""

    try:
        response = client.chat.completions.create(
            model=model_preference if model_preference.startswith('gpt') else "gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert product strategist and AI consultant. Provide detailed, actionable, and professional responses."},
                {"role": "user", "content": full_prompt}
            ],
            max_tokens=2000,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"Error calling LLM: {e}")
        return f"Error generating content: {e}"

def generate_product_prompt_content(product, prompt_info, product_num, prompt_num, llm_output, previous_outputs):
    """Generate the final markdown content with LLM output"""
    
    title, model, kick_off_prompt = extract_prompt_details(prompt_info['content'])
    
    content = f"""# {product['NAME'].strip()} • {title.split('•')[1].strip() if '•' in title else title}

**Generated using:** {title}  
**Model:** {model}  
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
{f"- Previous outputs: {len(previous_outputs)} prior prompts" if previous_outputs else "- No previous outputs (first prompt)"}

**Generated on:** {time.strftime('%Y-%m-%d %H:%M:%S')}
"""

    return content

def main():
    global client
    
    # Configuration
    csv_path = 'data/BN Products List   - 2025.csv'
    prompts_dir = 'prompts'
    output_dir = 'products'
    
    # Create output directory if it doesn't exist
    Path(output_dir).mkdir(exist_ok=True)
    
    # Read products and prompts
    print("Reading products from CSV...")
    products = read_products_from_csv(csv_path)
    print(f"Found {len(products)} products")
    
    print("Reading prompts from directory...")
    prompts = read_prompts_from_directory(prompts_dir)
    print(f"Found {len(prompts)} prompts")
    
    # Check for OpenAI API key and initialize client if available
    if not os.getenv('OPENAI_API_KEY'):
        print("⚠️  Warning: OPENAI_API_KEY environment variable not set.")
        print("   Set it with: export OPENAI_API_KEY='your-api-key-here'")
        print("   Continuing with mock responses...")
        use_mock = True
        client = None
    else:
        print("✅ OpenAI API key found")
        try:
            from openai import OpenAI
            client = OpenAI()
            use_mock = False
        except ImportError:
            print("⚠️  OpenAI package not installed. Install with: pip install openai")
            print("   Continuing with mock responses...")
            use_mock = True
            client = None
    
    # Generate files for each product
    total_files = len(products) * len(prompts)
    current_file = 0
    
    print(f"\nGenerating {total_files} product-prompt files with LLM outputs...")
    print("This may take a while due to API rate limits...\n")
    
    for product_idx, product in enumerate(products, 1):
        product_name_clean = clean_filename(product['NAME'].strip())
        product_context = format_product_context(product)
        previous_outputs = []  # Reset for each product
        
        print(f"\n🔄 Processing Product {product_idx}/{len(products)}: {product['NAME'].strip()}")
        
        for prompt in prompts:
            current_file += 1
            
            # Generate filename
            filename = f"{product_idx:02d}_{product_name_clean}_{prompt['number']:02d}_{prompt['name']}.md"
            filepath = os.path.join(output_dir, filename)
            
            # Extract prompt details
            title, model, kick_off_prompt = extract_prompt_details(prompt['content'])
            
            print(f"  [{current_file:3d}/{total_files}] Generating: {filename}")
            
            # Call LLM or use mock
            if use_mock:
                llm_output = f"[Mock output for {title} applied to {product['NAME'].strip()}]\n\nThis would contain the actual LLM-generated content based on the prompt and product context."
            else:
                # Replace <n> placeholder with product name in prompt
                actual_prompt = kick_off_prompt.replace('<n>', product['NAME'].strip())
                
                print(f"    🤖 Calling LLM with {model}...")
                llm_output = call_llm(actual_prompt, product_context, previous_outputs, model)
                
                # Rate limiting - be nice to the API
                time.sleep(1)
            
            # Generate content
            content = generate_product_prompt_content(
                product, prompt, product_idx, prompt['number'], llm_output, previous_outputs
            )
            
            # Write file
            with open(filepath, 'w', encoding='utf-8') as file:
                file.write(content)
            
            # Add this output to previous outputs for next prompt
            previous_outputs.append({
                'title': title,
                'content': llm_output
            })
            
            print(f"    ✅ Generated: {filename}")
    
    print(f"\n🎉 Successfully generated {total_files} files in the '{output_dir}' directory!")
    print(f"\nFile naming convention: {{product_number:02d}}_{{product_name}}_{{prompt_number:02d}}_{{prompt_name}}.md")
    print(f"Example: 01_ai_power_hour_01_big_idea_product_manifesto.md")
    
    if use_mock:
        print(f"\n⚠️  Note: Files contain mock outputs. Set OPENAI_API_KEY to generate real LLM content.")
    else:
        print(f"\n✅ All files contain real LLM-generated content!")

if __name__ == "__main__":
    main() 