# Azure Container Apps Failure Analysis

This document details the specific configuration issues that will cause this Node.js application to fail when deployed to Azure Container Apps.

## 🚨 Critical Issues

### 1. Port Mismatch
**Location**: `server.js:5`, `Dockerfile:20`
```javascript
const PORT = process.env.PORT || 3000; // App runs on 3000
```
```dockerfile
EXPOSE 3000  # But ACA expects 8080
```

**Impact**: 
- Azure Container Apps is configured to route traffic to port 8080
- Application listens on port 3000
- **Result**: No traffic reaches the application

**ACA Configuration**:
```yaml
ingress:
  targetPort: 8080  # ACA expects this port
```

### 2. Missing Environment Variable
**Location**: `server.js:9-14`
```javascript
const REQUIRED_CONFIG = process.env.REQUIRED_CONFIG;
if (!REQUIRED_CONFIG) {
    console.error('FATAL ERROR: REQUIRED_CONFIG environment variable is not set!');
    process.exit(1);  // App crashes immediately
}
```

**Impact**:
- Application requires `REQUIRED_CONFIG` environment variable
- Variable is not set in ACA configuration
- **Result**: Application crashes on startup with exit code 1

**Missing ACA Configuration**:
```yaml
env:
  - name: REQUIRED_CONFIG  # This is missing!
    value: "production-config"
```

### 3. Health Check Port Issues
**Location**: `azure-container-apps.yaml:15-25`
```yaml
probes:
  - type: readiness
    httpGet:
      path: /health
      port: 8080  # Health check on wrong port
```

**Impact**:
- Health checks configured for port 8080
- Application health endpoint runs on port 3000
- **Result**: Health checks fail, causing deployment issues

### 4. Security Issue - Root User
**Location**: `Dockerfile:2-4`
```dockerfile
FROM node:18-alpine
# ISSUE: No user specified, runs as root
```

**Impact**:
- Container runs as root user (UID 0)
- Violates security best practices
- **Result**: Security scans may fail, potential security vulnerability

## 🔍 Failure Scenarios

### Scenario 1: Startup Failure
```
1. Container starts
2. Application checks for REQUIRED_CONFIG
3. Variable not found
4. Application exits with code 1
5. ACA marks deployment as failed
```

### Scenario 2: Health Check Failure
```
1. Container starts (if REQUIRED_CONFIG is set)
2. ACA health checks hit port 8080
3. No response (app on 3000)
4. Health checks fail
5. ACA considers app unhealthy
```

### Scenario 3: Traffic Routing Failure
```
1. Container starts successfully
2. External traffic routed to port 8080
3. No application listening on 8080
4. 502 Bad Gateway errors
```

## 🧪 Testing the Failures

### Local Testing (Works)
```bash
export REQUIRED_CONFIG="test-value"
npm start
# App works on localhost:3000
```

### Docker Testing (Fails without env var)
```bash
docker build -t failing-app .
docker run -p 3000:3000 failing-app
# Fails: FATAL ERROR: REQUIRED_CONFIG environment variable is not set!
```

### ACA Deployment (Will Fail)
```bash
az containerapp create \
  --name failing-app \
  --resource-group demo-rg \
  --environment demo-env \
  --image failing-app:latest \
  --target-port 8080  # Mismatch with app port 3000
```

## 🔧 Fixes Required

### 1. Fix Port Configuration
```javascript
// server.js
const PORT = process.env.PORT || 8080; // Change to 8080
```

```dockerfile
# Dockerfile
EXPOSE 8080  # Change to 8080
```

### 2. Add Environment Variable
```yaml
# azure-container-apps.yaml
env:
  - name: REQUIRED_CONFIG
    value: "production-config"
```

### 3. Fix Health Checks
```yaml
# azure-container-apps.yaml
probes:
  - type: readiness
    httpGet:
      path: /health
      port: 8080  # Match app port
```

### 4. Fix Security
```dockerfile
# Dockerfile
FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
```

## 📊 Expected Error Messages

### ACA Logs (Startup Failure)
```
FATAL ERROR: REQUIRED_CONFIG environment variable is not set!
This will cause the application to fail when deployed to Azure Container Apps.
```

### ACA Health Check Logs
```
Health check failed: connection refused on port 8080
```

### ACA Traffic Logs
```
502 Bad Gateway - No application listening on port 8080
```

## 🎯 Use Case

This application is designed for:
- **Testing ACA deployment failure scenarios**
- **Demonstrating configuration validation**
- **Training SRE teams on common deployment issues**
- **Validating monitoring and alerting systems**

The app intentionally fails to help teams understand and prepare for real-world deployment challenges. 