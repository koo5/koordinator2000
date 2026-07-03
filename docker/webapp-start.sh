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
  # Build (adapter-node) and start the production server on 5533.
  echo "Building for production..."
  bun run build
  echo "Starting production server on port 5533..."
  bun run start
else
  # Development server (same port as host-side dev for consistency)
  echo "Starting development server..."
  bun run dev
fi
