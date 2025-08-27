#!/bin/bash
# BN Products Pipeline - Generate Products with Flexible Options
# Runs: CSV → Products → Config → Redis

set -e  # Exit on any error

# Default product list (1-8)
DEFAULT_PRODUCTS=(
    "01_ai_power_hour"
    "02_ai_b_c"
    "03_ai_innovation_programme"
    "04_ai_leadership_partner_fractional_caio" 
    "05_ai_powered_research_and_insight_sprint"
    "06_ai_consultancy_retainer"
    "07_ai_innovation_day"
    "08_social_intelligence_dashboard"
)

# Parse command line arguments
PRODUCTS=()
USE_ALL=false

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --all                    Process all products in CSV"
    echo "  --products \"01,02,03\"    Process specific products (comma-separated)"
    echo "  --help                   Show this help message"
    echo ""
    echo "Default: Process products 1-8"
    echo ""
    echo "Examples:"
    echo "  $0                       # Process products 1-8"
    echo "  $0 --all                 # Process all products in CSV"
    echo "  $0 --products \"03,04,05\" # Process specific products"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            USE_ALL=true
            shift
            ;;
        --products)
            IFS=',' read -ra PRODUCT_LIST <<< "$2"
            for product in "${PRODUCT_LIST[@]}"; do
                # Add prefix if not present
                if [[ ! $product == *_* ]]; then
                    product=$(printf "%02d" $product)
                    # Map numbers to actual product names
                    case $product in
                        "01") PRODUCTS+=("01_ai_power_hour") ;;
                        "02") PRODUCTS+=("02_ai_b_c") ;;
                        "03") PRODUCTS+=("03_ai_innovation_programme") ;;
                        "04") PRODUCTS+=("04_ai_leadership_partner_fractional_caio") ;;
                        "05") PRODUCTS+=("05_ai_powered_research_and_insight_sprint") ;;
                        "06") PRODUCTS+=("06_ai_consultancy_retainer") ;;
                        "07") PRODUCTS+=("07_ai_innovation_day") ;;
                        "08") PRODUCTS+=("08_social_intelligence_dashboard") ;;
                        *) echo "❌ Unknown product number: $product"; exit 1 ;;
                    esac
                else
                    PRODUCTS+=("$product")
                fi
            done
            shift
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Use default products if none specified
if [[ ${#PRODUCTS[@]} -eq 0 && "$USE_ALL" != true ]]; then
    PRODUCTS=("${DEFAULT_PRODUCTS[@]}")
fi

if [[ "$USE_ALL" == true ]]; then
    echo "🚀 Starting BN Products Pipeline (ALL PRODUCTS)"
else
    echo "🚀 Starting BN Products Pipeline (${#PRODUCTS[@]} products)"
fi
echo "================================================"

# Change to scripts directory
cd "$(dirname "$0")"

echo ""
if [[ "$USE_ALL" == true ]]; then
    echo "📝 STAGE 1: Generating AI content for ALL products in CSV..."
    echo "This may take several minutes. Please wait..."
    
    python3 01_csv_to_products.py --all > "/tmp/bn_all_products.log" 2>&1
    
    if [ $? -eq 0 ]; then
        echo "   ✅ ALL PRODUCTS - SUCCESS"
        echo "   🎉 STAGE 1 COMPLETE: All products generated successfully!"
    else
        echo "   ❌ ALL PRODUCTS - FAILED (see /tmp/bn_all_products.log)"
        echo ""
        echo "❌ STAGE 1 FAILED: Check the log file for details."
        exit 1
    fi
else
    echo "📝 STAGE 1: Generating AI content for ${#PRODUCTS[@]} products (PARALLEL)..."
    echo "This may take 2-3 minutes. Please wait..."

    # Track background process PIDs
    PIDS=()

    # Start all product generations in parallel
    for product in "${PRODUCTS[@]}"; do
        echo "   🔄 Starting: $product"
        python3 01_csv_to_products.py --product "$product" > "/tmp/bn_${product}.log" 2>&1 &
        PIDS+=($!)
    done

    echo "   ⏳ All processes started. Waiting for completion..."

    # Wait for all background processes and check their exit codes
    FAILED_PRODUCTS=()
    for i in "${!PIDS[@]}"; do
        if wait "${PIDS[$i]}"; then
            echo "   ✅ ${PRODUCTS[$i]} - SUCCESS"
        else
            echo "   ❌ ${PRODUCTS[$i]} - FAILED (see /tmp/bn_${PRODUCTS[$i]}.log)"
            FAILED_PRODUCTS+=("${PRODUCTS[$i]}")
        fi
    done

    # Check if any products failed
    if [ ${#FAILED_PRODUCTS[@]} -gt 0 ]; then
        echo ""
        echo "❌ STAGE 1 FAILED for ${#FAILED_PRODUCTS[@]} product(s):"
        for product in "${FAILED_PRODUCTS[@]}"; do
            echo "   - $product"
            echo "     Log: /tmp/bn_${product}.log"
        done
        echo ""
        echo "Fix the errors and run again, or continue with successful products only."
        exit 1
    fi

    echo "   🎉 STAGE 1 COMPLETE: All products generated successfully!"
fi

echo ""
echo "🔄 STAGE 2: Building configuration from generated products..."

# Extract all products to configuration
python3 02_products_to_config.py --all

if [ $? -eq 0 ]; then
    echo "   ✅ STAGE 2 COMPLETE: Configuration updated"
else
    echo "   ❌ STAGE 2 FAILED: Configuration update failed"
    exit 1
fi

echo ""
echo "💾 STAGE 3: Loading configuration to Redis..."

# Load configuration to Redis
python3 03_config_to_redis.py

if [ $? -eq 0 ]; then
    echo "   ✅ STAGE 3 COMPLETE: Data loaded to Redis"
else
    echo "   ❌ STAGE 3 FAILED: Redis loading failed"
    exit 1
fi

# Cleanup log files
echo ""
echo "🧹 Cleaning up temporary files..."
for product in "${PRODUCTS[@]}"; do
    rm -f "/tmp/bn_${product}.log"
done

echo ""
echo "🎉 PIPELINE COMPLETE!"
echo "================================================"
echo "✅ Generated content for ${#PRODUCTS[@]} products"
echo "✅ Updated master configuration" 
echo "✅ Loaded to Redis storage"
echo ""
echo "Next steps:"
echo "1. Start the dashboard: npm run dev"
echo "2. Navigate to each product and run compilations"
echo "3. Compiled content will show rich data (not 'Data not available')"
echo ""
echo "Products ready for compilation:"
for product in "${PRODUCTS[@]}"; do
    echo "   - $product"
done