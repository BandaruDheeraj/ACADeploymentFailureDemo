# Azure Container Apps Demo Scripts - Usage Guide

This guide explains how to use the deployment scripts and understand the expected failures and fixes.

## 📋 **Scripts Overview**

| Script | Purpose | Expected Outcome |
|--------|---------|------------------|
| `deploy-to-aca.sh` | Deploy failing app to ACA | App fails due to configuration issues |
| `fix-aca-issues.sh` | Fix all issues and redeploy | App works properly in ACA |

## 🚀 **Quick Start**

### **Step 1: Deploy the Failing App**
```bash
# Deploy app with intentional configuration issues
./deploy-to-aca.sh
```

### **Step 2: Fix All Issues**
```bash
# Fix all issues and deploy working version
./fix-aca-issues.sh
```

## 🚨 **Expected Errors & Failures**

### **Error 1: Image Registry Authentication**
```
UNAUTHORIZED: authentication required
```
**Cause:** ACA can't pull local Docker image  
**Fix:** Script automatically handles ACR setup and credentials  
**Files Modified:** `deploy-to-aca.sh` (ACR credentials), `fix-aca-issues.sh` (registry auth)

### **Error 2: Missing Environment Variable**
```
FATAL ERROR: REQUIRED_CONFIG environment variable is not set!
```
**Cause:** App requires `REQUIRED_CONFIG` but it's not set in ACA  
**Fix:** `fix-aca-issues.sh` sets `REQUIRED_CONFIG=production-config`  
**Files Modified:** `server-fixed.js` (created by script), Azure Container App config

### **Error 3: Port Mismatch**
```
Health check failed: connection refused on port 8080
```
**Cause:** App runs on port 3000, ACA expects 8080  
**Fix:** `fix-aca-issues.sh` changes app to use port 8080  
**Files Modified:** `server-fixed.js` (line 5: `const PORT = process.env.PORT || 8080`), `Dockerfile-fixed` (line 20: `EXPOSE 8080`)

### **Error 4: Health Check Failures**
```
Health check failed: timeout
```
**Cause:** Health checks point to wrong port  
**Fix:** `fix-aca-issues.sh` updates health check configuration  
**Files Modified:** `server-fixed.js` (health endpoint now on port 8080), Azure Container App config

### **Error 5: Security Issues**
```
Container runs as root user
```
**Cause:** Dockerfile doesn't specify non-root user  
**Fix:** `fix-aca-issues.sh` adds non-root user to container  
**Files Modified:** `Dockerfile-fixed` (lines 4-5: `RUN addgroup -g 1001 -S nodejs`, `RUN adduser -S nodejs -u 1001`, line 25: `USER nodejs`)

## 🔧 **How the Fixes Work**

### **deploy-to-aca.sh (Failing Version)**
```bash
# Creates app with these issues:
- Port: 3000 (should be 8080) [server.js line 5, Dockerfile line 20]
- Missing: REQUIRED_CONFIG environment variable [server.js lines 9-14]
- Security: Runs as root user [Dockerfile lines 2-4]
- Health checks: Wrong port [azure-container-apps.yaml lines 15-25]
```

### **fix-aca-issues.sh (Working Version)**
```bash
# Fixes all issues:
1. Creates server-fixed.js (port 8080) [new file]
2. Creates Dockerfile-fixed (non-root user) [new file]
3. Builds new Docker image
4. Sets REQUIRED_CONFIG=production-config [Azure Container App config]
5. Updates ACA with fixed image
6. Cleans up temporary files
```

## 📊 **Error Timeline**

| Step | Error | Status | Files Modified |
|------|-------|--------|----------------|
| 1. Deploy | Image auth failure | ✅ Fixed by script | `deploy-to-aca.sh` |
| 2. Deploy | REQUIRED_CONFIG missing | ✅ Fixed by script | `server-fixed.js`, ACA config |
| 3. Deploy | Port mismatch | ✅ Fixed by script | `server-fixed.js`, `Dockerfile-fixed` |
| 4. Deploy | Health check failure | ✅ Fixed by script | `server-fixed.js`, ACA config |
| 5. Deploy | Security scan failure | ✅ Fixed by script | `Dockerfile-fixed` |

## 🎯 **Testing the Results**

### **Test Failing App (Local)**
```bash
# Set environment variable to test locally
$env:REQUIRED_CONFIG="test-value"  # PowerShell
npm start
# App works on localhost:3000
```

### **Test Failing App (Without Env Var)**
```bash
# Clear environment variable
$env:REQUIRED_CONFIG=""
npm start
# App crashes immediately
```

### **Test Working App (ACA)**
```bash
# After running fix-aca-issues.sh
# Get the app URL
az containerapp show --name failing-aca-demo --resource-group failing-aca-demo-rg --query properties.configuration.ingress.fqdn
# Visit URL to see working app
```

## 🔍 **What Each Script Does**

### **deploy-to-aca.sh**
1. Creates resource group and ACA environment
2. Builds Docker image locally
3. Pushes to Azure Container Registry
4. Deploys app with ACR credentials
5. **Result:** App fails due to configuration issues

### **fix-aca-issues.sh**
1. Creates fixed versions of server.js and Dockerfile
2. Sets REQUIRED_CONFIG environment variable
3. Builds new fixed Docker image
4. Pushes fixed image to ACR
5. Updates ACA with fixed image
6. Cleans up temporary files
7. **Result:** App works properly

## 📁 **File Management**

### **Original Files (Preserved)**
- `server.js` - Original failing version
- `Dockerfile` - Original failing version
- `package.json` - Unchanged
- All other files - Unchanged

### **Temporary Files (Auto-deleted)**
- `server-fixed.js` - Created and deleted by fix script
- `Dockerfile-fixed` - Created and deleted by fix script

## 🎯 **Use Cases**

### **SRE Training**
- Demonstrate common deployment failures
- Show how to diagnose and fix issues
- Practice troubleshooting ACA problems

### **DevOps Validation**
- Test monitoring and alerting systems
- Validate deployment pipelines
- Practice incident response

### **Configuration Management**
- Show importance of environment variables
- Demonstrate port configuration
- Highlight security best practices

## 🚀 **Quick Commands**

```bash
# Deploy failing version
./deploy-to-aca.sh

# Fix all issues and deploy working version
./fix-aca-issues.sh

# Test locally (PowerShell)
$env:REQUIRED_CONFIG="test-value"
npm start

# Test locally (Bash)
export REQUIRED_CONFIG="test-value"
npm start

# Get app URL
az containerapp show --name failing-aca-demo --resource-group failing-aca-demo-rg --query properties.configuration.ingress.fqdn
```

## 📝 **Troubleshooting**

### **If deploy-to-aca.sh fails:**
- Check Azure CLI login: `az login`
- Verify ACR exists: `az acr list`
- Check Docker is running

### **If fix-aca-issues.sh fails:**
- Ensure deploy-to-aca.sh ran successfully first
- Check ACR credentials are enabled
- Verify container app exists

### **If app still doesn't work:**
- Check ACA logs: `az containerapp logs show --name failing-aca-demo --resource-group failing-aca-demo-rg`
- Verify environment variables are set
- Check health check configuration 