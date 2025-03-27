#!/bin/sh
cd /app/services/matcher
export PATH="/usr/local/lib/bun/bin:$PATH"
bun install --frozen-lockfile
bun run start