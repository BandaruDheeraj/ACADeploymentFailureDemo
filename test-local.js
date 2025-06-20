const http = require('http');

// Test the app locally with the correct environment variable
const testLocalApp = () => {
    console.log('🧪 Testing the failing ACA app locally...\n');
    
    // Simulate setting the required environment variable
    process.env.REQUIRED_CONFIG = 'test-config-value';
    
    // Start the server
    const server = require('./server.js');
    
    // Wait a moment for server to start
    setTimeout(() => {
        console.log('\n📡 Testing endpoints...\n');
        
        // Test root endpoint
        http.get('http://localhost:3000', (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log('✅ Root endpoint (/):');
                console.log(JSON.parse(data));
                console.log('\n' + '='.repeat(50) + '\n');
            });
        });
        
        // Test health endpoint
        http.get('http://localhost:3000/health', (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log('✅ Health endpoint (/health):');
                console.log(JSON.parse(data));
                console.log('\n' + '='.repeat(50) + '\n');
            });
        });
        
        // Test API endpoint
        http.get('http://localhost:3000/api/data', (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log('✅ API endpoint (/api/data):');
                console.log(JSON.parse(data));
                console.log('\n' + '='.repeat(50) + '\n');
                console.log('🎯 App works locally but will fail in Azure Container Apps!');
                console.log('🚨 Issues that will cause failure:');
                console.log('   1. Port mismatch (3000 vs 8080)');
                console.log('   2. Missing REQUIRED_CONFIG in ACA');
                console.log('   3. Health checks on wrong port');
                console.log('   4. Running as root user');
                
                // Clean shutdown
                process.exit(0);
            });
        });
        
    }, 1000);
};

// Run the test
testLocalApp(); 