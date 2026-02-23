#!/bin/bash

# CI Setup Script for GitHub Actions

echo "Setting up CI environment..."

# Set Node.js specific environment variables
export NODE_OPTIONS="--experimental-global-webcrypto --max_old_space_size=4096"

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run linting
echo "Running ESLint..."
npm run lint

# Run tests with coverage
echo "Running tests with coverage..."
npm run test:coverage

echo "CI setup complete!"