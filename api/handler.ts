import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection (cached) with graceful fallback to in-memory store
let MONGO_URI = process.env.MONGO_URI || process.env.DB_CONNECT_STRING || 'mongodb+srv://tanvikamath22_db_user:Rudra1234@odoo.4uxsul0.mongodb.net/test?appName=Odoo';
// Ensure /test database is in the URI
if (MONGO_URI) {
  console.log('[INIT] Original MONGO_URI:', MONGO_URI.substring(0, 50) + '...');
  
  // If URI has /?appName but no /test, insert /test before the query params
  if (MONGO_URI.includes('/?') && !MONGO_URI.includes('/test')) {
    MONGO_URI = MONGO_URI.replace('/?', '/test?');
    console.log('[INIT] Fixed URI to add /test before query params');
  } 
  // If URI ends without / and no /test, add it
  else if (!MONGO_URI.includes('/test') && !MONGO_URI.includes('?')) {
    MONGO_URI = MONGO_URI + '/test';
    console.log('[INIT] Fixed URI by appending /test');
  }
  console.log('[INIT] Final MONGO_URI:', MONGO_URI.substring(0, 50) + '...');
}
const USE_MEMORY = !MONGO_URI;
let cachedConn: typeof mongoose | null = null;
let cachedPromise: Promise<typeof mongoose> | null = null;

console.log(`[INIT] MongoDB URI present: ${!!MONGO_URI}`);
console.log(`[INIT] Using memory mode: ${USE_MEMORY}`);

// Email transport (Gmail)
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const canSendEmail = !!(EMAIL_USER && EMAIL_PASS);
const transporter = canSendEmail
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    })
  : null;

// simple in-memory fallback
const memory = {
  users: [] as Array<{ id: string; name: string; email: string; password: string; role: string }>,
  products: [] as Array<any>,
  receipts: [] as Array<any>,
  deliveries: [] as Array<any>,
  locations: [] as Array<any>,
  transfers: [] as Array<any>,
  vendors: [] as Array<any>,
  payments: [] as Array<any>,
};

// Seed default user for testing
async function ensureDefaultUser() {
  const email = 'demo@stockmaster.com';
  const password = 'Demo123!';
  const name = 'Demo User';
  const role = 'admin';
  const hashed = await bcrypt.hash(password, 10);

  // Always seed in-memory for safety (even when DB is used) so login never fails
  const memExists = memory.users.find(u => u.email === email);
  if (!memExists) {
    memory.users.push({ id: 'demo', name, email, password: hashed, role });
  }

  // Additionally seed DB when available
  if (!USE_MEMORY) {
    const exists = await User.findOne({ email });
    if (!exists) {
      await User.create({ name, email, password: hashed, role });
    }
  }
}

async function sendTempPassword(email: string, tempPassword: string) {
  if (!canSendEmail || !transporter) return;
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'StockMaster Password Reset',
    text: `Your temporary password is: ${tempPassword}\n\nPlease log in and update your password immediately.`
  };
  await transporter.sendMail(mailOptions);
}

async function connectToDb() {
  if (USE_MEMORY) {
    console.log('[DB] Memory mode - skipping MongoDB connection');
    return null as any;
  }
  if (cachedConn) {
    console.log('[DB] Using cached connection');
    return cachedConn;
  }
  if (!cachedPromise) {
    console.log('[DB] Initiating new MongoDB connection...');
    cachedPromise = mongoose.connect(MONGO_URI as string, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    }).then(conn => {
      console.log('[DB] MongoDB connected successfully! Current DB:', conn.connection.name);
      return conn;
    }).catch(err => {
      console.log('[DB] MongoDB connection failed:', err.message);
      cachedPromise = null;
      throw err;
    });
  }
  cachedConn = await cachedPromise;
  return cachedConn;
}

