// api/deliveries.ts - Serverless function
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../lib/db';
import { getModels } from '../lib/schemas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
    const { Delivery, Product } = getModels();

    if (req.method === 'GET') {
      const deliveries = await Delivery.find();
      return res.json(deliveries);
    }

    if (req.method === 'POST') {
      const delivery = await Delivery.create(req.body);

      // Update product stock (decrease)
      if (req.body.items && req.body.items.length > 0) {
        for (const item of req.body.items) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: -Number(item.quantity) } }
          );
        }
      }

      return res.status(201).json(delivery);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Deliveries error:', error);
    res.status(500).json({ message: 'Error' });
  }
}
