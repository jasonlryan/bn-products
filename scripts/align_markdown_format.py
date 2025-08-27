#!/usr/bin/env python3
"""
Align all markdown files to follow the template.md structure.
This ensures consistent parsing across all products.
"""

import re
from pathlib import Path
from typing import Dict, List, Tuple

class MarkdownAligner:
    def __init__(self):
        self.markdown_dir = Path("../data/update_270825.md")
        self.aligned_dir = Path("../data/update_270825_aligned")
        self.aligned_dir.mkdir(exist_ok=True)
        
        # Section mappings to standardize headers
        self.section_mappings = {
            # Variations of section 2
            "Why teams choose": "### Section 2: Why teams choose this",
            "Why leaders choose": "### Section 2: Why teams choose this",  
            "Why book": "### Section 2: Why teams choose this",
            
            # Variations of section 3
            "How it works": "### Section 3: How it works",
            
            # Variations of section 4
            "What our clients say": "### Section 4: What our clients say",
            "Client testimonials": "### Section 4: What our clients say",
            
            # Variations of section 5
            "What about": "### Section 5: What about...?",
            
            # Variations of section 6
            "What you get": "### Section 6: What you get"
        }

    def detect_current_format(self, content: str) -> str:
        """Detect the format of the markdown file."""
        if "Section 1:" in content or "Section 2:" in content:
            return "numbered_sections"
        elif "###" in content:
            return "markdown_headers" 
        else:
            return "plain_headers"

    def extract_hero_content(self, lines: List[str]) -> Tuple[List[str], int]:
        """Extract hero section content from the beginning of the file."""
        hero_lines = []
        idx = 0
        
        # First line is always the product name
        if idx < len(lines):
            hero_lines.append(lines[idx])
            idx += 1
        
        # Continue until we hit a section marker
        while idx < len(lines):
            line = lines[idx]
            # Check if this is a section header
            is_section = False
            for pattern in self.section_mappings.keys():
                if pattern.lower() in line.lower() and idx > 3:
                    is_section = True
                    break
            
            if is_section or line.startswith("Section"):
                break
            
            hero_lines.append(line)
            idx += 1
        
        return hero_lines, idx

    def parse_sections(self, lines: List[str], start_idx: int) -> Dict[str, List[str]]:
        """Parse remaining sections from the content."""
        sections = {}
        current_section = None
        current_content = []
        
        for i in range(start_idx, len(lines)):
            line = lines[i]
            
            # Check if this is a section header
            is_new_section = False
            section_key = None
            
            # Check against known patterns
            for pattern, standard_header in self.section_mappings.items():
                if pattern.lower() in line.lower():
                    is_new_section = True
                    section_key = standard_header
                    break
            
            # Also check for "Section N:" format
            if line.startswith("Section") and ":" in line:
                is_new_section = True
                # Extract the section name after the colon
                section_name = line.split(":", 1)[1].strip()
                section_name = section_name.split("(")[0].strip()  # Remove (Frame N)
                
                # Map to standard header
                for pattern, standard_header in self.section_mappings.items():
                    if pattern.lower() in section_name.lower():
                        section_key = standard_header
                        break
            
            if is_new_section and section_key:
                # Save previous section
                if current_section:
                    sections[current_section] = current_content
                
                current_section = section_key
                current_content = []
            elif current_section:
                # Skip visual instruction lines
                if not (line.strip().startswith("{") and line.strip().endswith("}")):
                    current_content.append(line)
        
        # Save last section
        if current_section:
            sections[current_section] = current_content
        
        return sections

    def format_benefit_item(self, line: str) -> str:
        """Format a benefit item with proper structure."""
        # Remove existing bullet points
        line = line.strip(" -•*")
        
        # Check if line has title:description format
        if ":" in line:
            parts = line.split(":", 1)
            return f"- **{parts[0].strip()}**: {parts[1].strip()}"
        else:
            return f"- {line}"

    def format_step_item(self, line: str) -> str:
        """Format a how-it-works step."""
        line = line.strip()
        
        # Check for verb + description format
        if " – " in line or " — " in line:
            # Already formatted correctly
            return f"- {line}"
        elif line[0].isupper() and " " in line:
            # Might be "Verb rest of description"
            parts = line.split(" ", 1)
            if len(parts[0]) < 15:  # Likely a verb
                return f"- **{parts[0]}** {parts[1]}"
        
        return f"- {line}"

    def align_markdown_file(self, filepath: Path) -> str:
        """Align a single markdown file to the standard template."""
        content = filepath.read_text(encoding='utf-8')
        lines = content.strip().split('\n')
        
        # Extract hero content
        hero_lines, start_idx = self.extract_hero_content(lines)
        
        # Parse sections
        sections = self.parse_sections(lines, start_idx)
        
        # Build aligned content
        aligned_content = []
        
        # Section 1: Hero
        aligned_content.append("### Section 1: Hero")
        aligned_content.append("")
        aligned_content.extend(hero_lines)
        aligned_content.append("")
        
        # Section 2: Why teams choose this
        if "### Section 2: Why teams choose this" in sections:
            aligned_content.append("### Section 2: Why teams choose this")
            aligned_content.append("")
            
            for line in sections["### Section 2: Why teams choose this"]:
                if line.strip():
                    aligned_content.append(self.format_benefit_item(line))
            aligned_content.append("")
        
        # Section 3: How it works
        if "### Section 3: How it works" in sections:
            aligned_content.append("### Section 3: How it works")
            aligned_content.append("")
            
            for line in sections["### Section 3: How it works"]:
                if line.strip() and not line.strip().startswith("("):
                    aligned_content.append(self.format_step_item(line))
            aligned_content.append("")
        
        # Section 4: What our clients say
        if "### Section 4: What our clients say" in sections:
            aligned_content.append("### Section 4: What our clients say")
            aligned_content.append("")
            
            testimonial_lines = sections["### Section 4: What our clients say"]
            quote_lines = []
            attribution = ""
            
            for line in testimonial_lines:
                line = line.strip()
                if line.startswith('"') or (quote_lines and not line.startswith('—')):
                    quote_lines.append(line)
                elif line.startswith('—') or line.startswith('-'):
                    attribution = line
            
            if quote_lines:
                aligned_content.append("> " + " ".join(quote_lines))
                if attribution:
                    aligned_content.append(f"> {attribution}")
            aligned_content.append("")
        
        # Section 5: What about...?
        if "### Section 5: What about...?" in sections:
            aligned_content.append("### Section 5: What about...?")
            aligned_content.append("")
            
            for line in sections["### Section 5: What about...?"]:
                if line.strip() and "?" in line:
                    parts = line.split("?", 1)
                    if len(parts) == 2:
                        aligned_content.append(f"- **{parts[0].strip()}?** {parts[1].strip()}")
            aligned_content.append("")
        
        # Section 6: What you get
        if "### Section 6: What you get" in sections:
            aligned_content.append("### Section 6: What you get")
            aligned_content.append("")
            
            for line in sections["### Section 6: What you get"]:
                if line.strip():
                    aligned_content.append(line)
            aligned_content.append("")
        
        return "\n".join(aligned_content)

    def align_all_files(self):
        """Process all markdown files except template.md."""
        print("🚀 Aligning markdown files to standard format...\n")
        
        files_to_process = [
            "power_hour.md",
            "ai_b_c.md", 
            "ai_innovation.md",
            "ai_leadership_partner.md",
            "ai_sprint.md",
            "ai_sherpa.md",
            "ai_acceleration_day.md",
            "ai_market_intelligence_platform.md"
        ]
        
        success_count = 0
        
        for filename in files_to_process:
            filepath = self.markdown_dir / filename
            
            if not filepath.exists():
                print(f"⚠️  File not found: {filepath}")
                continue
            
            print(f"📄 Processing {filename}...")
            
            try:
                # Align the content
                aligned_content = self.align_markdown_file(filepath)
                
                # Save aligned version
                output_path = self.aligned_dir / filename
                output_path.write_text(aligned_content, encoding='utf-8')
                
                success_count += 1
                print(f"   ✅ Aligned and saved to: {output_path.name}")
                
            except Exception as e:
                print(f"   ❌ Error: {e}")
        
        print(f"\n✅ Completed: {success_count}/{len(files_to_process)} files aligned")
        print(f"📁 Aligned files saved in: {self.aligned_dir}")
        print("\n📝 Next step: Run parse_landing_markdown.py using the aligned files")

if __name__ == "__main__":
    aligner = MarkdownAligner()
    aligner.align_all_files()