# Scripts Directory

This directory contains the canonical content pipeline for BN Product.

## Canonical Pipeline (Essential)

These are the authoritative scripts used end‑to‑end. Run them in sequence for the complete pipeline.

0. `00_clean_csv.py` — Stage 0: CSV cleaning and validation
   
   - Cleans and validates the input CSV file before processing.
   - Handles common CSV issues like line breaks, escaping, and field validation.
   - Usage:
     ```bash
     python3 00_clean_csv.py                    # Clean default CSV
     python3 00_clean_csv.py --check-only       # Just check for issues
     python3 00_clean_csv.py --auto             # Auto-clean without prompts
     ```

1. `01_csv_to_products.py` — Stage 1: CSV ➜ Product files (LLM)

   - Generates 15 stage markdown files per product from `../data/BN Products List   - 2025.csv` and `../prompts`.
   - Usage:
     ```bash
     cd scripts
     python3 01_csv_to_products.py --all
     # or
     python3 01_csv_to_products.py --product 01_ai_power_hour
     ```

2. `02_products_to_config.py` — Stage 2: Product files ➜ Master config JSON

   - Parses files in `../products` and produces `../config/product-config-master.json` for the app.
   - Usage:
     ```bash
     python3 02_products_to_config.py --all
     # or
     python3 02_products_to_config.py --product 01_ai_power_hour
     ```

3. `03_config_to_redis.py` — Stage 3: Config JSON ➜ Redis (optional deploy)
   - Loads the master config into Redis for runtime consumption.
   - Usage:
     ```bash
     python3 03_config_to_redis.py
     ```

### Quick Start (Canonical)

```bash
cd scripts
export OPENAI_API_KEY=...               # required for Stage 1
export DEFAULT_OPENAI_MODEL=gpt-5-mini  # optional, defaults to gpt-5-mini

# Full pipeline
python3 00_clean_csv.py --auto          # Clean and validate CSV
python3 01_csv_to_products.py --all     # Generate product files
python3 02_products_to_config.py --all  # Build master config
python3 03_config_to_redis.py           # Deploy to Redis (optional)
```

## Archive

Non-essential scripts have been moved to `archive/` to keep the main directory clean. These include:

- Legacy generators and alternative workflows
- Developer utilities and debugging tools  
- Node.js Redis loaders
- Data extraction and analysis tools

Access archived scripts if needed for debugging or alternative workflows.

## Dependencies

- Python 3.9+
- Packages: `python-dotenv` (for env), `openai` (for LLM), plus stdlib modules noted in scripts
- Optional: `beautifulsoup4` for HTML extraction utilities

## Environment Variables

- `OPENAI_API_KEY` — Required for any script that calls the OpenAI API (Stage 1)
- `DEFAULT_OPENAI_MODEL` — Optional (defaults to `gpt-5-mini`); used by Stage 1 and related tools

## Project Structure Reference

```
bn_product/
├── scripts/          # This directory
├── data/             # CSV product data
├── prompts/          # Prompt templates (15 stages)
├── products/         # Generated product files (per product x stage)
├── reports/          # Analysis reports
└── config/           # Generated configuration JSON
```

## Stages (15 prompts)

The canonical Stage 1 script generates content across these categories:

1. Foundation (01–03): Manifesto, Functional Spec, Audience ICPs
2. Planning (04–06): User Stories, Competitor Sweep, TAM Sizing
3. Research (07–08): PRD Skeleton, UI Prompt
4. Build (09–11): Generate Screens, Landing Page Copy, Key Messages
5. Demo (12–15): Investor Deck, Demo Script, Slide Headlines, QA Prep
