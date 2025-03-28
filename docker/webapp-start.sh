#!/bin/sh
set -e

cd /app/webapp
export PATH="/usr/local/lib/bun/bin:$PATH"

echo "Installing dependencies..."
bun install --frozen-lockfile

# Default to development if NODE_ENV is not set
if [ -z "$NODE_ENV" ]; then
  export NODE_ENV="development"
fi

echo "Starting application in $NODE_ENV mode..."

if [ "$NODE_ENV" = "production" ]; then
  # Build the application for production
  echo "Building for production..."
  bun run build
  
  # Start the production server with PORT environment variable
  echo "Starting production server on port 5000..."
  PORT=5000 bun run start
else
  # Start the development server
  echo "Starting development server..."
  bun run dev --port 3005
fi