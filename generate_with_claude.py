#!/usr/bin/env python3
"""
Product Prompt Generator with Manual LLM Processing

This script generates product-prompt combinations and outputs them in a format
that can be processed manually through conversation with Claude.

Usage: python generate_with_claude.py
"""

import csv
import os
import re
import json
import time
from pathlib import Path

def clean_filename(text):
    """Convert text to a clean filename format"""
    text = re.sub(r'[^\w\s-]', '', text.lower())
    text = re.sub(r'[-\s]+', '_', text)
    text = text.strip('_')
    return text

def read_products_from_csv(csv_path):
    """Read products from CSV file and return list of product dictionaries"""
    products = []
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
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

def create_processing_queue():
    """Create a JSON file with all the prompts to be processed"""
    csv_path = 'data/BN Products List   - 2025.csv'
    prompts_dir = 'prompts'
    
    products = read_products_from_csv(csv_path)
    prompts = read_prompts_from_directory(prompts_dir)
    
    queue = []
    
    for product_idx, product in enumerate(products, 1):
        product_name_clean = clean_filename(product['NAME'].strip())
        product_context = format_product_context(product)
        
        for prompt in prompts:
            title, model, kick_off_prompt = extract_prompt_details(prompt['content'])
            actual_prompt = kick_off_prompt.replace('<n>', product['NAME'].strip())
            
            filename = f"{product_idx:02d}_{product_name_clean}_{prompt['number']:02d}_{prompt['name']}.md"
            
            queue.append({
                'filename': filename,
                'product_name': product['NAME'].strip(),
                'product_idx': product_idx,
                'prompt_number': prompt['number'],
                'prompt_title': title,
                'prompt_text': actual_prompt,
                'product_context': product_context,
                'model': model,
                'processed': False
            })
    
    # Save queue to JSON file
    with open('processing_queue.json', 'w', encoding='utf-8') as f:
        json.dump(queue, f, indent=2, ensure_ascii=False)
    
    return queue

def get_next_unprocessed():
    """Get the next unprocessed item from the queue"""
    try:
        with open('processing_queue.json', 'r', encoding='utf-8') as f:
            queue = json.load(f)
        
        for item in queue:
            if not item['processed']:
                return item
        
        return None
    except FileNotFoundError:
        return None

def mark_as_processed(filename):
    """Mark an item as processed in the queue"""
    try:
        with open('processing_queue.json', 'r', encoding='utf-8') as f:
            queue = json.load(f)
        
        for item in queue:
            if item['filename'] == filename:
                item['processed'] = True
                break
        
        with open('processing_queue.json', 'w', encoding='utf-8') as f:
            json.dump(queue, f, indent=2, ensure_ascii=False)
        
        return True
    except FileNotFoundError:
        return False

def get_previous_outputs_for_product(product_idx):
    """Get all previous outputs for a specific product"""
    try:
        with open('processing_queue.json', 'r', encoding='utf-8') as f:
            queue = json.load(f)
        
        previous_outputs = []
        for item in queue:
            if (item['product_idx'] == product_idx and 
                item['processed'] and 
                'generated_content' in item):
                previous_outputs.append({
                    'title': item['prompt_title'],
                    'content': item['generated_content']
                })
        
        return previous_outputs
    except FileNotFoundError:
        return []

def save_generated_content(filename, content):
    """Save generated content to the queue and create the markdown file"""
    try:
        with open('processing_queue.json', 'r', encoding='utf-8') as f:
            queue = json.load(f)
        
        for item in queue:
            if item['filename'] == filename:
                item['generated_content'] = content
                item['processed'] = True
                
                # Create the actual markdown file
                create_markdown_file(item, content)
                break
        
        with open('processing_queue.json', 'w', encoding='utf-8') as f:
            json.dump(queue, f, indent=2, ensure_ascii=False)
        
        return True
    except FileNotFoundError:
        return False

