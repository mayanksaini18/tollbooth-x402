import 'dotenv/config';
import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { loadConfig } from './config.js';

try {
  const config = loadConfig();
  const app = createApp(config);

  serve({ fetch: app.fetch, port: config.port }, info => {
    console.log(`\n  Tollbooth — The Meridian, ${config.price} per article`);
    console.log(`  Dashboard   http://localhost:${info.port}`);
    console.log(`  Free index  http://localhost:${info.port}/feed`);
    console.log(`  Paid route  http://localhost:${info.port}/api/article/:id`);
    console.log(`  Paid to     ${config.payTo}`);
    console.log(`  Network     Algorand ${config.networkName}\n`);
  });
} catch (error) {
  console.error(`Tollbooth could not start: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
