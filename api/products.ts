// api/products.ts - Serverless function
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../lib/db';
import { getModels } from '../lib/schemas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
    const { Product } = getModels();

    if (req.method === 'GET') {
      const products = await Product.find();
      return res.json(products);
    }

    if (req.method === 'POST') {
      const { initialStock, ...body } = req.body;
      const product = await Product.create({
        ...body,
        stock: Number(initialStock) || 0
      });
      return res.status(201).json(product);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ message: 'Error' });
  }
}
