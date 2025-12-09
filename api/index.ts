import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-nocheck
import handler from './handler.js';

// Re-export the handler as `api/index.ts` so Vercel routes like `/api/*` can
// be directed to this single serverless function file.
export default function (req: VercelRequest, res: VercelResponse) {
  return (handler as any)(req, res);
}
