# Product Configuration Generator

This script generates and maintains a structured JSON configuration file from product markdown files. It supports both creating new product configurations and updating existing ones.

## Features

- Automatically detects and processes all product MD files
- Maintains existing configurations when updating
- Extracts metadata and content from MD files
- Validates against JSON schema
- Supports all 15 product development stages
- Prevents duplicate products
- Detailed logging

## Usage

### Basic Usage

```bash
# Generate config using default paths
python3 generate_product_config.py

# Specify custom paths
python3 generate_product_config.py \
  --products-dir ../products \
  --output ../config/product-config.json \
  --schema ../config/product-config.schema.json
```

### Arguments

- `--products-dir`: Directory containing product MD files (default: 'products')
- `--output`: Output configuration file path (default: 'product-config.json')
- `--schema`: JSON schema file path (default: 'product-config.schema.json')

## File Structure

The script expects the following file structure:

```
project/
├── products/
│   ├── 01_product_name_01_stage.md
│   ├── 01_product_name_02_stage.md
│   └── ...
├── config/
│   ├── product-config.json
│   └── product-config.schema.json
└── scripts/
    ├── generate_product_config.py
    └── README.md
```

## Stage Categories

The script categorizes files into 5 main stages:

1. **Foundation** (01-03)

   - 01: Product Manifesto
   - 02: Functional Spec
   - 03: Audience ICPs

2. **Planning** (04-06)

   - 04: User Stories
   - 05: Competitor Sweep
   - 06: TAM Sizing

3. **Research** (07-08)

   - 07: PRD Skeleton
   - 08: UI Prompt

4. **Build** (09-11)

   - 09: Generate Screens
   - 10: Landing Page Copy
   - 11: Key Messages

5. **Demo** (12-15)
   - 12: Investor Deck
   - 13: Demo Script
   - 14: Slide Headlines
   - 15: QA Prep

## Output Structure

The script generates a JSON file with the following structure:

```json
{
  "products": {
    "01_product_name": {
      "name": "Product Name",
      "type": "PRODUCT",
      "stages": {
        "foundation": {
          "manifesto": {
            "file_metadata": {...},
            "generation_metadata": {...},
            "content": {...}
          },
          ...
        },
        ...
      }
    }
  }
}
```

## Adding New Products

To add a new product:

1. Create the MD files in the products directory following the naming convention:

   ```
   XX_product_name_YY_stage_name.md
   ```

   where:

   - XX is the product number (01-99)
   - YY is the stage number (01-15)

2. Run the script:
   ```bash
   python3 generate_product_config.py
   ```

The script will automatically:

- Detect the new product files
- Create a new product configuration
- Preserve any existing product configurations
- Update the output file

## Updating Existing Products

To update an existing product:

1. Modify the relevant MD files
2. Run the script
3. The script will:
   - Detect changed files
   - Update only the modified sections
   - Preserve unchanged configurations

## Error Handling

The script includes comprehensive error handling:

- Validates input files against schema
- Logs warnings for unrecognized files
- Reports parsing errors
- Maintains existing config on error

## Logging

The script provides detailed logging:

- Info level: Normal operations
- Warning level: Non-critical issues
- Error level: Critical problems

Logs include timestamps and are written to stdout.
