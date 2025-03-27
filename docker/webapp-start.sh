#!/bin/sh
cd /app/webapp
export PATH="/usr/local/lib/bun/bin:$PATH"
bun install --frozen-lockfile
bun run dev