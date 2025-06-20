# ISSUE: Using root user (security problem)
FROM node:18-alpine

# ISSUE: Running as root instead of non-root user
# This is a security vulnerability

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# ISSUE: Not setting the correct port for Azure Container Apps
# ACA expects port 8080, but we're not explicitly setting it
EXPOSE 3000

# ISSUE: Not setting REQUIRED_CONFIG environment variable
# This will cause the app to crash on startup

# Start the application
CMD ["npm", "start"] 