// This file is for a custom server when using adapter-node
// See https://kit.svelte.dev/docs/adapter-node#custom-server

// Import type definitions for Express
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import moment from 'moment';

// Import the SvelteKit adapter handler (will be generated at build time)
// @ts-ignore - This file is generated at build time
import { handler } from './handler';

// SvelteKit provides access to environment variables through $env modules
// This is handled at build time, so we don't need to do anything special here
// Server-side environment variables are accessible via $env/static/private
// We'll use process.env directly for server configuration

// Server configuration
const PORT: number = typeof process.env.PORT === 'string' ? parseInt(process.env.PORT, 10) : 5000;

const app = express();

// Add middlewares as needed
app.use(express.json());

// Log all requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${moment().format()} - ${req.method} ${req.url}`);
  next();
});

// Let SvelteKit handle everything else
app.use(handler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} at ${moment().format()}`);
});