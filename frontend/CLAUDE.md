# Koordinator Frontend Development Guide

## Development Commands
- **Start Dev Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Preview Production Build**: `npm run preview`
- **Start Production Server**: `npm start`

## Migration Status
This project has been fully migrated from Sapper to SvelteKit. All routes are now in the SvelteKit file-based routing format:
- Page components use `+page.svelte` files in route directories
- Data loading is handled in separate `+page.js` files
- API endpoints use `+server.js` files with HTTP method handlers
- Layouts are defined in `+layout.svelte` files

When working with this codebase:
- Use SvelteKit conventions for all new code
- Use `browser` from `$app/environment` instead of `process.browser`
- Use relative import paths using `../` for parent directories
- Use SvelteKit's imports for navigation:
  - `import { goto } from '$app/navigation'`
  - `import { page } from '$app/stores'`

## Code Style Guidelines
- **Framework**: SvelteKit application using client-side rendering
- **Modules**: Use ES modules with `.js` extension
- **Imports**: Prefer relative imports (`../`) or alias imports (`$lib/`)
- **Component Files**: Use `.svelte` extension with PascalCase naming
- **Variables/Functions**: Use snake_case for variables and functions
- **Documentation**: Use JSDoc comments for functions (see jsdoc-template.js)
- **Error Handling**: Use try/catch blocks with console.error for error logging
- **Store Pattern**: Use Svelte stores and shared local storage stores
- **TypeScript**: Use TypeScript with at least noImplicitAny and strictNullChecks
- **Type Definitions**: Define types in app.d.ts or types.d.ts
- **Navigation**: Use SvelteKit's imports from `$app/navigation` for navigation
- **Environment**: Use `browser` from `$app/environment` (not process.browser)
- **Authentication**: Custom auth implementation with Auth0 integration
- **GraphQL**: Apollo client for data fetching

## SvelteKit Conventions
- Pages use `+page.svelte` and `+page.js` files in route directories
- Use `data-sveltekit-preload-data` for link prefetching (not rel=prefetch)
- Server endpoints use `+server.js` files with HTTP method exports
- Layout components use `+layout.svelte` files
- Error pages use `+error.svelte` files
- Load data with `load` functions in `+page.js` or `+page.server.js`

## Environment Setup
See README.md for initial setup instructions. Create necessary `.env` files for local development.