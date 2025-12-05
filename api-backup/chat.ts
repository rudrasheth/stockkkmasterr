// api/chat.ts - Serverless function
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../lib/db';
import { getModels } from '../lib/schemas';
import { getGenAI } from '../lib/ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { Product } = getModels();
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: 'Message is required' });
    }

    const products = await Product.find().select('name stock reorderPoint');
    const productList = products
      .map(p => `Name: ${p.name}, Stock: ${p.stock}, Reorder: ${p.reorderPoint}`)
      .join('; ');

    const genAI = getGenAI();
    if (!genAI) {
      return res.status(503).json({ reply: 'AI service not configured on this server' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are StockBot, an expert inventory and supply chain analyst for StockMaster.\nCURRENT INVENTORY DATA: [${productList}]\nUSER QUERY: ${message}`;

    const result = await model.generateContent(prompt);
    const reply = await result.response.text();

    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ reply: 'AI error: could not process request' });
  }
}
