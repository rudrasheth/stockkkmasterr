// api/vendors.ts - Serverless function
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../lib/db';
import { getModels } from '../lib/schemas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
    const { Vendor } = getModels();

    if (req.method === 'GET') {
      const vendors = await Vendor.find();
      return res.json(vendors);
    }

    if (req.method === 'POST') {
      const vendor = await Vendor.create(req.body);
      return res.status(201).json(vendor);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Vendors error:', error);
    res.status(500).json({ message: 'Error' });
  }
}
