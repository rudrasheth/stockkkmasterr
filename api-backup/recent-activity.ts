// api/recent-activity.ts - Serverless function
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../lib/db';
import { getModels } from '../lib/schemas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { Delivery, Receipt } = getModels();

    const deliveries = await Delivery.find()
      .sort({ date: -1 })
      .limit(10)
      .select('deliveryNo date items');

    const receipts = await Receipt.find()
      .sort({ date: -1 })
      .limit(10)
      .select('receiptNo date items');

    const combinedActivity = [
      ...deliveries.map(d => ({
        type: 'Delivery',
        ref: d.deliveryNo,
        date: d.date,
        items: d.items
      })),
      ...receipts.map(r => ({
        type: 'Receipt',
        ref: r.receiptNo,
        date: r.date,
        items: r.items
      }))
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    const heatmapData = [
      { location: 'Zone A', movement: 85, status: 'Hot' },
      { location: 'Zone B', movement: 40, status: 'Normal' },
      { location: 'Zone C', movement: 10, status: 'Cold' }
    ];

    res.json({ activity: combinedActivity, heatmap: heatmapData });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ message: 'Failed to fetch activity data' });
  }
}
