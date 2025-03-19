// This file is for a custom server when using adapter-node
// See https://kit.svelte.dev/docs/adapter-node#custom-server

import { handler } from './handler';
import express from 'express';
import * as config_file from './config.js';

const config = config_file.config;
const { PORT = 5000 } = process.env;

const app = express();

// Add middlewares as needed
app.use(express.json());

// Let SvelteKit handle everything else
app.use(handler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
