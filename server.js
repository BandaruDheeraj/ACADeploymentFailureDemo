const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // ISSUE: App runs on 3000, but ACA expects 8080

// Middleware
app.use(cors());
app.use(express.json());

// ISSUE: Missing REQUIRED_CONFIG environment variable will cause app to crash
const REQUIRED_CONFIG = process.env.REQUIRED_CONFIG;
if (!REQUIRED_CONFIG) {
    console.error('FATAL ERROR: REQUIRED_CONFIG environment variable is not set!');
    console.error('This will cause the application to fail when deployed to Azure Container Apps.');
    process.exit(1);
}

// Health check endpoint - ISSUE: This will be called on port 8080 by ACA but app runs on 3000
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        config: REQUIRED_CONFIG,
        port: PORT,
        message: 'Health check endpoint - but ACA will call this on wrong port!'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Failing ACA Demo App',
        description: 'This app is designed to fail when deployed to Azure Container Apps',
        issues: [
            'Port Mismatch: App runs on 3000, ACA configured for 8080',
            'Health Check Port Issues: Health checks point to wrong port',
            'Missing Environment Variables: REQUIRED_CONFIG not set',
            'Security Issue: Container runs as root'
        ],
        config: REQUIRED_CONFIG,
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// API endpoint
app.get('/api/data', (req, res) => {
    res.json({
        data: 'Sample data from failing app',
        config: REQUIRED_CONFIG,
        port: PORT
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚨 FAILING APP STARTED 🚨`);
    console.log(`Server running on port ${PORT}`);
    console.log(`ISSUE: Azure Container Apps expects port 8080, but app runs on ${PORT}`);
    console.log(`ISSUE: REQUIRED_CONFIG=${REQUIRED_CONFIG}`);
    console.log(`ISSUE: Container will run as root (security problem)`);
    console.log(`App will fail when deployed to Azure Container Apps!`);
}); 