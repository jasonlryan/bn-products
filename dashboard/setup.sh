#!/bin/bash

# Create Vite project with React and TypeScript
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install \
  @emotion/react \
  @emotion/styled \
  @mui/material \
  @mui/icons-material \
  marked \
  react-router-dom

# Install dev dependencies
npm install -D \
  @types/marked \
  @types/react \
  @types/react-dom

# Create necessary directories
mkdir -p src/components src/types config

# Copy configuration files
cp config/product-dashboard.config.json public/
cp config/product-dashboard.schema.json public/

echo "Setup complete! Run 'npm run dev' to start the development server." 