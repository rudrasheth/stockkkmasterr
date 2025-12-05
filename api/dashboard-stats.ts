// api/dashboard-stats.ts - Serverless function
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../lib/db';
import { getModels } from '../lib/schemas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { Product, Receipt, Delivery, Transfer } = getModels();

    const products = await Product.find();
    const receiptsCount = await Receipt.countDocuments();
    const deliveriesCount = await Delivery.countDocuments();
    const transfersCount = await Transfer.countDocuments();

    res.json({
      totalProducts: products.length,
      lowStock: products.filter(
        p => (p.stock || 0) <= (p.reorderPoint || 10) && (p.stock || 0) > 0
      ).length,
      outOfStock: products.filter(p => (p.stock || 0) === 0).length,
      pendingReceipts: receiptsCount,
      pendingDeliveries: deliveriesCount,
      scheduledTransfers: transfersCount
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ totalProducts: 0 });
  }
}
