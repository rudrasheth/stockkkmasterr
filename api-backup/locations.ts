// api/locations.ts - Serverless function
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../lib/db';
import { getModels } from '../lib/schemas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
    const { Location } = getModels();

    if (req.method === 'GET') {
      const locations = await Location.find();
      return res.json(locations);
    }

    if (req.method === 'POST') {
      const location = await Location.create(req.body);
      return res.status(201).json(location);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Locations error:', error);
    res.status(500).json({ message: 'Error' });
  }
}
