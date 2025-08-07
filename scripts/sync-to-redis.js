#!/usr/bin/env node

/**
 * Sync Product Configuration to Redis
 *
 * This script syncs all product configuration data from the static JSON file
 * to Redis, making Redis the source of truth for all product data.
 *
 * Usage: node scripts/sync-to-redis.js
 */

const { productService } = require('../src/services/storage/productService');

async function syncToRedis() {
  console.log('🔄 Starting product configuration sync to Redis...');

  try {
    await productService.syncConfigToRedis();
    console.log('✅ Successfully synced all product data to Redis!');
    console.log('📊 Redis is now the source of truth for all product data.');
  } catch (error) {
    console.error('❌ Error syncing to Redis:', error);
    process.exit(1);
  }
}

// Run the sync
syncToRedis();
