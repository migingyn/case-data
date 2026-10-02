import express, { type ErrorRequestHandler } from 'express';
import { env } from './env.ts';
import { HttpError } from './errors.ts';
import { aiRouter } from './routes/ai.ts';
import { clioRouter } from './routes/clio.ts';
import { syncRouter } from './routes/sync.ts';

const app = express();
app.use(express.json());

app.use('/api/clio', clioRouter);
app.use('/api/ai', aiRouter);
app.use('/api/sync', syncRouter);

// Only HttpError messages reach the client. Everything else is logged by name
// only: messages and bodies from Clio or OpenAI can carry case data or tokens.
const handleError: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  console.error(`Unhandled ${error instanceof Error ? error.name : 'error'}`);
  res.status(500).json({ error: 'Something went wrong on the server.' });
};
app.use(handleError);

// Bound to localhost: these routes have no auth until the app has sign-in.
app.listen(env.PORT, '127.0.0.1', () => {
  console.log(`API server on http://127.0.0.1:${env.PORT}`);
});
