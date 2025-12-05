// api/forgot-password.ts - Serverless function
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../lib/db';
import { getModels } from '../lib/schemas';
import { getEmailTransporter } from '../lib/email';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { User } = getModels();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const transporter = getEmailTransporter();

    if (!transporter) {
      return res.status(503).json({ message: 'Email service is not configured' });
    }

    const mailInfo = await transporter.sendMail({
      from: '"StockMaster" <no-reply@stockmaster.com>',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP is: ${otp}`
    });

    console.log('Email sent successfully. Message ID:', mailInfo.messageId);
    res.json({ message: 'OTP sent successfully', debugOtp: otp });
  } catch (error: any) {
    console.error('Forgot password error:', error);

    if (error.code === 'EAUTH') {
      return res.status(500).json({ message: 'Email authentication failed' });
    }

    res.status(500).json({ message: 'Failed to send OTP' });
  }
}
