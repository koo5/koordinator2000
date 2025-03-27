#!/bin/sh
cd /app/db
~/.bun/bin/bun install --frozen-lockfile
~/.bun/bin/bun deploy.js