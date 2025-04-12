# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands
- **Webapp**: `cd webapp && npm run dev` (port 5533)
- **Webapp TypeCheck**: `cd webapp && npm run typecheck`
- **Matcher Service**: `cd services/matcher && npm run dev`
- **Database Migrations**: `cd db && npm run migrate`
- **Docker Compose**: `docker-compose up` (starts all services)

## Code Style Guidelines
- **Framework**: SvelteKit with TypeScript
- **TypeScript**: Use explicit types; `strictNullChecks` is enabled
- **Imports**: Include file extensions (e.g., `import x from './y.ts'`)
- **Components**: PascalCase for Svelte component files
- **Variables**: snake_case for variables and functions
- **Error Handling**: Try/catch with console.error for logging
- **Environment Vars**: Use `$env/static/public` and `$env/static/private`
- **Browser Checks**: Use `import { browser } from '$app/environment'`
- **GraphQL**: URQL client for data fetching with type support
- **Async**: Prefer async/await over callbacks/promises

## Key Architecture Notes
- Webapp: SvelteKit-based frontend
- Services: Node.js backend services (matcher)
- Database: PostgreSQL with migrations in db/migrations
- Auth: Keycloak integration supported (configurable)