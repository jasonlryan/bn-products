#!/usr/bin/env python3
"""
CSV Cleaning Script
Fixes common CSV parsing issues for the product pipeline.

Usage:
  python3 clean_csv.py                    # Clean the default CSV file
  python3 clean_csv.py --input path.csv   # Clean specific file
  python3 clean_csv.py --check-only       # Just check for issues
"""

import csv
import os
import re
import argparse
from pathlib import Path

class CSVCleaner:
    def __init__(self, input_file="../data/BN Products List   - 2025.csv"):
        self.input_file = Path(input_file)
        self.backup_file = self.input_file.with_suffix('.csv.backup')
        self.clean_file = self.input_file.with_suffix('.clean.csv')
        
    def analyze_csv(self):
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
                headers = [h.strip('"') for h in header_line.split(',')]
                
                # Check for trailing spaces
                trailing_spaces = [h for h in headers if h != h.strip()]
                if trailing_spaces:
                    issues.append(f"Headers with trailing spaces: {trailing_spaces}")
                
                # Check for empty headers
                empty_headers = [i for i, h in enumerate(headers) if not h.strip()]
                if empty_headers:
                    issues.append(f"Empty headers at positions: {empty_headers}")
            
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
                            issues.append(f"Row {i}: Contains None keys")
                        
                        # Check for missing required fields
                        if not row.get('NAME') or not row['NAME'].strip():
                            issues.append(f"Row {i}: Missing or empty NAME field")
                            
                        # Check for unescaped quotes/commas in values
                        for key, value in row.items():
                            if key and value:
                                if '\n' in str(value) and '"""' not in str(value):
                                    issues.append(f"Row {i}: Unescaped newlines in {key}")
                                if '"' in str(value) and not (str(value).startswith('"') and str(value).endswith('"')):
                                    issues.append(f"Row {i}: Unescaped quotes in {key}")
                    
                    print(f"✅ Successfully parsed {len(rows)} rows")
                    
            except Exception as e:
                issues.append(f"CSV parsing error: {e}")
            
        except Exception as e:
            issues.append(f"File reading error: {e}")
        
        return issues
    
    def create_backup(self):
        """Create backup of original file"""
        if not self.backup_file.exists():
            import shutil
            shutil.copy2(self.input_file, self.backup_file)
            print(f"✅ Backup created: {self.backup_file}")
        else:
            print(f"ℹ️  Backup already exists: {self.backup_file}")
    
    def clean_csv(self):
        """Clean the CSV file"""
        print(f"🧹 Cleaning CSV: {self.input_file}")
        
        # Create backup first
        self.create_backup()
        
        try:
            # Read the raw content
            with open(self.input_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Fix common issues
            cleaned_content = self.fix_content(content)
            
            # Write cleaned version
            with open(self.clean_file, 'w', encoding='utf-8', newline='') as f:
                f.write(cleaned_content)
            
            print(f"✅ Cleaned CSV saved: {self.clean_file}")
            
            # Validate the cleaned version
            validation_issues = self.validate_cleaned_csv()
            if validation_issues:
                print(f"⚠️  Validation found {len(validation_issues)} remaining issues:")
                for issue in validation_issues[:3]:
                    print(f"   • {issue}")
                if len(validation_issues) > 3:
                    print(f"   ... and {len(validation_issues) - 3} more")
            else:
                print("✅ Cleaned CSV validates successfully")
                
                # Offer to replace original
                replace = input("\\n🔄 Replace original file with cleaned version? (y/N): ")
                if replace.lower() == 'y':
                    import shutil
                    shutil.move(str(self.clean_file), str(self.input_file))
                    print(f"✅ Original file replaced with cleaned version")
            
        except Exception as e:
            print(f"❌ Cleaning failed: {e}")
    
    def fix_content(self, content):
        """Fix common CSV content issues"""
        lines = content.split('\\n')
        
        if not lines:
            return content
        
        # Fix header line - remove trailing spaces
        header_line = lines[0]
        headers = [h.strip() for h in header_line.split(',')]
        
        # Reconstruct the CSV properly
        cleaned_lines = [','.join(headers)]
        
        # Process data lines - need to handle multiline values properly
        current_row = []
        in_quoted_field = False
        quote_count = 0
        
        for line_num, line in enumerate(lines[1:], 2):
            if not line.strip():
                continue
                
            # Simple approach: split by comma but respect quoted fields
            fields = []
            current_field = ""
            in_quotes = False
            i = 0
            
            while i < len(line):
                char = line[i]
                
                if char == '"':
                    if in_quotes and i + 1 < len(line) and line[i + 1] == '"':
                        # Escaped quote
                        current_field += '""'
                        i += 2
                        continue
                    else:
                        in_quotes = not in_quotes
                        current_field += char
                elif char == ',' and not in_quotes:
                    fields.append(current_field)
                    current_field = ""
                else:
                    current_field += char
                    
                i += 1
            
            # Add the last field
            if current_field or not fields:
                fields.append(current_field)
            
            # If we have the right number of fields, add the row
            if len(fields) == len(headers):
                # Clean each field
                clean_fields = []
                for field in fields:
                    # Remove surrounding quotes if present
                    if field.startswith('"') and field.endswith('"'):
                        field = field[1:-1]
                    
                    # Escape internal quotes
                    if '"' in field:
                        field = field.replace('"', '""')
                    
                    # If field contains comma, newline, or quote, wrap in quotes
                    if ',' in field or '\\n' in field or '"' in field:
                        field = f'"{field}"'
                    
                    clean_fields.append(field)
                
                cleaned_lines.append(','.join(clean_fields))
        
        return '\\n'.join(cleaned_lines)
    
    def validate_cleaned_csv(self):
        """Validate the cleaned CSV"""
        if not self.clean_file.exists():
            return ["Cleaned file does not exist"]
        
        try:
            issues = []
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
                
                print(f"✅ Validated {row_count} rows with {len(headers)} columns")
                
            return issues
            
        except Exception as e:
            return [f"Validation error: {e}"]

def main():
    parser = argparse.ArgumentParser(description='Clean CSV file for product pipeline')
    parser.add_argument('--input', default="../data/BN Products List   - 2025.csv", 
                       help='Input CSV file path')
    parser.add_argument('--check-only', action='store_true', 
                       help='Only check for issues, do not clean')
    parser.add_argument('--auto', action='store_true',
                       help='Auto-clean without prompting')
    
    args = parser.parse_args()
    
    cleaner = CSVCleaner(args.input)
    
    print("🔍 CSV Cleaner")
    print("=" * 40)
    
    # Always analyze first
    print("\\n📋 Analyzing CSV file...")
    issues = cleaner.analyze_csv()
    
    if not issues:
        print("✅ No issues found in CSV file!")
        return 0
    
    print(f"⚠️  Found {len(issues)} issues:")
    for i, issue in enumerate(issues, 1):
        print(f"   {i:2d}. {issue}")
    
    if args.check_only:
        return 0
    
    # Offer to clean or auto-clean
    if args.auto:
        print(f"\\n🧹 Auto-cleaning CSV file...")
        cleaner.clean_csv()
    else:
        print(f"\\n🧹 Clean the CSV file?")
        clean = input("Proceed with cleaning? (y/N): ")
        
        if clean.lower() == 'y':
            cleaner.clean_csv()
        else:
            print("❌ Cleaning cancelled")
    
    return 0

if __name__ == "__main__":
    exit(main())