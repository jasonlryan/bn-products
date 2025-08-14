#!/usr/bin/env node

// Direct Redis connection test
import https from 'https';
import url from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

console.log('🔍 Testing Redis Connection...');
console.log('API URL:', KV_REST_API_URL);
console.log('Token present:', !!KV_REST_API_TOKEN);

if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
  console.error('❌ Missing Redis environment variables');
  process.exit(1);
}

async function testRedisConnection() {
  try {
    console.log('REDIS DATABASE ANALYSIS');
    console.log('======================');
    
    // Get Redis info
    console.log('\n1. REDIS SERVER INFO:');
    try {
      const info = await callRedisAPI('INFO');
      if (info) {
        console.log('Redis connection: ACTIVE');
        console.log('Redis response received');
      }
    } catch (error) {
      console.log('Redis info error:', error.message);
    }
    
    // Check all keys
    console.log('\n2. ALL KEYS IN DATABASE:');
    const allKeys = await callRedisAPI('KEYS', '*');
    console.log(`Total keys found: ${allKeys?.length || 0}`);
    
    if (allKeys && allKeys.length > 0) {
      console.log('\nAll keys:');
      allKeys.forEach((key, i) => console.log(`${i + 1}. ${key}`));
      
      console.log('\n3. KEY ANALYSIS:');
      for (const key of allKeys.slice(0, 5)) {
        console.log(`\nKey: ${key}`);
        try {
          const value = await callRedisAPI('GET', key);
          const size = JSON.stringify(value).length;
          console.log(`Size: ${size} bytes`);
          console.log(`Content: ${JSON.stringify(value).substring(0, 100)}...`);
        } catch (error) {
          console.log(`Error reading: ${error.message}`);
        }
      }
    } else {
      console.log('DATABASE IS EMPTY - NO KEYS FOUND');
      
      console.log('\n3. WHY IS REDIS EMPTY?');
      console.log('Checking possible causes:');
      
      // Test a write to see if writes work
      console.log('\n4. TESTING WRITE CAPABILITY:');
      try {
        await setRedisKey('test-write', { test: 'data', timestamp: Date.now() });
        console.log('✅ Write test successful');
        
        // Verify the write
        const readBack = await callRedisAPI('GET', 'test-write');
        if (readBack) {
          console.log('✅ Read back successful:', JSON.stringify(readBack));
          
          // Clean up test key
          await callRedisAPI('DELETE', 'test-write');
          console.log('✅ Cleanup successful');
          
          console.log('\n5. PERSISTENCE ISSUE DIAGNOSIS:');
          console.log('Redis is working BUT data is not being saved from the app');
          console.log('This means:');
          console.log('- App compilation is not reaching Redis');
          console.log('- Storage service may be failing silently');
          console.log('- API endpoint may not be working in development');
        } else {
          console.log('❌ Read back failed - Redis persistence broken');
        }
      } catch (error) {
        console.log('❌ Write test failed:', error.message);
        console.log('Redis may not be writable');
      }
    }
    
  } catch (error) {
    console.error('❌ Redis analysis failed:', error.message);
  }
}

async function setRedisKey(key, value) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(value);
    const parsedUrl = url.parse(KV_REST_API_URL);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: `/set/${encodeURIComponent(key)}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function callRedisAPI(command, ...args) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(KV_REST_API_URL);
    
    // Use standard REST API format for Upstash Redis
    let path;
    if (command === 'KEYS') {
      path = `/keys/${encodeURIComponent(args[0])}`;
    } else if (command === 'GET') {
      path = `/get/${encodeURIComponent(args[0])}`;
    } else {
      path = `/${command.toLowerCase()}`;
      if (args.length > 0) {
        path += `/${args.map(arg => encodeURIComponent(arg)).join('/')}`;
      }
    }
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result.result);
          }
        } catch (e) {
          // If not JSON, return raw data
          resolve(data);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

testRedisConnection().then(() => {
  console.log('\n✅ Redis test completed');
}).catch((error) => {
  console.error('\n❌ Redis test failed:', error);
  process.exit(1);
});