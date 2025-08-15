#!/usr/bin/env python3
"""
Manual CSV Fix - Create properly structured CSV from current data
Manually reconstructs the CSV with proper escaping and structure.
"""

import csv
from pathlib import Path

# Manually extracted and cleaned product data
products_data = [
    {
        "Type": "PRODUCT",
        "NAME": "AI Power Hour",
        "PRICE": "£300",
        "Primary Deliverables": "60-minute breakthrough session + personalized AI roadmap + implementation toolkit",
        "DESCRIPTION": "Get unstuck on your biggest AI challenge in 60 minutes. You'll walk away with 3 specific solutions you can implement immediately plus a personalized roadmap that skips months of trial-and-error.",
        "WHAT IS THE NEXT PRODUCT OR SERVICE?": "AI-B-C™",
        "PERFECT FOR:": "Senior leaders stuck on specific AI challenges who need breakthrough clarity fast",
        "WHAT THE CLIENT IS ACTUALLY BUYING": "Confidence to lead AI initiatives + immediate solutions for your exact challenge + skip 3-6 months of research",
        "IDEAL CLIENT": "- Senior leaders responsible for transformation, innovation, marketing, customer experience, or operations\n- Anyone feeling overwhelmed by AI possibilities who needs focused direction\n- Executives who learn best through personalized coaching",
        "KEY FEATURES": "- One-on-one expert guidance tailored to your exact challenge\n- Real-world solutions you can start implementing today\n- Personalized follow-up materials and roadmap",
        "BENEFITS": "- Skip 3-6 months of AI research and trial-and-error\n- Get solutions designed for your exact challenge and industry\n- Build confidence to lead AI initiatives in your organization\n- Start seeing measurable results within days, not months"
    },
    {
        "Type": "PRODUCT",
        "NAME": "AI-B-C™",
        "PRICE": "£2,000 for Executive Briefing (90 minutes)\n£8,800 for Team Workshop Day (full day)\n£17,500 for Complete Sprint Package (1 exec briefing + 2 team workshops)",
        "Primary Deliverables": "Complete AI transformation program: executive alignment + team capability + ongoing support",
        "DESCRIPTION": "Turn your entire team into AI power users in 90 days. Your people stop talking about AI and start using it daily to save 20+ hours per month each.",
        "WHAT IS THE NEXT PRODUCT OR SERVICE?": "AI Innovation Programme",
        "PERFECT FOR:": "Organizations with 50+ employees where AI adoption has stalled or never started\nTeams that need to move fast before competitors gain advantage",
        "WHAT THE CLIENT IS ACTUALLY BUYING": "90% of your team actively using AI within 30 days + measurable productivity gains + competitive advantage before rivals catch up",
        "IDEAL CLIENT": "- Medium to large enterprises (150+ employees)\n- Teams enthusiastic about AI but lacking practical knowledge\n- Organizations with employee development budgets\n- Companies where productivity gains directly impact bottom line",
        "KEY FEATURES": "- Modular curriculum that fits your team's schedule and needs\n- Role-specific learning paths for different departments\n- Hands-on workshops with real work scenarios\n- Progress tracking and success measurement",
        "BENEFITS": "- 90% of participants use AI weekly within 30 days of training\n- Reduce routine work by 20+ hours per person per month\n- Build competitive advantage before your rivals catch up\n- Boost employee retention through valuable skills development"
    },
    {
        "Type": "SERVICE",
        "NAME": "AI Innovation Programme",
        "PRICE": "From £25,000 (investment depends on innovation goals)",
        "Primary Deliverables": "Innovation process setup + prototype development + team capability building",
        "DESCRIPTION": "Launch breakthrough AI innovations every quarter, not every year. You'll turn AI experimentation into predictable innovation wins that drive measurable business results.",
        "WHAT IS THE NEXT PRODUCT OR SERVICE?": "AI Leadership Partner (Fractional CAIO)\nAI Consultancy Retainer",
        "PERFECT FOR:": "Companies with R&D budgets ready to accelerate product development using AI",
        "WHAT THE CLIENT IS ACTUALLY BUYING": "Predictable innovation pipeline + patent-worthy breakthroughs + 4x faster development cycles",
        "IDEAL CLIENT": "- Medium to large companies with dedicated R&D budgets\n- Innovation-focused organizations willing to experiment\n- Companies in tech, finance, or AI-ready industries facing disruption pressure",
        "KEY FEATURES": "- Customized innovation process designed for your industry\n- AI-powered ideation workshops that generate breakthrough concepts\n- Rapid prototyping using cutting-edge AI tools\n- Integration with existing R&D and product development",
        "BENEFITS": "- Ship AI-powered features 4x faster than traditional R&D\n- Generate patent-worthy innovations within 90 days\n- Build innovation capability that compounds quarterly\n- Avoid costly development dead-ends with rapid validation"
    },
    {
        "Type": "SERVICE",
        "NAME": "AI Leadership Partner (Fractional CAIO)",
        "PRICE": "From £8,000 per month (fraction of full-time hire cost)",
        "Primary Deliverables": "Strategic AI leadership on-demand + executive coaching + team development",
        "DESCRIPTION": "Get world-class AI strategy leadership without the £200K+ hire risk. You'll make confident AI decisions while avoiding the costly mistakes that derail most AI initiatives.",
        "WHAT IS THE NEXT PRODUCT OR SERVICE?": "AI Consultancy Retainer",
        "PERFECT FOR:": "Organizations viewing AI as strategic imperative but lacking senior AI expertise",
        "WHAT THE CLIENT IS ACTUALLY BUYING": "Confident AI decision-making + avoid £150K+ implementation mistakes + competitive moats while competitors fumble",
        "IDEAL CLIENT": "- Large enterprises or fast-growing scale-ups facing industry disruption\n- Leadership teams ready for long-term AI transformation\n- Organizations where AI strategy mistakes could cost millions",
        "KEY FEATURES": "- Executive-level AI guidance without full-time commitment\n- Ongoing strategy development and roadmap updates\n- Skills assessment and team development planning\n- Recruitment support for building internal AI capabilities",
        "BENEFITS": "- Make AI decisions with confidence, not expensive guesswork\n- Avoid costly AI implementation mistakes (average £150K+ waste)\n- Build sustainable competitive advantages while competitors struggle\n- Access senior AI expertise without £200K+ recruitment risk"
    },
    {
        "Type": "PRODUCT",
        "NAME": "AI-Powered Research and Insight Sprint",
        "PRICE": "£10,000 (compare to £30,000+ traditional research)",
        "Primary Deliverables": "Campaign-winning insights delivered in 5 days + strategic recommendations + competitive intelligence",
        "DESCRIPTION": "Get campaign-winning insights in 5 days, not 5 weeks. You'll uncover hidden opportunities competitors miss and start campaigns with bulletproof consumer backing.",
        "WHAT IS THE NEXT PRODUCT OR SERVICE?": "AI Innovation Programme",
        "PERFECT FOR:": "Marketing teams in fast-moving markets who need research-backed decisions quickly",
        "WHAT THE CLIENT IS ACTUALLY BUYING": "80% faster insights without sacrificing quality + competitive advantages competitors can't see + bulletproof campaign foundations",
        "IDEAL CLIENT": "- Any size organization operating in fast-moving markets\n- Data-driven teams that value rapid, accurate insights\n- Marketing and strategy teams under pressure to move fast\n- Companies launching campaigns or products in competitive markets",
        "KEY FEATURES": "- AI-driven analysis across multiple data sources and platforms\n- Expert interpretation that turns data into actionable strategy\n- Custom dashboards and reports for ongoing monitoring\n- Competitive intelligence that reveals market blind spots",
        "BENEFITS": "- Cut research timelines by 80% without sacrificing insight quality\n- Uncover hidden market opportunities your competitors miss\n- Start campaigns with research-validated consumer backing\n- Make confident strategic decisions backed by comprehensive data"
    },
    {
        "Type": "SERVICE",
        "NAME": "AI Consultancy Retainer",
        "PRICE": "From £12,000 per month (scales with scope and ambition)",
        "Primary Deliverables": "Senior AI strategist access + customized coaching + innovation support + ongoing capability building",
        "DESCRIPTION": "Move confidently from AI pilots to organization-wide impact without knowledge bottlenecks or wasted effort. You'll build sustainable AI capabilities while competitors struggle with basics.",
        "WHAT IS THE NEXT PRODUCT OR SERVICE?": "AI Innovation Programme",
        "PERFECT FOR:": "Global brands and ambitious businesses ready to invest in long-term AI transformation, not just tools",
        "WHAT THE CLIENT IS ACTUALLY BUYING": "Fast-tracked AI capability + measurable productivity gains + competitive resilience in fast-moving field",
        "IDEAL CLIENT": "- Ambitious, established businesses seeking sustainable AI capability\n- Global brands needing to accelerate adoption and maintain competitive edge\n- Leadership teams ready for transformation investment beyond just \"AI tools\"\n- Organizations where AI implementation success is business-critical",
        "KEY FEATURES": "- Fractional Chief AI Officer or senior advisor on retainer\n- Customized 1:1 coaching and group capability-building sessions\n- Innovation frameworks, pilot support, and prompt libraries\n- Proactive recommendations and strategic roadmap guidance",
        "BENEFITS": "- Fast-tracked, organization-wide AI literacy and measurable results\n- Proven productivity and innovation gains across departments\n- Resilient, up-to-date strategy in rapidly evolving AI landscape\n- Internal capability to experiment, scale, and adapt AI solutions independently"
    },
    {
        "Type": "PRODUCT",
        "NAME": "AI Innovation Day",
        "PRICE": "£8,800 (compare to months of internal development costs)",
        "Primary Deliverables": "Live prototype launch + team capability demonstration + implementation roadmap",
        "DESCRIPTION": "Go from idea to live prototype in one day. You'll prove your concept works before investing big and get leadership buy-in with something they can actually see and use.",
        "WHAT IS THE NEXT PRODUCT OR SERVICE?": "AI Innovation Programme",
        "PERFECT FOR:": "Innovation teams under pressure to prove AI value quickly\nMarketing and product teams exploring practical AI applications\nSenior leaders who need tangible proof, not presentations",
        "WHAT THE CLIENT IS ACTUALLY BUYING": "Functioning prototype in one day + proof of concept validation + leadership buy-in through demonstration + blueprint for future innovation",
        "IDEAL CLIENT": "- Medium to large organizations actively investing in innovation\n- Teams with mandate to explore AI capability under time pressure\n- Leaders who value tangible results over theoretical presentations\n- Organizations needing to move faster from insight to market-ready output",
        "KEY FEATURES": "- Full-day facilitated workshop with AI strategy experts\n- End-to-end prototyping using cutting-edge AI tools and platforms\n- Live collaboration across creative, technical, and strategy functions\n- Ready-to-share digital output plus coaching on scaling and deployment",
        "BENEFITS": "- Walk away with functioning prototype, not just PowerPoint promises\n- Save 3-6 months of development uncertainty and internal debates\n- Get immediate leadership buy-in with something they can touch and test\n- Create replicable blueprint for future rapid innovation cycles"
    },
    {
        "Type": "PRODUCT",
        "NAME": "Social Intelligence Dashboard",
        "PRICE": "Market analysis from £15,000\nMulti-market package (3+ markets): From £35,000\nFull implementation + training: From £50,000",
        "Primary Deliverables": "Market intelligence reports + competitive analysis dashboard + strategic recommendations + ongoing monitoring capability",
        "DESCRIPTION": "Know what your market really wants before your competitors do. You'll spot market shifts 6 months early and make product decisions with consumer-validated data instead of guesswork.",
        "WHAT IS THE NEXT PRODUCT OR SERVICE?": "",
        "PERFECT FOR:": "Automotive and motorcycle companies planning market entry or seeking competitive advantage\nStrategic planning teams requiring validated market intelligence\nProduct managers needing consumer-backed decision making",
        "WHAT THE CLIENT IS ACTUALLY BUYING": "Market prediction advantage + avoid costly miscalculations + consumer-validated product decisions + competitive intelligence edge",
        "IDEAL CLIENT": "- Mid to large companies in automotive/motorcycle industry (€50M+ revenue)\n- Organizations active in multiple markets or planning expansion\n- Strategic planning and product development functions\n- Decision makers who appreciate data-driven competitive advantages",
        "KEY FEATURES": "- AI-powered research using advanced tools (ChatGPT, Gemini, Claude)\n- Weighted Resonance Index scoring across 20 key product attributes\n- Interactive dashboard with real-time competitive analysis and monitoring\n- 50+ validated sources per market for comprehensive intelligence coverage",
        "BENEFITS": "- Spot market shifts and opportunities 6 months before competitors\n- Make product and strategy decisions with consumer-validated data\n- Avoid costly market miscalculations (average £500K+ impact per mistake)\n- Gain sustainable competitive intelligence advantage in your industry"
    }
]

def create_clean_csv():
    """Create a clean CSV file with proper structure"""
    
    # Define the column headers
    headers = [
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
    
    output_file = Path("../data/BN Products List - 2025.csv")
    
    print("🧹 Creating clean CSV file...")
    
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers, quoting=csv.QUOTE_ALL)
        
        # Write header
        writer.writeheader()
        
        # Write data
        for product in products_data:
            writer.writerow(product)
    
    print(f"✅ Clean CSV created: {output_file}")
    
    # Validate the new file
    with open(output_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        
    print(f"✅ Validation: {len(rows)} products with {len(reader.fieldnames)} columns")
    
    for i, row in enumerate(rows, 1):
        if not row.get('NAME'):
            print(f"❌ Row {i}: Missing NAME")
        else:
            print(f"✅ Product {i}: {row['NAME']}")

if __name__ == "__main__":
    create_clean_csv()