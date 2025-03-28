// This file is for a custom server when using adapter-node
// See https://kit.svelte.dev/docs/adapter-node#custom-server

import { handler } from './handler';
import express from 'express';
import { private_env } from './private_env.js';
import moment from 'moment';

const { PORT = 5000 } = process.env;

const app = express();

// Add middlewares as needed
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${moment().format()} - ${req.method} ${req.url}`);
  next();
});

// Let SvelteKit handle everything else
app.use(handler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} at ${moment().format()}`);
});
