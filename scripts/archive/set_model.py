#!/usr/bin/env python3
"""
Model Configuration Utility
Updates the global OpenAI model configuration in .env file.

Usage:
  python3 set_model.py gpt-5-mini       # Set to GPT-5 Mini
  python3 set_model.py gpt-5            # Set to full GPT-5  
  python3 set_model.py gpt-4o           # Set to GPT-4o
  python3 set_model.py --list           # List available models
  python3 set_model.py --show           # Show current model
"""

import os
import sys
import argparse
from pathlib import Path

class ModelConfigManager:
    def __init__(self, env_file="../.env"):
        self.env_file = Path(env_file)
        self.available_models = [
            "gpt-5",
            "gpt-5-mini", 
            "gpt-5-nano",
            "gpt-4o",
            "gpt-4o-mini",
            "gpt-4-turbo",
            "gpt-3.5-turbo"
        ]
    
    def read_env_file(self):
        """Read the current .env file"""
        if not self.env_file.exists():
            return {}
        
        env_vars = {}
        with open(self.env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key] = value.strip('"')
        
        return env_vars
    
    def write_env_file(self, env_vars):
        """Write updated .env file"""
        with open(self.env_file, 'w') as f:
            f.write("# OpenAI Configuration\n")
            f.write(f"OPENAI_API_KEY={env_vars.get('OPENAI_API_KEY', '')}\n")
            f.write(f"VITE_OPENAI_API_KEY={env_vars.get('VITE_OPENAI_API_KEY', '')}\n")
            f.write("\n# Global Model Configuration\n")
            f.write(f"DEFAULT_OPENAI_MODEL={env_vars.get('DEFAULT_OPENAI_MODEL', 'gpt-5-mini')}\n")
            f.write(f"CREATIVE_MODEL={env_vars.get('CREATIVE_MODEL', env_vars.get('DEFAULT_OPENAI_MODEL', 'gpt-5-mini'))}\n")
            f.write(f"ANALYTICAL_MODEL={env_vars.get('ANALYTICAL_MODEL', env_vars.get('DEFAULT_OPENAI_MODEL', 'gpt-5-mini'))}\n")
            
            # Write other env vars
            for key, value in env_vars.items():
                if not key.startswith(('OPENAI_', 'VITE_OPENAI_', 'DEFAULT_OPENAI_', 'CREATIVE_', 'ANALYTICAL_')):
                    f.write(f"{key}={value}\n")
    
    def get_current_model(self):
        """Get the currently configured model"""
        env_vars = self.read_env_file()
        return env_vars.get('DEFAULT_OPENAI_MODEL', 'gpt-5-mini')
    
    def set_model(self, model_name):
        """Set the default model"""
        if model_name not in self.available_models:
            print(f"❌ Unknown model: {model_name}")
            print(f"Available models: {', '.join(self.available_models)}")
            return False
        
        env_vars = self.read_env_file()
        old_model = env_vars.get('DEFAULT_OPENAI_MODEL', 'gpt-5-mini')
        
        # Update model configuration
        env_vars['DEFAULT_OPENAI_MODEL'] = model_name
        env_vars['CREATIVE_MODEL'] = model_name  
        env_vars['ANALYTICAL_MODEL'] = model_name
        
        # Write updated file
        self.write_env_file(env_vars)
        
        print(f"✅ Updated model configuration:")
        print(f"   Old model: {old_model}")
        print(f"   New model: {model_name}")
        print(f"   Updated: {self.env_file}")
        
        return True
    
    def list_models(self):
        """List all available models"""
        current = self.get_current_model()
        
        print("\n📋 Available OpenAI Models:")
        
        print("\n🚀 GPT-5 Models (Recommended):")
        gpt5_models = [m for m in self.available_models if m.startswith('gpt-5')]
        for model in gpt5_models:
            marker = " ✅ (current)" if model == current else ""
            if model == "gpt-5-mini":
                print(f"   • {model} - Best balance of cost/performance{marker}")
            elif model == "gpt-5-nano":
                print(f"   • {model} - Fastest and cheapest{marker}")
            elif model == "gpt-5":
                print(f"   • {model} - Full reasoning model{marker}")
        
        print("\n🔧 GPT-4 Models (Legacy):")
        gpt4_models = [m for m in self.available_models if m.startswith('gpt-4')]
        for model in gpt4_models:
            marker = " ✅ (current)" if model == current else ""
            print(f"   • {model}{marker}")
        
        print("\n⚠️  GPT-3.5 Models (Deprecated):")
        gpt3_models = [m for m in self.available_models if m.startswith('gpt-3')]
        for model in gpt3_models:
            marker = " ✅ (current)" if model == current else ""
            print(f"   • {model}{marker}")
        
        print(f"\n💡 Current model: {current}")
    
    def show_current(self):
        """Show current model configuration"""
        env_vars = self.read_env_file()
        
        print("\n🔧 Current Model Configuration:")
        print(f"   Default Model: {env_vars.get('DEFAULT_OPENAI_MODEL', 'Not set')}")
        print(f"   Creative Model: {env_vars.get('CREATIVE_MODEL', 'Not set')}")  
        print(f"   Analytical Model: {env_vars.get('ANALYTICAL_MODEL', 'Not set')}")
        print(f"   Config File: {self.env_file}")

def main():
    parser = argparse.ArgumentParser(description='Manage OpenAI model configuration')
    group = parser.add_mutually_exclusive_group()
    
    group.add_argument('model', nargs='?', help='Model name to set (e.g., gpt-5-mini)')
    group.add_argument('--list', action='store_true', help='List available models')
    group.add_argument('--show', action='store_true', help='Show current model configuration')
    
    args = parser.parse_args()
    
    manager = ModelConfigManager()
    
    try:
        if args.list:
            manager.list_models()
        elif args.show:
            manager.show_current()
        elif args.model:
            manager.set_model(args.model)
        else:
            print("❌ Please specify a model name, --list, or --show")
            print("Usage: python3 set_model.py gpt-5-mini")
            print("       python3 set_model.py --list")
            print("       python3 set_model.py --show")
            return 1
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())