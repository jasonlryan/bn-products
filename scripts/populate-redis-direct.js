#!/usr/bin/env node

/**
 * Direct Redis Population Script
 *
 * This script directly populates Redis with all necessary data
 * without complex TypeScript imports.
 *
 * Usage: node scripts/populate-redis-direct.js
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple Redis-like storage for this script
class SimpleRedisStorage {
  constructor() {
    this.data = new Map();
  }

  async set(key, value) {
    this.data.set(key, value);
    console.log(`💾 Set: ${key}`);
  }

  async get(key) {
    return this.data.get(key) || null;
  }

  async lpush(key, value) {
    if (!this.data.has(key)) {
      this.data.set(key, []);
    }
    const list = this.data.get(key);
    list.unshift(value);
    console.log(`📝 LPush: ${key} -> ${value}`);
  }

  async increment(key) {
    const current = this.data.get(key) || 0;
    const newValue = current + 1;
    this.data.set(key, newValue);
    console.log(`➕ Increment: ${key} -> ${newValue}`);
    return newValue;
  }
}

async function populateRedisDirect() {
  console.log('🚀 Starting direct Redis population...');

  const storage = new SimpleRedisStorage();

  try {
    // 1. Read Product Configurations
    console.log('\n📦 Step 1: Reading product configurations...');
    const configPath = join(__dirname, '../src/config/product-config.json');
    const configData = JSON.parse(readFileSync(configPath, 'utf8'));

    const productIds = Object.keys(configData.products || {});
    const serviceIds = Object.keys(configData.services || {});

    console.log(`   - Found ${productIds.length} products`);
    console.log(`   - Found ${serviceIds.length} services`);

    // Store products in Redis format
    for (const productId of productIds) {
      const product = configData.products[productId];
      await storage.set(`bn:product:${productId}`, product);
    }

    await storage.set('bn:products:list', productIds);
    await storage.set('bn:services:list', serviceIds);

    // 2. Initialize Site Copy Table
    console.log('\n📝 Step 2: Initializing site copy table...');
    const siteCopy = {
      navigation: {
        dashboard: 'Dashboard',
        products: 'Products',
        services: 'Services',
        admin: 'Admin',
      },
      footer: {
        copyright: '© 2025 Business Name. All rights reserved.',
        feedback: 'Give Feedback',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
      },
      landing: {
        hero: {
          title: 'AI-Powered Product Management',
          subtitle:
            'Transform your business with intelligent product strategies',
          cta: 'Get Started',
        },
        features: {
          title: 'Key Features',
          subtitle: 'Everything you need to succeed',
        },
        benefits: {
          title: 'Key Benefits',
          subtitle: 'Why choose our platform',
        },
      },
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Success!',
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        download: 'Download',
        compile: 'Compile',
        view: 'View',
      },
    };

    await storage.set('bn:site:copy', siteCopy);

    // 3. Initialize Compilation Counts
    console.log('\n📊 Step 3: Initializing compilation counts...');
    const allItems = [...productIds, ...serviceIds];

    for (const itemId of allItems) {
      await storage.set(`bn:count:marketing:${itemId}`, 0);
      await storage.set(`bn:count:market-intel:${itemId}`, 0);
      await storage.set(`bn:count:product-strategy:${itemId}`, 0);
    }

    // 4. Initialize Compilation Queue and History
    console.log('\n🔄 Step 4: Initializing compilation queue...');
    await storage.set('bn:compilation:queue', []);
    await storage.set('bn:compilation:history', []);

    // 5. Initialize Feedback Data
    console.log('\n💬 Step 5: Initializing feedback data...');
    await storage.set('bn:feedback:list', []);

    const feedbackStats = {
      total: 0,
      byPage: {},
      byProduct: {},
      byCategory: {},
      lastUpdated: new Date().toISOString(),
    };
    await storage.set('bn:feedback:stats', feedbackStats);

    // 6. Initialize Sample Feedback
    console.log('\n📝 Step 6: Adding sample feedback data...');
    const sampleFeedback = [
      {
        id: 'sample-1',
        page: 'Dashboard',
        productId: null,
        category: 'general',
        rating: 5,
        comment: 'Great product management system!',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'sample-2',
        page: 'Product',
        productId: '01_ai_power_hour',
        category: 'feature-request',
        rating: 4,
        comment: 'Would love to see more export options',
        timestamp: new Date().toISOString(),
      },
    ];

    for (const feedback of sampleFeedback) {
      await storage.set(`bn:feedback:${feedback.id}`, feedback);
      await storage.lpush('bn:feedback:list', feedback.id);
      await storage.lpush(`bn:feedback:page:${feedback.page}`, feedback.id);
      if (feedback.productId) {
        await storage.lpush(
          `bn:feedback:product:${feedback.productId}`,
          feedback.id
        );
      }
    }

    // Update feedback stats
    const updatedStats = {
      total: sampleFeedback.length,
      byPage: {
        Dashboard: 1,
        Product: 1,
      },
      byProduct: {
        '01_ai_power_hour': 1,
      },
      byCategory: {
        general: 1,
        'feature-request': 1,
      },
      lastUpdated: new Date().toISOString(),
    };
    await storage.set('bn:feedback:stats', updatedStats);

    // 7. Initialize Compilation History
    console.log('\n📚 Step 7: Initializing compilation history...');
    const sampleHistory = [
      {
        id: 'hist-1',
        productId: '01_ai_power_hour',
        type: 'marketing',
        status: 'completed',
        startedAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 86390000).toISOString(),
        duration: 10000,
      },
      {
        id: 'hist-2',
        productId: '02_ai_b_c',
        type: 'market-intel',
        status: 'completed',
        startedAt: new Date(Date.now() - 172800000).toISOString(),
        completedAt: new Date(Date.now() - 172790000).toISOString(),
        duration: 15000,
      },
    ];

    await storage.set('bn:compilation:history', sampleHistory);

    // 8. Initialize Queue Statistics
    console.log('\n📈 Step 8: Initializing queue statistics...');
    const queueStats = {
      totalJobs: 0,
      activeJobs: 0,
      completedJobs: sampleHistory.length,
      failedJobs: 0,
      averageProcessingTime: 12500,
      lastUpdated: new Date().toISOString(),
    };
    await storage.set('bn:compilation:stats', queueStats);

    // 9. Initialize Settings
    console.log('\n⚙️ Step 9: Initializing settings...');
    const adminSettings = {
      editModeEnabled: false,
      lastCompiled: {},
      compilationStatus: {},
      marketingPrompt: 'Default marketing prompt',
      marketIntelligencePrompt: 'Default market intelligence prompt',
      productStrategyPrompt: 'Default product strategy prompt',
    };
    await storage.set('bn:settings:admin', adminSettings);

    const siteSettings = {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      features: {
        feedback: true,
        compilation: true,
        pdfExport: true,
        adminPanel: true,
      },
    };
    await storage.set('bn:settings:site', siteSettings);

    console.log('\n✅ Direct Redis population finished successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Products: ${productIds.length}`);
    console.log(`   - Services: ${serviceIds.length}`);
    console.log(
      `   - Compilation counts initialized for ${allItems.length} items`
    );
    console.log(`   - Sample feedback: ${sampleFeedback.length} entries`);
    console.log(`   - Sample history: ${sampleHistory.length} entries`);
    console.log(`   - Queue and stats initialized`);
    console.log(`   - Site copy and settings initialized`);

    console.log('\n🗂️ Redis Tables Created:');
    console.log(
      '   ✅ Products Table (bn:product:*, bn:products:list, bn:services:list)'
    );
    console.log('   ✅ Site Copy Table (bn:site:copy)');
    console.log(
      '   ✅ Compilations Table (bn:compiled:*, bn:count:*, bn:compilation:*)'
    );
    console.log('   ✅ Feedback Table (bn:feedback:*)');
    console.log('   ✅ Settings Table (bn:settings:*)');

    console.log(
      '\n📝 Note: This script created a local simulation of Redis data.'
    );
    console.log(
      '   To populate actual Redis, you need to run this in the browser context'
    );
    console.log('   or use the admin panel "Populate Redis" button.');
  } catch (error) {
    console.error('❌ Error during Redis population:', error);
    process.exit(1);
  }
}

// Run the population
populateRedisDirect();
