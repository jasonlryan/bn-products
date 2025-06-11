#!/usr/bin/env python3
"""
Dashboard Launcher
Runs analysis and opens the reports dashboard with the latest data.
"""

import subprocess
import webbrowser
import time
from pathlib import Path
import json
import os

def run_analysis():
    """Run the product analysis script"""
    print("🔍 Running product analysis...")
    # Change to scripts directory and run the analysis script
    result = subprocess.run(['python3', 'analyze_products.py'], 
                          cwd=Path(__file__).parent, 
                          capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Analysis completed successfully")
        print(result.stdout)
        return True
    else:
        print("❌ Analysis failed:")
        print(result.stderr)
        return False

def get_latest_report():
    """Get the path to the latest summary report"""
    reports_dir = Path("../reports")
    if not reports_dir.exists():
        return None
    
    # Find the latest summary file
    summary_files = list(reports_dir.glob("summary_*.json"))
    if not summary_files:
        return None
    
    # Sort by modification time and get the latest
    latest_file = max(summary_files, key=lambda f: f.stat().st_mtime)
    return latest_file

def copy_report_to_ui():
    """Copy the latest report to UI folder for easy access"""
    latest_report = get_latest_report()
    if not latest_report:
        return None
    
    ui_dir = Path("../UI")
    ui_dir.mkdir(exist_ok=True)
    
    # Copy to UI folder as 'latest_report.json'
    latest_copy = ui_dir / "latest_report.json"
    
    with open(latest_report, 'r') as src:
        with open(latest_copy, 'w') as dst:
            dst.write(src.read())
    
    print(f"📋 Latest report copied to {latest_copy}")
    return latest_copy

def open_dashboard():
    """Open the dashboard in the default browser"""
    dashboard_path = Path("../UI/reports_dashboard.html").absolute()
    
    if not dashboard_path.exists():
        print(f"❌ Dashboard not found at {dashboard_path}")
        return False
    
    # Open in browser
    url = f"file://{dashboard_path}?report=latest_report.json"
    print(f"🌐 Opening dashboard: {url}")
    webbrowser.open(url)
    return True

def main():
    print("🚀 Product Development Dashboard Launcher")
    print("=" * 50)
    
    # Step 1: Run analysis
    if not run_analysis():
        print("❌ Cannot proceed without successful analysis")
        return
    
    # Step 2: Copy latest report to UI folder
    report_copy = copy_report_to_ui()
    if not report_copy:
        print("❌ No report found to display")
        return
    
    # Step 3: Open dashboard
    if open_dashboard():
        print("\n✅ Dashboard launched successfully!")
        print("📊 The dashboard should open in your browser automatically")
        print("💡 If it doesn't open, navigate to UI/reports_dashboard.html")
    else:
        print("❌ Failed to open dashboard")

if __name__ == "__main__":
    main() 