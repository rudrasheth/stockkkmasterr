// api/receipts.ts - Serverless function
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../lib/db';
import { getModels } from '../lib/schemas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
    const { Receipt, Product } = getModels();

    if (req.method === 'GET') {
      const receipts = await Receipt.find();
      return res.json(receipts);
    }

    if (req.method === 'POST') {
      const receipt = await Receipt.create(req.body);

      // Update product stock
      if (req.body.items && req.body.items.length > 0) {
        for (const item of req.body.items) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: Number(item.quantity) } }
          );
        }
      }

      return res.status(201).json(receipt);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Receipts error:', error);
    res.status(500).json({ message: 'Error' });
  }
}
