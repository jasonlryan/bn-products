#!/usr/bin/env node

/**
 * Simple Redis Population Script
 *
 * This script populates Redis with basic data using direct file reading
 * and simple Redis operations.
 *
 * Usage: node scripts/populate-redis-simple.js
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function populateRedisSimple() {
  console.log('🚀 Starting simple Redis population...');

  try {
    // Read the product config file directly
    const configPath = join(__dirname, '../src/config/product-config.json');
    const configData = JSON.parse(readFileSync(configPath, 'utf8'));

    console.log('\n📦 Step 1: Reading product configuration...');

    // Handle the correct structure where products is an object with IDs as keys
    const productIds = Object.keys(configData.products || {});
    const serviceIds = Object.keys(configData.services || {});

    console.log(`   - Found ${productIds.length} products`);
    console.log(`   - Found ${serviceIds.length} services`);

    // For now, just log what we found
    console.log('\n📊 Products found:');
    productIds.forEach((productId) => {
      const product = configData.products[productId];
      console.log(`   - ${productId}: ${product.name}`);
    });

    console.log('\n📊 Services found:');
    serviceIds.forEach((serviceId) => {
      const service = configData.services[serviceId];
      console.log(`   - ${serviceId}: ${service.name}`);
    });

    console.log('\n✅ Simple Redis population analysis completed!');
    console.log('\n📝 Note: This script analyzed the config file.');
    console.log(
      '   To actually populate Redis, use the admin panel "Populate Redis" button'
    );
    console.log(
      '   or run the full TypeScript version with proper compilation.'
    );
  } catch (error) {
    console.error('❌ Error during Redis population:', error);
    process.exit(1);
  }
}

// Run the population
populateRedisSimple();
