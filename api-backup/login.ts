// ============================================
// API HANDLER: /api/login (POST)
// ============================================
// 
// DEPLOYMENT: This runs on Vercel as a serverless function.
// Make sure DB_CONNECT_STRING is set in Vercel Environment Variables.
//
// Endpoint: POST /api/login
// Body: { email, password }
// Response: { message: "Login OK", token, user }
//
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../lib/db';
import { getModels } from '../lib/schemas';
import bcrypt from 'bcrypt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { User } = getModels();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const user = await User.findOne({ email });

    if (user && user.password && await bcrypt.compare(password, user.password)) {
      const token = `t-${user._id}`;
      return res.json({ message: 'Login OK', token, user });
    }

    res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
}
