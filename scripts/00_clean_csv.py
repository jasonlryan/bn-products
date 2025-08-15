#!/usr/bin/env python3
"""
STAGE 0: CSV Cleaning and Validation
Canonical script to clean and validate CSV input for the product pipeline.

This script combines the best features from previous cleaning utilities
and provides a single, authoritative way to prepare CSV data.

Usage:
  python3 00_clean_csv.py                    # Clean default CSV
  python3 00_clean_csv.py --input path.csv   # Clean specific file
  python3 00_clean_csv.py --check-only       # Just check for issues
  python3 00_clean_csv.py --auto             # Auto-clean without prompts
"""

import csv
import os
import re
import argparse
import shutil
from pathlib import Path
from typing import List, Dict, Any

class CSVCleaner:
    def __init__(self, input_file="../data/BN Products List - 2025.csv"):
        self.input_file = Path(input_file)
        self.backup_file = self.input_file.with_suffix('.csv.backup')
        self.clean_file = self.input_file.with_suffix('.clean.csv')
        
        # Expected headers for validation
        self.expected_headers = [
            "Type",
            "NAME", 
            "PRICE",
            "Primary Deliverables",
            "DESCRIPTION",
            "WHAT IS THE NEXT PRODUCT OR SERVICE?",
            "PERFECT FOR:",
            "WHAT THE CLIENT IS ACTUALLY BUYING",
            "IDEAL CLIENT",
            "KEY FEATURES", 
            "BENEFITS"
        ]
        
    def analyze_csv(self) -> List[str]:
        """Analyze CSV for issues without fixing"""
        issues = []
        
        if not self.input_file.exists():
            return [f"File not found: {self.input_file}"]
        
        try:
            with open(self.input_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Check for basic issues
            lines = content.split('\n')
            
            # 1. Check headers
            if lines:
                header_line = lines[0]
                # Handle quoted headers
                headers = []
                reader = csv.reader([header_line])
                for row in reader:
                    headers = [h.strip() for h in row]
                    break
                
                # Check for trailing/leading spaces
                space_issues = [h for h in headers if h != h.strip()]
                if space_issues:
                    issues.append(f"Headers with spacing issues: {space_issues}")
                
                # Check for empty headers
                empty_headers = [i for i, h in enumerate(headers) if not h.strip()]
                if empty_headers:
                    issues.append(f"Empty headers at positions: {empty_headers}")
                
                # Check for missing expected headers
                missing_headers = [h for h in self.expected_headers if h not in headers]
                if missing_headers:
                    issues.append(f"Missing expected headers: {missing_headers}")
            
            # 2. Parse with csv reader to check structure
            try:
                with open(self.input_file, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    headers = reader.fieldnames
                    
                    rows = []
                    for i, row in enumerate(reader, 2):  # Start at 2 (header is row 1)
                        rows.append((i, row))
                        
                        # Check for None keys
                        none_keys = [k for k in row.keys() if k is None]
                        if none_keys:
                            issues.append(f"Row {i}: Contains None keys (malformed CSV)")
                        
                        # Check for missing required fields
                        if not row.get('NAME') or not row['NAME'].strip():
                            issues.append(f"Row {i}: Missing or empty NAME field")
                            
                        # Check for field count mismatches
                        if len(row) != len(headers):
                            issues.append(f"Row {i}: Field count mismatch (expected {len(headers)}, got {len(row)})")
                    
                    print(f"✅ Successfully parsed {len(rows)} rows with {len(headers)} columns")
                    
            except Exception as e:
                issues.append(f"CSV parsing error: {e}")
            
        except Exception as e:
            issues.append(f"File reading error: {e}")
        
        return issues
    
    def create_backup(self):
        """Create backup of original file"""
        if not self.backup_file.exists():
            shutil.copy2(self.input_file, self.backup_file)
            print(f"✅ Backup created: {self.backup_file}")
        else:
            print(f"ℹ️  Backup already exists: {self.backup_file}")
    
    def extract_lists_from_text(self, text: str) -> List[str]:
        """Extract bullet point lists from text (same logic as 02_products_to_config.py)"""
        if not text:
            return []
        
        # Fix any line break issues - join lines that don't start with list markers
        lines = text.split('\n')
        fixed_lines = []
        current_item = ""
        
        for line in lines:
            line_stripped = line.strip()
            
            # Check if this line starts a new list item
            if line_stripped.startswith(('- ', '* ', '•')):
                # Save previous item if exists
                if current_item:
                    fixed_lines.append(current_item)
                # Start new item
                current_item = line_stripped
            elif line_stripped and current_item:
                # This is a continuation of the previous item
                current_item += " " + line_stripped
            elif line_stripped and not current_item:
                # This is a non-list line at the beginning
                if line_stripped.startswith('-'):
                    current_item = line_stripped
                else:
                    # Try to be smart about non-standard list items
                    current_item = "- " + line_stripped
        
        # Don't forget the last item
        if current_item:
            fixed_lines.append(current_item)
        
        # Now extract the actual list items
        items = []
        for line in fixed_lines:
            line = line.strip()
            if line.startswith('- ') or line.startswith('* '):
                items.append(line[2:].strip())
            elif line.startswith('•'):
                items.append(line[1:].strip())
            elif line.startswith('-') and len(line) > 1:
                # Handle case where there's no space after dash
                items.append(line[1:].strip())
        
        return items
    
    def validate_field_content(self, field_name: str, content: str) -> List[str]:
        """Validate specific field content"""
        issues = []
        
        if field_name in ['KEY FEATURES', 'BENEFITS', 'IDEAL CLIENT']:
            # These should be lists
            items = self.extract_lists_from_text(content)
            if not items and content.strip():
                issues.append(f"{field_name}: Content appears to be non-list format")
            elif len(items) < 2:
                issues.append(f"{field_name}: Should have multiple items (found {len(items)})")
        
        return issues
    
    def clean_csv(self, auto_replace: bool = False):
        """Clean the CSV file"""
        print(f"🧹 Cleaning CSV: {self.input_file}")
        
        # Create backup first
        self.create_backup()
        
        try:
            # Read the data using CSV reader for proper parsing
            rows = []
            with open(self.input_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                headers = reader.fieldnames
                
                if not headers:
                    raise ValueError("No headers found in CSV")
                
                for row in reader:
                    # Clean each field
                    cleaned_row = {}
                    for key, value in row.items():
                        if key is not None:  # Handle None keys
                            clean_key = key.strip()
                            clean_value = value.strip() if value else ""
                            cleaned_row[clean_key] = clean_value
                    
                    rows.append(cleaned_row)
            
            # Use expected headers if available, otherwise use cleaned headers
            clean_headers = [h.strip() for h in headers if h is not None]
            output_headers = self.expected_headers if all(h in clean_headers for h in self.expected_headers) else clean_headers
            
            # Write cleaned version
            with open(self.clean_file, 'w', encoding='utf-8', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=output_headers, quoting=csv.QUOTE_MINIMAL)
                writer.writeheader()
                
                for row in rows:
                    # Only include fields that exist in output headers
                    clean_row = {h: row.get(h, '') for h in output_headers}
                    writer.writerow(clean_row)
            
            print(f"✅ Cleaned CSV saved: {self.clean_file}")
            
            # Validate the cleaned version
            validation_issues = self.validate_cleaned_csv()
            if validation_issues:
                print(f"⚠️  Validation found {len(validation_issues)} remaining issues:")
                for issue in validation_issues[:5]:
                    print(f"   • {issue}")
                if len(validation_issues) > 5:
                    print(f"   ... and {len(validation_issues) - 5} more")
            else:
                print("✅ Cleaned CSV validates successfully")
                
                # Offer to replace original
                if auto_replace:
                    replace = True
                else:
                    replace = input("\\n🔄 Replace original file with cleaned version? (y/N): ").lower() == 'y'
                
                if replace:
                    shutil.move(str(self.clean_file), str(self.input_file))
                    print(f"✅ Original file replaced with cleaned version")
                else:
                    print(f"ℹ️  Cleaned version saved as: {self.clean_file}")
            
        except Exception as e:
            print(f"❌ Cleaning failed: {e}")
    
    def validate_cleaned_csv(self) -> List[str]:
        """Validate the cleaned CSV"""
        if not self.clean_file.exists():
            return ["Cleaned file does not exist"]
        
        try:
            issues = []
            content_issues = []
            
            with open(self.clean_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                headers = reader.fieldnames
                
                if not headers:
                    return ["No headers found"]
                
                row_count = 0
                for i, row in enumerate(reader, 2):
                    row_count += 1
                    
                    # Check field count
                    if len(row) != len(headers):
                        issues.append(f"Row {i}: Field count mismatch")
                    
                    # Check for None keys
                    none_keys = [k for k in row.keys() if k is None]
                    if none_keys:
                        issues.append(f"Row {i}: None keys present")
                    
                    # Check required fields
                    if not row.get('NAME') or not row['NAME'].strip():
                        issues.append(f"Row {i}: Missing NAME")
                    
                    # Validate field content
                    for field_name, content in row.items():
                        if field_name and content:
                            field_issues = self.validate_field_content(field_name, content)
                            for issue in field_issues:
                                content_issues.append(f"Row {i}: {issue}")
                
                print(f"✅ Validated {row_count} rows with {len(headers)} columns")
                
            return issues + content_issues[:10]  # Limit content issues to avoid spam
            
        except Exception as e:
            return [f"Validation error: {e}"]

def main():
    parser = argparse.ArgumentParser(description='STAGE 0: Clean and validate CSV file for product pipeline')
    parser.add_argument('--input', default="../data/BN Products List - 2025.csv", 
                       help='Input CSV file path (default: ../data/BN Products List - 2025.csv)')
    parser.add_argument('--check-only', action='store_true', 
                       help='Only check for issues, do not clean')
    parser.add_argument('--auto', action='store_true',
                       help='Auto-clean without prompting')
    
    args = parser.parse_args()
    
    cleaner = CSVCleaner(args.input)
    
    print("🔍 STAGE 0: CSV Cleaner")
    print("=" * 50)
    print(f"Input: {cleaner.input_file}")
    
    # Always analyze first
    print("\\n📋 Analyzing CSV file...")
    issues = cleaner.analyze_csv()
    
    if not issues:
        print("✅ No issues found in CSV file!")
        print("CSV is ready for the product pipeline.")
        return 0
    
    print(f"⚠️  Found {len(issues)} issues:")
    for i, issue in enumerate(issues, 1):
        print(f"   {i:2d}. {issue}")
    
    if args.check_only:
        return 0
    
    # Offer to clean or auto-clean
    if args.auto:
        print(f"\\n🧹 Auto-cleaning CSV file...")
        cleaner.clean_csv(auto_replace=True)
    else:
        print(f"\\n🧹 Clean the CSV file?")
        clean = input("Proceed with cleaning? (y/N): ")
        
        if clean.lower() == 'y':
            cleaner.clean_csv(auto_replace=False)
        else:
            print("❌ Cleaning cancelled")
    
    return 0

if __name__ == "__main__":
    exit(main())