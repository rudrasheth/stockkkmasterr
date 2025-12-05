// api/transfers.ts - Serverless function
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../lib/db';
import { getModels } from '../lib/schemas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
    const { Transfer } = getModels();

    if (req.method === 'GET') {
      const transfers = await Transfer.find();
      return res.json(transfers);
    }

    if (req.method === 'POST') {
      const transfer = await Transfer.create(req.body);
      return res.status(201).json(transfer);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Transfers error:', error);
    res.status(500).json({ message: 'Error' });
  }
}
