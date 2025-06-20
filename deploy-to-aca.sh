#!/bin/bash

# Azure Container Apps Deployment Script for Failing Demo App (ACR version)
# This script demonstrates how to deploy the intentionally failing app using Azure Container Registry

set -e

echo "🚨 Deploying Failing ACA Demo App 🚨"
echo "This app is designed to fail due to configuration issues!"
echo ""

# Configuration
RESOURCE_GROUP="failing-aca-demo-rg"
LOCATION="eastus"
ENVIRONMENT_NAME="failing-aca-env"
APP_NAME="failing-aca-demo"
ACR_NAME="failingacademo"
ACR_LOGIN_SERVER="failingacademo.azurecr.io"
IMAGE_NAME="$ACR_LOGIN_SERVER/failing-aca-app:latest"

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value --output tsv)

echo "📋 Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  Environment: $ENVIRONMENT_NAME"
echo "  App Name: $APP_NAME"
echo "  ACR: $ACR_NAME"
echo "  Image: $IMAGE_NAME"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first."
    exit 1
fi

# Check if logged in
if ! az account show &> /dev/null; then
    echo "❌ Not logged into Azure. Please run 'az login' first."
    exit 1
fi

echo "🔧 Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

echo "🏗️ Creating Container Apps environment..."
az containerapp env create \
    --name $ENVIRONMENT_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION

echo "🐳 Building Docker image..."
docker build -t failing-aca-app .

echo "🔖 Tagging image for ACR..."
docker tag failing-aca-app:latest $IMAGE_NAME

echo "🔐 Logging in to ACR..."
az acr login --name $ACR_NAME

echo "📦 Pushing image to ACR..."
docker push $IMAGE_NAME

echo "🧹 Deleting existing container app if it exists (and is in failed state)..."
az containerapp delete \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --yes || true

echo "🚀 Creating new Azure Container App with ACR image and credentials..."
az containerapp create \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --environment $ENVIRONMENT_NAME \
    --image $IMAGE_NAME \
    --target-port 8080 \
    --ingress external \
    --registry-server $ACR_LOGIN_SERVER \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --query properties.configuration.ingress.fqdn

echo ""
echo "🎯 Expected Failures:"
echo "   - App will crash on startup due to missing REQUIRED_CONFIG"
echo "   - Health checks will fail due to port mismatch"
echo "   - Security scans may flag root user issue"
echo ""
echo "🔧 To fix these issues:"
echo "   1. Set REQUIRED_CONFIG environment variable"
echo "   2. Change app port to 8080"
echo "   3. Add non-root user to Dockerfile"
echo "   4. Update health check configuration"
echo ""
echo "ℹ️  If you get an authentication error, set registry credentials with:"
echo "az containerapp registry set --name $APP_NAME --resource-group $RESOURCE_GROUP --server $ACR_LOGIN_SERVER --username <USERNAME> --password <PASSWORD>" 