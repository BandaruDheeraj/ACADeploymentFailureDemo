# Failing Azure Container Apps Demo

This Node.js application is intentionally configured to fail when deployed to Azure Container Apps due to specific configuration issues.

## Configuration Problems

### 1. Port Mismatch
- **Issue**: App runs on port 3000, but Azure Container Apps is configured for port 8080
- **Location**: `server.js` line 5, `Dockerfile` line 20
- **Impact**: ACA cannot route traffic to the application

### 2. Health Check Port Issues
- **Issue**: Health checks point to wrong port
- **Location**: `server.js` line 25-35
- **Impact**: ACA health checks will fail, causing deployment issues

### 3. Missing Environment Variables
- **Issue**: REQUIRED_CONFIG environment variable is not set
- **Location**: `server.js` line 9-14, `Dockerfile` line 22
- **Impact**: Application crashes on startup with exit code 1

### 4. Security Issue
- **Issue**: Container runs as root user
- **Location**: `Dockerfile` line 2-4
- **Impact**: Security vulnerability in production

## Local Testing

### Prerequisites
- Node.js 18+
- Docker (optional)

### Running Locally

#### On Unix/Linux/macOS:
```bash
# Install dependencies
npm install

# Set the required environment variable
export REQUIRED_CONFIG="local-dev-config"

# Start the application
npm start
```

#### On Windows PowerShell:
```powershell
# Install dependencies
npm install

# Set the required environment variable
$env:REQUIRED_CONFIG="local-dev-config"

# Start the application
npm start
```

#### On Windows Command Prompt:
```cmd
# Install dependencies
npm install

# Set the required environment variable
set REQUIRED_CONFIG=local-dev-config

# Start the application
npm start
```

The app will start on port 3000 and be accessible at `http://localhost:3000`

### Testing with Docker
```bash
# Build the image
docker build -t failing-aca-app .

# Run the container (will fail due to missing REQUIRED_CONFIG)
docker run -p 3000:3000 failing-aca-app
```

### Quick Test Script
```bash
# Run the built-in test script (works on all platforms)
node test-local.js
```

## Expected Failures

When deployed to Azure Container Apps, this application will fail because:

1. **Startup Failure**: Missing `REQUIRED_CONFIG` environment variable causes immediate crash
2. **Port Mismatch**: ACA expects port 8080, app runs on 3000
3. **Health Check Failure**: Health checks on port 8080 will timeout/fail
4. **Security Scan Failure**: Running as root violates security policies

## API Endpoints

- `GET /` - Root endpoint showing app status and issues
- `GET /health` - Health check endpoint (will fail in ACA)
- `GET /api/data` - Sample API endpoint

## Fixing the Issues

To make this app work in Azure Container Apps:

1. **Fix Port**: Change `PORT` to 8080 in `server.js` and `EXPOSE 8080` in Dockerfile
2. **Add Environment Variable**: Set `REQUIRED_CONFIG` in ACA configuration
3. **Fix Security**: Add non-root user in Dockerfile
4. **Update Health Checks**: Configure ACA to use correct port for health checks 