#!/usr/bin/env node

/**
 * Complete Redis Population Script
 *
 * This script populates Redis with all necessary data:
 * - Product configurations from config files
 * - Site copy and content
 * - Compilation data and counts
 * - Feedback data
 * - Queue and history data
 *
 * Usage: node scripts/populate-redis-complete.js
 */

import { productService } from '../src/services/storage/productService.js';
import { getStorageService } from '../src/services/storage/storageService.js';
import { getAllProducts, getAllServices } from '../src/config/index.js';

async function populateRedisComplete() {
  console.log('🚀 Starting complete Redis population...');

  const storage = getStorageService();

  try {
    // 1. Sync Product Configurations
    console.log('\n📦 Step 1: Syncing product configurations...');
    await productService.syncConfigToRedis();

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
    console.log('✅ Site copy initialized');

    // 3. Initialize Compilation Counts
    console.log('\n📊 Step 3: Initializing compilation counts...');
    const allProducts = getAllProducts();
    const allServices = getAllServices();
    const allItems = [...allProducts, ...allServices];

    for (const item of allItems) {
      // Initialize compilation counts to 0
      await storage.set(`bn:count:marketing:${item.id}`, 0);
      await storage.set(`bn:count:market-intel:${item.id}`, 0);
      await storage.set(`bn:count:product-strategy:${item.id}`, 0);

      console.log(`✅ Initialized counts for ${item.id}`);
    }

    // 4. Initialize Compilation Queue and History
    console.log('\n🔄 Step 4: Initializing compilation queue...');
    await storage.set('bn:compilation:queue', []);
    await storage.set('bn:compilation:history', []);

    // 5. Initialize Feedback Data
    console.log('\n💬 Step 5: Initializing feedback data...');
    await storage.set('bn:feedback:list', []);

    // Create feedback stats
    const feedbackStats = {
      total: 0,
      byPage: {},
      byProduct: {},
      byCategory: {},
      lastUpdated: new Date().toISOString(),
    };
    await storage.set('bn:feedback:stats', feedbackStats);

    // 6. Initialize Sample Feedback (optional)
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
        startedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        completedAt: new Date(Date.now() - 86390000).toISOString(),
        duration: 10000, // 10 seconds
      },
      {
        id: 'hist-2',
        productId: '02_ai_b_c',
        type: 'market-intel',
        status: 'completed',
        startedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        completedAt: new Date(Date.now() - 172790000).toISOString(),
        duration: 15000, // 15 seconds
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
      averageProcessingTime: 12500, // 12.5 seconds
      lastUpdated: new Date().toISOString(),
    };
    await storage.set('bn:compilation:stats', queueStats);

    // 9. Initialize Admin Settings
    console.log('\n⚙️ Step 9: Initializing admin settings...');
    const adminSettings = {
      editModeEnabled: false,
      lastCompiled: {},
      compilationStatus: {},
      marketingPrompt: 'Default marketing prompt',
      marketIntelligencePrompt: 'Default market intelligence prompt',
      productStrategyPrompt: 'Default product strategy prompt',
    };
    await storage.set('bn:settings:admin', adminSettings);

    // 10. Initialize Site Settings
    console.log('\n🌐 Step 10: Initializing site settings...');
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

    console.log('\n✅ Complete Redis population finished successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Products: ${allProducts.length}`);
    console.log(`   - Services: ${allServices.length}`);
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
  } catch (error) {
    console.error('❌ Error during Redis population:', error);
    process.exit(1);
  }
}

// Run the population
populateRedisComplete();
