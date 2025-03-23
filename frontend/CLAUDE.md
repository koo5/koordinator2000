# Koordinator Frontend Development Guide

## Development Commands
- **Start Dev Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Preview Production Build**: `npm run preview`
- **Start Production Server**: `npm start`

## Code Style Guidelines
- **Framework**: SvelteKit application using client-side rendering
- **Modules**: Use ES modules with `.js` extension
- **Imports**: Prefer absolute imports from root (`src/`) or alias imports (`$lib/`)
- **Component Files**: Use `.svelte` extension with PascalCase naming
- **Variables/Functions**: Use snake_case for variables and functions
- **Documentation**: Use JSDoc comments for functions (see jsdoc-template.js)
- **Error Handling**: Use try/catch blocks with console.error for error logging
- **Store Pattern**: Use Svelte stores and shared local storage stores
- **TypeScript**: Use TypeScript with at least noImplicitAny and strictNullChecks
- **Type Definitions**: Define types in app.d.ts or types.d.ts
- **Navigation**: Use SvelteKit's `goto` function for client-side navigation
- **Authentication**: Custom auth implementation with Auth0 integration
- **GraphQL**: Apollo client for data fetching

## Environment Setup
See README.md for initial setup instructions. Create necessary `.env` files for local development.