// lib/schemas.ts - Shared MongoDB schemas
import mongoose from 'mongoose';

export function getModels() {
  const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: String,
    role: String
  });

  const ProductSchema = new mongoose.Schema({
    name: String,
    category: String,
    price: Number,
    stock: { type: Number, default: 0 },
    unit: String,
    reorderPoint: { type: Number, default: 10 }
  });

  const VendorSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    address: String
  });

  const LocationSchema = new mongoose.Schema({
    name: String,
    type: String,
    capacity: String
  });

  const ReceiptSchema = new mongoose.Schema({
    receiptNo: String,
    vendorId: String,
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Done' },
    items: [{ productId: String, quantity: Number, cost: Number }]
  });

  const DeliverySchema = new mongoose.Schema({
    deliveryNo: String,
    customer: String,
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Done' },
    items: [{ productId: String, quantity: Number }]
  });

  const TransferSchema = new mongoose.Schema({
    reference: String,
    fromLocation: String,
    toLocation: String,
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Done' }
  });

  return {
    User: mongoose.models.User || mongoose.model('User', UserSchema),
    Product: mongoose.models.Product || mongoose.model('Product', ProductSchema),
    Vendor: mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema),
    Location: mongoose.models.Location || mongoose.model('Location', LocationSchema),
    Receipt: mongoose.models.Receipt || mongoose.model('Receipt', ReceiptSchema),
    Delivery: mongoose.models.Delivery || mongoose.model('Delivery', DeliverySchema),
    Transfer: mongoose.models.Transfer || mongoose.model('Transfer', TransferSchema),
  };
}
