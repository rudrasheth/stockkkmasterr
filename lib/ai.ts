// ============================================
// GOOGLE GENERATIVE AI (Optional)
// ============================================
//
// DEPLOYMENT: Set this in Vercel Environment Variables (optional):
//   - GEMINI_API_KEY = your Google Generative AI API key
//
// To get a free API key:
//   1. Go to https://ai.google.dev
//   2. Click "Get API Key"
//   3. Create a new project and copy the key
//   4. Paste it as GEMINI_API_KEY in Vercel
//
// If not set, AI chat features will be disabled (endpoint returns 503).
//
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

export function getGenAI() {
  if (genAI) {
    return genAI;
  }

  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } else {
    console.warn('⚠️ GEMINI_API_KEY not set. AI features are disabled.');
  }

  return genAI;
}