def create_markdown_file(item, generated_content):
    """Create the markdown file with generated content"""
    previous_outputs = get_previous_outputs_for_product(item['product_idx'])
    
    content = f"""# {item['product_name']} • {item['prompt_title'].split('•')[1].strip() if '•' in item['prompt_title'] else item['prompt_title']}

**Generated using:** {item['prompt_title']}  
**Model:** {item['model']}  
**Date:** January 2025  
**Product:** {item['product_name']} ({item.get('price', 'N/A')})

---

## Original Prompt
{item['prompt_text']}

---

## Product Context
{item['product_context']}

---

## Generated Output

{generated_content}

---

## Context Used
- Product data from CSV
{f"- Previous outputs: {len(previous_outputs)} prior prompts" if previous_outputs else "- No previous outputs (first prompt)"}

**Generated on:** {time.strftime('%Y-%m-%d %H:%M:%S')}
"""

    # Write to products directory
    filepath = os.path.join('products', item['filename'])
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    print("🚀 Product Prompt Generator with Manual LLM Processing")
    print("=" * 60)
    
    # Create processing queue
    print("Creating processing queue...")
    queue = create_processing_queue()
    print(f"✅ Created queue with {len(queue)} items")
    
    # Get next item to process
    next_item = get_next_unprocessed()
    
    if next_item:
        print(f"\n📋 Next item to process:")
        print(f"   File: {next_item['filename']}")
        print(f"   Product: {next_item['product_name']}")
        print(f"   Prompt: {next_item['prompt_title']}")
        
        # Get previous outputs for context
        previous_outputs = get_previous_outputs_for_product(next_item['product_idx'])
        
        print(f"\n🎯 PROMPT FOR CLAUDE:")
        print("=" * 40)
        print(f"TASK: {next_item['prompt_text']}")
        print(f"\nPRODUCT CONTEXT:{next_item['product_context']}")
        
        if previous_outputs:
            print(f"\nPREVIOUS OUTPUTS:")
            for i, output in enumerate(previous_outputs, 1):
                print(f"\n--- {i}. {output['title']} ---")
                print(output['content'][:200] + "..." if len(output['content']) > 200 else output['content'])
        
        print("\n" + "=" * 40)
        print(f"📝 Please provide the generated content for: {next_item['filename']}")
        print(f"💾 Use: save_content('{next_item['filename']}', 'your_generated_content')")
        
    else:
        print("\n🎉 All items have been processed!")
        
        # Show summary
        try:
            with open('processing_queue.json', 'r', encoding='utf-8') as f:
                queue = json.load(f)
            
            processed = sum(1 for item in queue if item['processed'])
            total = len(queue)
            
            print(f"📊 Summary: {processed}/{total} items processed")
            
        except FileNotFoundError:
            print("No processing queue found.")

def save_content(filename, content):
    """Helper function to save generated content"""
    if save_generated_content(filename, content):
        print(f"✅ Saved content for {filename}")
        mark_as_processed(filename)
        
        # Show next item
        next_item = get_next_unprocessed()
        if next_item:
            previous_outputs = get_previous_outputs_for_product(next_item['product_idx'])
            
            print(f"\n📋 Next item to process:")
            print(f"   File: {next_item['filename']}")
            print(f"   Product: {next_item['product_name']}")
            print(f"   Prompt: {next_item['prompt_title']}")
            
            print(f"\n🎯 PROMPT FOR CLAUDE:")
            print("=" * 40)
            print(f"TASK: {next_item['prompt_text']}")
            print(f"\nPRODUCT CONTEXT:{next_item['product_context']}")
            
            if previous_outputs:
                print(f"\nPREVIOUS OUTPUTS:")
                for i, output in enumerate(previous_outputs, 1):
                    print(f"\n--- {i}. {output['title']} ---")
                    print(output['content'][:200] + "..." if len(output['content']) > 200 else output['content'])
            
            print("\n" + "=" * 40)
            print(f"📝 Please provide the generated content for: {next_item['filename']}")
            print(f"💾 Use: save_content('{next_item['filename']}', 'your_generated_content')")
        else:
            print("\n🎉 All items have been processed!")
    else:
        print(f"❌ Failed to save content for {filename}")

if __name__ == "__main__":
    main() 