// Schemas (define BEFORE middleware that uses them)
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  role: String,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  stock: { type: Number, default: 0 },
  unit: String,
  reorderPoint: { type: Number, default: 10 }
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const ReceiptSchema = new mongoose.Schema({
  receiptNo: String,
  vendorId: String,
  items: Array,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Receipt = mongoose.models.Receipt || mongoose.model('Receipt', ReceiptSchema);

const DeliverySchema = new mongoose.Schema({
  deliveryNo: String,
  customer: String,
  items: Array,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Delivery = mongoose.models.Delivery || mongoose.model('Delivery', DeliverySchema);

const LocationSchema = new mongoose.Schema({
  name: String,
  type: String,
  capacity: Number,
  createdAt: { type: Date, default: Date.now }
});

const Location = mongoose.models.Location || mongoose.model('Location', LocationSchema);

const VendorSchema = new mongoose.Schema({
  name: String,
  contact: String,
  email: String,
  phone: String,
  address: String,
  createdAt: { type: Date, default: Date.now }
});

const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);

const TransferSchema = new mongoose.Schema({
  transferNo: String,
  fromLocation: String,
  toLocation: String,
  items: Array,
  status: { type: String, default: 'scheduled' },
  createdAt: { type: Date, default: Date.now }
});

const Transfer = mongoose.models.Transfer || mongoose.model('Transfer', TransferSchema);

const PaymentSchema = new mongoose.Schema({
  invoiceNo: String,
  type: String,
  amount: Number,
  status: String,
  method: String,
  dueDate: Date,
  reference: String,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

// Simple init - seed demo user on every startup (cold start)
let isSeeded = false;
async function init() {
  if (isSeeded) return;
  try {
    console.log('[INIT] Seeding demo user...');
    if (!USE_MEMORY) await connectToDb();
    await ensureDefaultUser();
    isSeeded = true;
    console.log('[INIT] Demo user seeded successfully');
  } catch (err) {
    console.error('Init error:', err);
  }
}

// Call init on startup
init().catch(err => console.error('Startup init failed:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ status: "StockMaster API Live" });
});

// Auth handlers (shared for both / and /api prefixes)
const signupHandler = async (req: express.Request, res: express.Response) => {
  try {
    await init(); // Ensure demo user is seeded
    const { name, email, password, role } = req.body;

    // Check in memory first (instant)
    let existing = memory.users.find(u => u.email === email);
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Also check database if available (prevent duplicates across restarts)
    if (!USE_MEMORY && MONGO_URI) {
      try {
        await connectToDb();
        const dbUser = await User.findOne({ email });
        if (dbUser) {
          return res.status(400).json({ message: "User already exists" });
        }
      } catch (err) {
        console.log('DB check for duplicate skipped:', (err as any).message);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: `${Date.now()}`, name, email, password: hashedPassword, role: role || 'staff' };
    memory.users.push(user);

    // Also try to save to MongoDB in background (don't wait)
    if (!USE_MEMORY && MONGO_URI) {
      connectToDb()
        .then(() => User.create({ name, email, password: hashedPassword, role: role || 'staff' }))
        .catch(err => console.log('Background DB save skipped:', err.message));
    }

    return res.status(201).json({
      message: "User created successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({ message: error.message || "Signup failed" });
  }
};

const loginHandler = async (req: express.Request, res: express.Response) => {
  try {
    await init(); // Ensure demo user is seeded
    const { email, password } = req.body;
    console.log('[LOGIN] Attempt for email:', email);

    // Check memory first (instant)
    let user = memory.users.find(u => u.email === email);
    console.log('[LOGIN] Found in memory:', !!user);
    
    // If not in memory and DB is available, try DB in background
    if (!user && !USE_MEMORY && MONGO_URI) {
      try {
        user = await Promise.race([
          User.findOne({ email }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        ]) as any;
        console.log('[LOGIN] Found in DB:', !!user);
      } catch (err: any) {
        console.log('[LOGIN] DB lookup failed:', err.message);
        // Timeout or error - just use memory
      }
    }
    
    if (!user) {
      console.log('[LOGIN] User not found');
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('[LOGIN] Password match:', passwordMatch);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = `token-${user._id || user.id}-${Date.now()}`;
    console.log('[LOGIN] Login successful for:', email);
    res.json({
      message: "Login successful",
      token: token,
      user: { id: user._id || user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Login failed" });
  }
};

// Store verification codes in memory (in production, use Redis or DB)
const verificationCodes = new Map<string, { code: string; timestamp: number; verified: boolean }>();

const forgotPasswordHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    
    if (!transporter) {
      console.warn('Email service not configured.');
      return res.status(503).json({ message: 'Email service is not configured.' });
    }

    // Send code via email
    const mailInfo = await transporter.sendMail({
      from: process.env.EMAIL_USER || '"StockMaster" <stockmaster577@gmail.com>',
      to: email,
      subject: 'StockMaster Password Reset Code',
      text: `Your password reset verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
      html: `<h2>Password Reset</h2><p>Your verification code is:</p><h1 style="color: #1f4cf0; font-size: 32px; letter-spacing: 4px;">${code}</h1><p>This code will expire in 10 minutes.</p>`
    });

    console.log('Code sent to:', email, 'Message ID:', mailInfo.messageId);

    // Store code with timestamp
    verificationCodes.set(email, { code, timestamp: Date.now(), verified: false });

    res.json({ message: 'Verification code sent to your email' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    if (error.code === 'EAUTH') {
      return res.status(500).json({ message: 'Email service authentication failed.' });
    }
    res.status(500).json({ message: error.message || 'Failed to send code' });
  }
};

// Register routes with and without /api prefix for compatibility
app.post('/signup', signupHandler);
app.post('/api/signup', signupHandler);
app.post('/login', loginHandler);
app.post('/api/login', loginHandler);
app.post('/forgot-password', forgotPasswordHandler);
app.post('/api/forgot-password', forgotPasswordHandler);

// Verify reset code
app.post('/api/verify-code', async (req: express.Request, res: express.Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email and code required' });

    const stored = verificationCodes.get(email);
    if (!stored) return res.status(400).json({ message: 'No code sent for this email' });

    // Check expiry (10 minutes)
    if (Date.now() - stored.timestamp > 10 * 60 * 1000) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Code expired. Request a new one.' });
    }

    if (stored.code !== code) return res.status(400).json({ message: 'Invalid code' });

    // Mark as verified
    stored.verified = true;
    verificationCodes.set(email, stored);

    res.json({ message: 'Code verified' });
  } catch (error: any) {
    console.error('Verify code error:', error);
    res.status(500).json({ message: error.message || 'Verification failed' });
  }
});

// Reset password with code
app.post('/api/reset-password', async (req: express.Request, res: express.Response) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ message: 'Email and password required' });

    const stored = verificationCodes.get(email);
    if (!stored || !stored.verified) {
      return res.status(400).json({ message: 'Code not verified. Please verify your code first.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Always update in-memory user first (for both USE_MEMORY and DB modes)
    const memoryUser = memory.users.find(u => u.email === email);
    if (memoryUser) {
      memoryUser.password = hashedPassword;
    }

    if (USE_MEMORY) {
      if (!memoryUser) return res.status(404).json({ message: 'User not found' });
      verificationCodes.delete(email);
      return res.json({ message: 'Password updated successfully' });
    }

    // Also update in DB
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = hashedPassword;
    await user.save();
    verificationCodes.delete(email);

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message || 'Reset failed' });
  }
});

// Dashboard Stats
const dashboardHandler = async (req: express.Request, res: express.Response) => {
  try {
    if (USE_MEMORY) {
      const products = memory.products;
      const stats = {
        totalProducts: products.length,
        lowStock: products.filter(p => (p.stock || 0) <= (p.reorderPoint || 10) && (p.stock || 0) > 0).length,
        outOfStock: products.filter(p => (p.stock || 0) === 0).length,
        pendingReceipts: memory.receipts.length,
        pendingDeliveries: memory.deliveries.length,
        scheduledTransfers: 0
      };
      return res.json(stats);
    }

    const products = await Product.find();
    const receipts = await Receipt.countDocuments({ status: 'pending' });
    const deliveries = await Delivery.countDocuments({ status: 'pending' });
    
    const stats = {
      totalProducts: products.length,
      lowStock: products.filter(p => (p.stock || 0) <= (p.reorderPoint || 10) && (p.stock || 0) > 0).length,
      outOfStock: products.filter(p => (p.stock || 0) === 0).length,
      pendingReceipts: receipts,
      pendingDeliveries: deliveries,
      scheduledTransfers: 0
    };
    res.json(stats);
  } catch (error: any) {
    console.error("Stats error:", error);
    res.json({
      totalProducts: 0,
      lowStock: 0,
      outOfStock: 0,
      pendingReceipts: 0,
      pendingDeliveries: 0,
      scheduledTransfers: 0
    });
  }
};

app.get('/dashboard-stats', dashboardHandler);
app.get('/api/dashboard-stats', dashboardHandler);

// Recent Activity & Heatmap
const recentActivityHandler = async (req: express.Request, res: express.Response) => {
  try {
    // Get recent receipts and deliveries for activity
    let activity = [];
    let heatmap = [];

    if (USE_MEMORY) {
      // Activity: recent receipts and deliveries
      const recentReceipts = memory.receipts.slice(-5).reverse().map(r => ({
        type: 'Receipt',
        ref: r.receiptNo,
        date: r.createdAt
      }));
      const recentDeliveries = memory.deliveries.slice(-5).reverse().map(d => ({
        type: 'Delivery',
        ref: d.deliveryNo,
        date: d.createdAt
      }));
      activity = [...recentReceipts, ...recentDeliveries].slice(0, 10);

      // Heatmap: simulate warehouse movement from locations
      heatmap = memory.locations.slice(0, 12).map(loc => ({
        location: loc.name,
        movement: Math.floor(Math.random() * 100),
        status: Math.random() > 0.6 ? 'hot' : Math.random() > 0.3 ? 'warm' : 'cool'
      }));
    } else {
      try {
        // DB: get recent receipts and deliveries
        const receipts = await Receipt.find().sort({ createdAt: -1 }).limit(5);
        const deliveries = await Delivery.find().sort({ createdAt: -1 }).limit(5);
        
        activity = [
          ...receipts.map(r => ({ type: 'Receipt', ref: r.receiptNo, date: r.createdAt })),
          ...deliveries.map(d => ({ type: 'Delivery', ref: d.deliveryNo, date: d.createdAt }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

        // Heatmap: get locations with simulated movement
        const locations = await Location.find().limit(12);
        heatmap = locations.map(loc => ({
          location: loc.name,
          movement: Math.floor(Math.random() * 100),
          status: Math.random() > 0.6 ? 'hot' : Math.random() > 0.3 ? 'warm' : 'cool'
        }));
      } catch (err) {
        // Fallback to memory if DB fails
        const recentReceipts = memory.receipts.slice(-5).reverse().map(r => ({
          type: 'Receipt',
          ref: r.receiptNo,
          date: r.createdAt
        }));
        const recentDeliveries = memory.deliveries.slice(-5).reverse().map(d => ({
          type: 'Delivery',
          ref: d.deliveryNo,
          date: d.createdAt
        }));
        activity = [...recentReceipts, ...recentDeliveries].slice(0, 10);
        heatmap = memory.locations.slice(0, 12).map(loc => ({
          location: loc.name,
          movement: Math.floor(Math.random() * 100),
          status: Math.random() > 0.6 ? 'hot' : Math.random() > 0.3 ? 'warm' : 'cool'
        }));
      }
    }

    res.json({ activity, heatmap });
  } catch (error: any) {
    console.error('Recent activity error:', error);
    res.status(500).json({ 
      activity: [], 
      heatmap: [] 
    });
  }
};

app.get('/recent-activity', recentActivityHandler);
app.get('/api/recent-activity', recentActivityHandler);
const productsGetHandler = async (req: express.Request, res: express.Response) => {
  try {
    console.log('[GET /products] USE_MEMORY:', USE_MEMORY);
    if (USE_MEMORY) {
      console.log('[GET /products] Returning memory products:', memory.products.length);
      return res.json(memory.products);
    }
    try {
      console.log('[GET /products] Attempting DB query...');
      await connectToDb();
      console.log('[GET /products] Connected. DB name:', mongoose.connection.name);
      console.log('[GET /products] Collections:', (await mongoose.connection.db?.listCollections().toArray()) || 'N/A');
      const products = await Product.find().limit(100);
      console.log('[GET /products] DB returned:', products.length, 'products');
      res.json(products);
    } catch (dbErr: any) {
      console.log('[GET /products] DB failed, falling back to memory:', dbErr.message);
      res.json(memory.products);
    }
  } catch (error: any) {
    console.error('[GET /products] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const productsPostHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { name, category, price, stock, unit, reorderPoint } = req.body;
    console.log('[POST /products] Received:', { name, category, price, stock });
    
    // Save to memory immediately
    const memoryProduct = {
      id: `${Date.now()}`,
      name,
      category,
      price,
      stock: stock || 0,
      unit: unit || 'pcs',
      reorderPoint: reorderPoint || 10
    };
    memory.products.push(memoryProduct);
    console.log('[POST /products] Saved to memory, total:', memory.products.length);

    // Also try to save to MongoDB in background (don't pass custom _id)
    if (!USE_MEMORY && MONGO_URI) {
      const dbPayload = {
        name,
        category,
        price,
        stock: stock || 0,
        unit: unit || 'pcs',
        reorderPoint: reorderPoint || 10
      };
      console.log('[POST /products] Attempting async DB save...');
      connectToDb().then(() => {
        Product.create(dbPayload).then(() => {
          console.log('[POST /products] Async DB save successful');
        }).catch(err => {
          console.log('[POST /products] Async DB save failed:', err.message);
        });
      }).catch(err => {
        console.log('[POST /products] DB connection failed:', err.message);
      });
    }

    return res.status(201).json(memoryProduct);
  } catch (error: any) {
    console.error('[POST /products] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

app.get('/products', productsGetHandler);
app.get('/api/products', productsGetHandler);
app.post('/products', productsPostHandler);
app.post('/api/products', productsPostHandler);

// Receipts
const receiptsGetHandler = async (req: express.Request, res: express.Response) => {
  try {
    if (USE_MEMORY) return res.json(memory.receipts);
    try {
      const receipts = await Receipt.find().limit(100);
      res.json(receipts);
    } catch {
      res.json(memory.receipts);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const receiptsPostHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { receiptNo, vendorId, productId, quantity, items } = req.body;
    
    // Validate quantity
    if (quantity && quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    // Update product stock in memory (increase stock for receipt)
    if (productId && quantity) {
      const product = memory.products.find(p => p.id === productId);
      if (product) {
        product.stock = (product.stock || 0) + quantity;
      }
    }

    const memoryReceipt = { 
      id: `${Date.now()}`, 
      receiptNo, 
      vendorId, 
      productId,
      quantity,
      items: items || [], 
      status: 'completed', 
      createdAt: new Date() 
    };
    memory.receipts.push(memoryReceipt);
    
    // Background DB save without custom _id
    if (!USE_MEMORY && MONGO_URI) {
      const dbPayload = {
        receiptNo,
        vendorId,
        productId,
        quantity,
        items: items || [],
        status: 'completed',
        createdAt: new Date()
      };
      
      // Also update product stock in DB
      if (productId) {
        Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } }).catch(err => 
          console.log('Background product stock update skipped:', err.message)
        );
      }
      
      Receipt.create(dbPayload).catch(err => console.log('Background DB save skipped:', err.message));
    }

    return res.status(201).json(memoryReceipt);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

app.get('/receipts', receiptsGetHandler);
app.get('/api/receipts', receiptsGetHandler);
app.post('/receipts', receiptsPostHandler);
app.post('/api/receipts', receiptsPostHandler);

// Deliveries
const deliveriesGetHandler = async (req: express.Request, res: express.Response) => {
  try {
    if (USE_MEMORY) return res.json(memory.deliveries);
    try {
      const deliveries = await Delivery.find().limit(100);
      res.json(deliveries);
    } catch {
      res.json(memory.deliveries);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const deliveriesPostHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { deliveryNo, customer, productId, quantity, items } = req.body;
    
    // Validate quantity
    if (quantity && quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    // Check if product has sufficient stock
    if (productId && quantity) {
      const product = memory.products.find(p => p.id === productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      if ((product.stock || 0) < quantity) {
        return res.status(400).json({ message: `Insufficient stock. Available: ${product.stock || 0}` });
      }
      // Decrease stock for delivery
      product.stock = (product.stock || 0) - quantity;
    }

    const memoryDelivery = { 
      id: `${Date.now()}`, 
      deliveryNo, 
      customer,
      productId,
      quantity,
      items: items || [], 
      status: 'completed', 
      createdAt: new Date() 
    };
    memory.deliveries.push(memoryDelivery);
    
    // Background DB save without custom _id
    if (!USE_MEMORY && MONGO_URI) {
      const dbPayload = {
        deliveryNo,
        customer,
        productId,
        quantity,
        items: items || [],
        status: 'completed',
        createdAt: new Date()
      };
      
      // Also update product stock in DB (decrease)
      if (productId) {
        Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } }).catch(err => 
          console.log('Background product stock update skipped:', err.message)
        );
      }
      
      Delivery.create(dbPayload).catch(err => console.log('Background DB save skipped:', err.message));
    }

    return res.status(201).json(memoryDelivery);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

app.get('/deliveries', deliveriesGetHandler);
app.get('/api/deliveries', deliveriesGetHandler);
app.post('/deliveries', deliveriesPostHandler);
app.post('/api/deliveries', deliveriesPostHandler);

// Locations
const locationsGetHandler = async (req: express.Request, res: express.Response) => {
  try {
    if (USE_MEMORY) return res.json(memory.locations);
    try {
      const locations = await Location.find().limit(100);
      res.json(locations);
    } catch {
      res.json(memory.locations);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const locationsPostHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { name, type, capacity } = req.body;
    const memoryLocation = { 
      id: `${Date.now()}`, 
      name, 
      type, 
      capacity: capacity || 1000, 
      createdAt: new Date() 
    };
    memory.locations.push(memoryLocation);
    
    // Background DB save without custom _id
    if (!USE_MEMORY && MONGO_URI) {
      const dbPayload = {
        name,
        type,
        capacity: capacity || 1000,
        createdAt: new Date()
      };
      Location.create(dbPayload).catch(err => console.log('Background DB save skipped:', err.message));
    }

    return res.status(201).json(memoryLocation);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

app.get('/locations', locationsGetHandler);
app.get('/api/locations', locationsGetHandler);
app.post('/locations', locationsPostHandler);
app.post('/api/locations', locationsPostHandler);

// Transfers
const transfersGetHandler = async (req: express.Request, res: express.Response) => {
  try {
    if (USE_MEMORY) return res.json(memory.transfers);
    try {
      const transfers = await Transfer.find().limit(100);
      res.json(transfers);
    } catch {
      res.json(memory.transfers);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const transfersPostHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { transferNo, fromLocation, toLocation, items, status } = req.body;
    const memoryTransfer = {
      id: `${Date.now()}`,
      transferNo: transferNo || `TR-${Date.now()}`,
      fromLocation,
      toLocation,
      items: items || [],
      status: status || 'scheduled',
      createdAt: new Date()
    };
    memory.transfers.push(memoryTransfer);

    if (!USE_MEMORY && MONGO_URI) {
      const dbPayload = {
        transferNo: transferNo || `TR-${Date.now()}`,
        fromLocation,
        toLocation,
        items: items || [],
        status: status || 'scheduled',
        createdAt: new Date()
      };
      Transfer.create(dbPayload).catch(err => console.log('Background DB save skipped:', err.message));
    }

    return res.status(201).json(memoryTransfer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

app.get('/transfers', transfersGetHandler);
app.get('/api/transfers', transfersGetHandler);
app.post('/transfers', transfersPostHandler);
app.post('/api/transfers', transfersPostHandler);

// Vendors
const vendorsGetHandler = async (req: express.Request, res: express.Response) => {
  try {
    if (USE_MEMORY) return res.json(memory.vendors);
    try {
      const vendors = await Vendor.find().limit(100);
      res.json(vendors);
    } catch {
      res.json(memory.vendors);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const vendorsPostHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { name, contact, email, phone, address } = req.body;
    const memoryVendor = {
      id: `${Date.now()}`,
      name,
      contact,
      email,
      phone,
      address,
      createdAt: new Date()
    };
    memory.vendors.push(memoryVendor);

    if (!USE_MEMORY && MONGO_URI) {
      const dbPayload = { name, contact, email, phone, address, createdAt: new Date() };
      Vendor.create(dbPayload).catch(err => console.log('Background DB save skipped:', err.message));
    }

    return res.status(201).json(memoryVendor);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

app.get('/vendors', vendorsGetHandler);
app.get('/api/vendors', vendorsGetHandler);
app.post('/vendors', vendorsPostHandler);
app.post('/api/vendors', vendorsPostHandler);

// Payments endpoints
async function paymentsGetHandler(req: express.Request, res: express.Response) {
  try {
    await init();
    if (USE_MEMORY) {
      res.json(memory.payments);
    } else {
      const data = await Payment.find({});
      res.json(data);
    }
  } catch (err: any) {
    console.error('GET payments error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function paymentsPostHandler(req: express.Request, res: express.Response) {
  try {
    await init();
    const { invoiceNo, type, amount, status, method, dueDate, reference, notes } = req.body;
    if (USE_MEMORY) {
      const newPayment = { 
        id: Date.now().toString(), 
        invoiceNo, type, amount, status, method, dueDate, reference, notes, 
        createdAt: new Date() 
      };
      memory.payments.push(newPayment);
      res.json(newPayment);
    } else {
      const doc = await Payment.create({ 
        invoiceNo, type, amount, status, method, dueDate, reference, notes 
      });
      res.json(doc);
    }
  } catch (err: any) {
    console.error('POST payment error:', err);
    res.status(500).json({ error: err.message });
  }
}

app.get('/payments', paymentsGetHandler);
app.get('/api/payments', paymentsGetHandler);
app.post('/payments', paymentsPostHandler);
app.post('/api/payments', paymentsPostHandler);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongoUri: MONGO_URI ? 'SET' : 'NOT_SET',
    useMemory: USE_MEMORY,
    memoryStats: {
      users: memory.users.length,
      products: memory.products.length,
      receipts: memory.receipts.length,
      deliveries: memory.deliveries.length,
      locations: memory.locations.length
    }
  });
});

// Debug endpoint - list all collections
app.get('/api/debug/collections', async (req, res) => {
  try {
    await connectToDb();
    const collections = await mongoose.connection.db?.listCollections().toArray();
    res.json({ collections: collections?.map(c => c.name) || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Debug endpoint - raw MongoDB query
app.get('/api/debug/products-raw', async (req, res) => {
  try {
    await connectToDb();
    const db = mongoose.connection.db;
    const collection = db?.collection('products');
    const docs = await collection?.find({}).limit(10).toArray();
    res.json({ count: docs?.length, docs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Products endpoints
// Catch all for debugging (keep last)
app.use((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Route not found' });
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
