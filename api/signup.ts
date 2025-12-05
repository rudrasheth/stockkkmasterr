// ============================================
// API HANDLER: /api/signup (POST)
// ============================================
// 
// DEPLOYMENT: This runs on Vercel as a serverless function.
// Make sure DB_CONNECT_STRING is set in Vercel Environment Variables.
//
// Endpoint: POST /api/signup
// Body: { name, email, password, role }
// Response: { message: "User created successfully" }
//
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../lib/db';
import { getModels } from '../lib/schemas';
import bcrypt from 'bcrypt';

const saltRounds = 10;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { User } = getModels();
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await User.create({ name, email, password: hashedPassword, role });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
}
