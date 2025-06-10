#!/usr/bin/env python3
"""
Product Analysis Tool
Analyzes generated product files and creates summary reports for internal team use.
"""

import os
import re
import csv
from pathlib import Path
from datetime import datetime
import json

class ProductAnalyzer:
    def __init__(self, products_dir="products"):
        self.products_dir = Path(products_dir)
        self.products = {}
        self.stages = [
            "01_big_idea_product_manifesto",
            "02_idea_exploration_functional_spec", 
            "03_idea_exploration_audience_icps",
            "04_idea_exploration_user_stories",
            "05_plan_competitor_sweep",
            "06_plan_tam_sizing",
            "07_research_prd_skeleton",
            "08_research_prd_ui_prompt",
            "09_build_generate_screens",
            "10_build_ui_landing_page_copy",
            "11_build_ui_key_messages",
            "12_demo_investor_deck",
            "13_demo_demo_script",
            "14_demo_slide_headlines",
            "15_demo_qa_prep"
        ]
        
    def analyze_file(self, filepath):
        """Analyze a single product file and extract metadata"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Extract metadata
            file_info = {
                'filepath': str(filepath),
                'filename': filepath.name,
                'size_kb': round(filepath.stat().st_size / 1024, 1),
                'lines': len(content.split('\n')),
                'has_error': 'Error generating content:' in content,
                'is_complete': len(content.strip()) > 500,  # Basic completeness check
                'generated_date': None,
                'product_name': None,
                'stage': None,
                'price': None
            }
            
            # Extract generated date
            date_match = re.search(r'\*\*Generated on:\*\* (.+)', content)
            if date_match:
                file_info['generated_date'] = date_match.group(1)
            
            # Extract product name and stage from filename
            # Format: 01_ai_power_hour_01_big_idea_product_manifesto.md
            filename_parts = filepath.stem.split('_')
            if len(filename_parts) >= 5:
                # First part is product number (01, 02, etc.)
                file_info['product_num'] = filename_parts[0]
                
                # Find where the stage number starts (looking for pattern like _01_, _02_, etc.)
                stage_start_idx = None
                for i in range(2, len(filename_parts)):
                    if filename_parts[i].isdigit() and len(filename_parts[i]) == 2:
                        stage_start_idx = i
                        break
                
                if stage_start_idx:
                    # Product name is between product number and stage number
                    file_info['product_name'] = '_'.join(filename_parts[1:stage_start_idx])
                    # Stage is from stage number to end
                    file_info['stage_num'] = '_'.join(filename_parts[stage_start_idx:])
                else:
                    # Fallback: assume last two parts are stage
                    file_info['product_name'] = '_'.join(filename_parts[1:-2])
                    file_info['stage_num'] = '_'.join(filename_parts[-2:])
            
            # Extract price from content
            price_match = re.search(r'\*\*Price:\*\* (.+)', content)
            if price_match:
                file_info['price'] = price_match.group(1)
            
            # Extract key insights for manifestos
            if 'product_manifesto' in filepath.name:
                file_info['key_insights'] = self.extract_manifesto_insights(content)
            
            # Check for high-value content
            file_info['is_high_value'] = self.is_high_value_content(filepath.name, content)
            
            return file_info
            
        except Exception as e:
            return {
                'filepath': str(filepath),
                'filename': filepath.name,
                'error': str(e),
                'has_error': True
            }
    
    def extract_manifesto_insights(self, content):
        """Extract key insights from product manifesto"""
        insights = {}
        
        # Extract Problem, Solution, Magic Moment
        problem_match = re.search(r'\*\*Problem:\*\*\s*(.+?)(?=\*\*|$)', content, re.DOTALL)
        if problem_match:
            insights['problem'] = problem_match.group(1).strip()[:200] + "..."
        
        solution_match = re.search(r'\*\*Solution:\*\*\s*(.+?)(?=\*\*|$)', content, re.DOTALL)
        if solution_match:
            insights['solution'] = solution_match.group(1).strip()[:200] + "..."
            
        magic_match = re.search(r'\*\*Magic Moment:\*\*\s*(.+?)(?=\*\*|$)', content, re.DOTALL)
        if magic_match:
            insights['magic_moment'] = magic_match.group(1).strip()[:200] + "..."
            
        return insights
    
    def is_high_value_content(self, filename, content):
        """Determine if content is high-value for team review"""
        high_value_stages = [
            'product_manifesto',
            'competitor_sweep', 
            'user_stories',
            'tam_sizing',
            'investor_deck'
        ]
        
        # Check if it's a high-value stage
        for stage in high_value_stages:
            if stage in filename:
                return True
                
        # Check content quality indicators
        if len(content) > 5000 and 'Error generating content:' not in content:
            return True
            
        return False
    
    def scan_all_files(self):
        """Scan all product files and organize by product"""
        for filepath in self.products_dir.glob("*.md"):
            file_info = self.analyze_file(filepath)
            
            if 'product_name' in file_info and file_info['product_name']:
                product_name = file_info['product_name']
                
                if product_name not in self.products:
                    self.products[product_name] = {
                        'name': product_name,
                        'files': {},
                        'completion_status': {},
                        'errors': [],
                        'high_value_files': [],
                        'total_files': 0,
                        'completed_files': 0,
                        'price': None
                    }
                
                # Add file to product
                stage = file_info.get('stage_num', 'unknown')
                self.products[product_name]['files'][stage] = file_info
                self.products[product_name]['total_files'] += 1
                
                if file_info.get('is_complete', False):
                    self.products[product_name]['completed_files'] += 1
                
                if file_info.get('has_error', False):
                    self.products[product_name]['errors'].append(file_info)
                
                if file_info.get('is_high_value', False):
                    self.products[product_name]['high_value_files'].append(file_info)
                
                if file_info.get('price') and not self.products[product_name]['price']:
                    self.products[product_name]['price'] = file_info['price']
    
    def generate_master_index(self):
        """Generate master index of all products and their status"""
        index_data = []
        
        for product_name, product_data in self.products.items():
            completion_rate = (product_data['completed_files'] / product_data['total_files']) * 100 if product_data['total_files'] > 0 else 0
            
            index_data.append({
                'Product': product_name.replace('_', ' ').title(),
                'Price': product_data.get('price', 'N/A'),
                'Total Files': product_data['total_files'],
                'Completed': product_data['completed_files'],
                'Completion %': f"{completion_rate:.1f}%",
                'Errors': len(product_data['errors']),
                'High Value Files': len(product_data['high_value_files']),
                'Status': self.get_status(product_data)
            })
        
        # Sort by completion rate
        index_data.sort(key=lambda x: float(x['Completion %'].rstrip('%')), reverse=True)
        
        return index_data
    
    def get_status(self, product_data):
        """Determine overall status of a product"""
        if len(product_data['errors']) > 3:
            return "❌ Multiple Errors"
        elif len(product_data['errors']) > 0:
            return "⚠️ Has Errors"
        elif product_data['completed_files'] == product_data['total_files']:
            return "✅ Complete"
        elif product_data['completed_files'] > 10:
            return "🔄 Nearly Complete"
        else:
            return "🚧 In Progress"
    
    def extract_key_insights(self):
        """Extract key insights from all product manifestos"""
        insights = []
        
        for product_name, product_data in self.products.items():
            manifesto_file = product_data['files'].get('01_big_idea_product_manifesto')
            if manifesto_file and 'key_insights' in manifesto_file:
                insights.append({
                    'Product': product_name.replace('_', ' ').title(),
                    'Price': product_data.get('price', 'N/A'),
                    'Problem': manifesto_file['key_insights'].get('problem', 'N/A'),
                    'Solution': manifesto_file['key_insights'].get('solution', 'N/A'),
                    'Magic Moment': manifesto_file['key_insights'].get('magic_moment', 'N/A')
                })
        
        return insights
    
    def identify_issues(self):
        """Identify failed/incomplete stages that need attention"""
        issues = []
        
        for product_name, product_data in self.products.items():
            # Check for errors
            for error_file in product_data['errors']:
                issues.append({
                    'Product': product_name.replace('_', ' ').title(),
                    'Issue Type': 'Generation Error',
                    'Stage': error_file.get('stage_num', 'Unknown'),
                    'File': error_file['filename'],
                    'Priority': 'High' if 'token' in error_file.get('filepath', '') else 'Medium',
                    'Description': 'Failed to generate content'
                })
            
            # Check for missing stages
            for stage in self.stages:
                if stage not in product_data['files']:
                    issues.append({
                        'Product': product_name.replace('_', ' ').title(),
                        'Issue Type': 'Missing Stage',
                        'Stage': stage,
                        'File': f"{product_name}_{stage}.md",
                        'Priority': 'Medium',
                        'Description': 'Stage not generated'
                    })
            
            # Check for incomplete files
            for stage, file_info in product_data['files'].items():
                if not file_info.get('is_complete', False) and not file_info.get('has_error', False):
                    issues.append({
                        'Product': product_name.replace('_', ' ').title(),
                        'Issue Type': 'Incomplete Content',
                        'Stage': stage,
                        'File': file_info['filename'],
                        'Priority': 'Low',
                        'Description': f"Content too short ({file_info.get('size_kb', 0)}KB)"
                    })
        
        # Sort by priority
        priority_order = {'High': 0, 'Medium': 1, 'Low': 2}
        issues.sort(key=lambda x: priority_order.get(x['Priority'], 3))
        
        return issues
    
    def get_high_value_content(self):
        """Get list of high-value content for team review"""
        high_value = []
        
        for product_name, product_data in self.products.items():
            for file_info in product_data['high_value_files']:
                high_value.append({
                    'Product': product_name.replace('_', ' ').title(),
                    'Stage': file_info.get('stage_num', 'Unknown'),
                    'File': file_info['filename'],
                    'Size (KB)': file_info.get('size_kb', 0),
                    'Type': self.get_content_type(file_info['filename']),
                    'Priority': self.get_review_priority(file_info['filename'])
                })
        
        # Sort by priority and size
        priority_order = {'Critical': 0, 'High': 1, 'Medium': 2}
        high_value.sort(key=lambda x: (priority_order.get(x['Priority'], 3), -x['Size (KB)']))
        
        return high_value
    
    def get_content_type(self, filename):
        """Determine content type from filename"""
        if 'manifesto' in filename:
            return 'Strategy'
        elif 'competitor' in filename:
            return 'Market Research'
        elif 'user_stories' in filename:
            return 'Product Planning'
        elif 'tam_sizing' in filename:
            return 'Market Analysis'
        elif 'investor' in filename:
            return 'Fundraising'
        else:
            return 'Development'
    
    def get_review_priority(self, filename):
        """Determine review priority"""
        critical_stages = ['manifesto', 'competitor_sweep', 'tam_sizing']
        high_stages = ['user_stories', 'investor_deck', 'functional_spec']
        
        for stage in critical_stages:
            if stage in filename:
                return 'Critical'
        
        for stage in high_stages:
            if stage in filename:
                return 'High'
        
        return 'Medium'
    
    def save_reports(self):
        """Save all reports to files"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        reports_dir = Path("reports")
        reports_dir.mkdir(exist_ok=True)
        
        # Master Index
        master_index = self.generate_master_index()
        with open(reports_dir / f"master_index_{timestamp}.csv", 'w', newline='') as f:
            if master_index:
                writer = csv.DictWriter(f, fieldnames=master_index[0].keys())
                writer.writeheader()
                writer.writerows(master_index)
        
        # Key Insights
        insights = self.extract_key_insights()
        with open(reports_dir / f"key_insights_{timestamp}.csv", 'w', newline='') as f:
            if insights:
                writer = csv.DictWriter(f, fieldnames=insights[0].keys())
                writer.writeheader()
                writer.writerows(insights)
        
        # Issues Report
        issues = self.identify_issues()
        with open(reports_dir / f"issues_report_{timestamp}.csv", 'w', newline='') as f:
            if issues:
                writer = csv.DictWriter(f, fieldnames=issues[0].keys())
                writer.writeheader()
                writer.writerows(issues)
        
        # High Value Content
        high_value = self.get_high_value_content()
        with open(reports_dir / f"high_value_content_{timestamp}.csv", 'w', newline='') as f:
            if high_value:
                writer = csv.DictWriter(f, fieldnames=high_value[0].keys())
                writer.writeheader()
                writer.writerows(high_value)
        
        # Summary JSON for web interface
        summary = {
            'generated_at': datetime.now().isoformat(),
            'total_products': len(self.products),
            'total_files': sum(p['total_files'] for p in self.products.values()),
            'total_errors': sum(len(p['errors']) for p in self.products.values()),
            'products': self.products,
            'master_index': master_index,
            'insights': insights,
            'issues': issues,
            'high_value': high_value
        }
        
        with open(reports_dir / f"summary_{timestamp}.json", 'w') as f:
            json.dump(summary, f, indent=2, default=str)
        
        return {
            'timestamp': timestamp,
            'reports_dir': str(reports_dir),
            'files_created': [
                f"master_index_{timestamp}.csv",
                f"key_insights_{timestamp}.csv", 
                f"issues_report_{timestamp}.csv",
                f"high_value_content_{timestamp}.csv",
                f"summary_{timestamp}.json"
            ]
        }

def main():
    print("🔍 Analyzing product files...")
    analyzer = ProductAnalyzer()
    analyzer.scan_all_files()
    
    print(f"📊 Found {len(analyzer.products)} products with {sum(p['total_files'] for p in analyzer.products.values())} total files")
    
    print("💾 Generating reports...")
    result = analyzer.save_reports()
    
    print(f"✅ Reports saved to {result['reports_dir']}/")
    for filename in result['files_created']:
        print(f"   - {filename}")
    
    # Quick summary
    print("\n📈 Quick Summary:")
    master_index = analyzer.generate_master_index()
    for product in master_index[:3]:  # Top 3 products
        print(f"   {product['Product']}: {product['Completion %']} complete, {product['Status']}")
    
    issues = analyzer.identify_issues()
    high_priority_issues = [i for i in issues if i['Priority'] == 'High']
    print(f"\n⚠️  {len(high_priority_issues)} high-priority issues need attention")
    
    high_value = analyzer.get_high_value_content()
    print(f"🎯 {len(high_value)} high-value files ready for team review")

if __name__ == "__main__":
    main() 