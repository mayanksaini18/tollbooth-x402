/**
 * Lets the dashboard start a run, so the question can be typed on screen instead of
 * in a terminal. Spawns the agent as a child process with argv passed as an array —
 * never through a shell — so a typed question cannot become a command.
 */
import { spawn } from 'node:child_process';
import type { Context } from 'hono';
import { emit, reset } from '../events.js';

let running = false;

/** Whether a run is currently in flight, so a reconnecting page can re-arm its button. */
export const isRunning = () => running;

export async function askHandler(c: Context) {
  if (running) return c.json({ error: 'busy', message: 'A run is already in progress.' }, 409);

  const { question } = await c.req.json<{ question?: string }>();
  const q = (question ?? '').trim().slice(0, 400);
  if (!q) return c.json({ error: 'empty', message: 'Ask something.' }, 400);

  reset();
  running = true;

  const child = spawn('pnpm', ['exec', 'tsx', 'client/research-agent.ts', q], {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', d => process.stdout.write(d));
  child.stderr.on('data', d => process.stderr.write(d));
  // The server owns the end of a run: the agent can exit down several paths — bought
  // nothing, crashed, was killed — and the dashboard must re-arm on every one of them.
  child.on('close', code => {
    running = false;
    emit({ type: 'finished', side: 'agent', code });
    if (code !== 0) emit({ type: 'failed', side: 'agent', error: `agent exited with code ${code}` });
  });

  return c.json({ ok: true, question: q });
}
