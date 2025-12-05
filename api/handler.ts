import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/api/index';

// Single serverless handler that forwards every request to the Express app.
// This keeps the deployment to a single Serverless Function (Hobby plan friendly).
export default function handler(req: VercelRequest, res: VercelResponse) {
  return (app as any)(req, res);
}
