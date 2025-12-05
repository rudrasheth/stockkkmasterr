// ============================================
// EMAIL TRANSPORTER (Optional)
// ============================================
//
// DEPLOYMENT: Set these in Vercel Environment Variables (optional):
//   - EMAIL_USER = your Gmail address
//   - EMAIL_PASS = your Gmail App Password (NOT your regular password)
//
// To create a Gmail App Password:
//   1. Go to https://myaccount.google.com/apppasswords
//   2. Select "Mail" and "Windows Computer"
//   3. Copy the 16-character password
//   4. Paste it as EMAIL_PASS in Vercel
//
// If not set, email features will be disabled (endpoint returns 503).
//
import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

export function getEmailTransporter() {
  if (transporter) {
    return transporter;
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { 
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
      }
    });
  } else {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. Email features are disabled.');
  }

  return transporter;
}
