const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./db');
const User = require('../models/User');
const Product = require('../models/Product');

const sampleProducts = [
  {
    name: 'Obsidian Pro Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones with 40-hour battery life, ultra-soft ear cushions, and studio-grade sound. Perfect for audiophiles who demand perfection.',
    price: 299.99,
    originalPrice: 399.99,
    category: 'Electronics',
    brand: 'SoundForge',
    stock: 50,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
    rating: { average: 4.8, count: 2341 },
    tags: ['headphones', 'wireless', 'noise-cancelling', 'premium'],
    featured: true,
    specifications: [
      { key: 'Battery Life', value: '40 hours' },
      { key: 'Driver Size', value: '40mm' },
      { key: 'Frequency', value: '20Hz - 20kHz' },
      { key: 'Weight', value: '250g' }
    ]
  },
  {
    name: 'Phantom X Gaming Mechanical Keyboard',
    description: 'RGB mechanical gaming keyboard with custom tactile switches, per-key lighting, aluminum chassis, and ultra-fast response time. Built for competitive gamers.',
    price: 189.99,
    originalPrice: 229.99,
    category: 'Electronics',
    brand: 'PhantomTech',
    stock: 35,
    images: ['https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=600'],
    rating: { average: 4.7, count: 1876 },
    tags: ['keyboard', 'gaming', 'mechanical', 'rgb'],
    featured: true,
    specifications: [
      { key: 'Switch Type', value: 'Tactile Blue' },
      { key: 'Backlight', value: 'Per-Key RGB' },
      { key: 'Connection', value: 'USB-C + Wireless' },
      { key: 'Keys', value: '104 Keys' }
    ]
  },
  {
    name: 'StealthWatch Ultra Smartwatch',
    description: 'Advanced smartwatch with AMOLED display, health monitoring suite, GPS, and 7-day battery. Water resistant to 100m. Your ultimate fitness companion.',
    price: 449.00,
    originalPrice: 549.00,
    category: 'Wearables',
    brand: 'StealthTech',
    stock: 28,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
    rating: { average: 4.6, count: 983 },
    tags: ['smartwatch', 'fitness', 'gps', 'health'],
    featured: true,
    specifications: [
      { key: 'Display', value: '1.4" AMOLED' },
      { key: 'Battery', value: '7 days' },
      { key: 'Water Resistance', value: '100m' },
      { key: 'GPS', value: 'Multi-band' }
    ]
  },
  {
    name: 'Carbon Fiber Minimalist Wallet',
    description: 'Ultra-slim carbon fiber wallet holds up to 12 cards with RFID blocking technology. Weighs only 28g. The last wallet you will ever need.',
    price: 79.99,
    originalPrice: 99.99,
    category: 'Accessories',
    brand: 'CarbonEdge',
    stock: 120,
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=600'],
    rating: { average: 4.5, count: 3210 },
    tags: ['wallet', 'carbon fiber', 'rfid', 'minimalist'],
    featured: false,
    specifications: [
      { key: 'Material', value: 'Carbon Fiber' },
      { key: 'Capacity', value: '12 Cards' },
      { key: 'RFID', value: 'Blocked' },
      { key: 'Weight', value: '28g' }
    ]
  },
  {
    name: 'Nova 4K Mirrorless Camera',
    description: 'Professional 45MP full-frame mirrorless camera with 8K video recording, in-body stabilization, and AI autofocus. Capture every moment with stunning clarity.',
    price: 2499.00,
    originalPrice: 2999.00,
    category: 'Electronics',
    brand: 'NovaSight',
    stock: 12,
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600'],
    rating: { average: 4.9, count: 542 },
    tags: ['camera', 'mirrorless', '4k', 'professional'],
    featured: true,
    specifications: [
      { key: 'Resolution', value: '45 Megapixels' },
      { key: 'Video', value: '8K 30fps' },
      { key: 'ISO Range', value: '100-51200' },
      { key: 'Weight', value: '650g' }
    ]
  },
  {
    name: 'AeroDesk Pro Standing Desk',
    description: 'Electric height-adjustable standing desk with memory presets, cable management, and whisper-quiet motor. Transform your workspace and boost productivity.',
    price: 699.00,
    originalPrice: 899.00,
    category: 'Furniture',
    brand: 'AeroSpace',
    stock: 18,
    images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600'],
    rating: { average: 4.7, count: 756 },
    tags: ['desk', 'standing', 'ergonomic', 'electric'],
    featured: false,
    specifications: [
      { key: 'Height Range', value: '60-125cm' },
      { key: 'Weight Capacity', value: '80kg' },
      { key: 'Motor', value: 'Dual quiet motor' },
      { key: 'Memory Presets', value: '4 positions' }
    ]
  },
  {
    name: 'Eclipse Portable Bluetooth Speaker',
    description: '360° surround sound portable speaker with 24-hour battery, IPX7 waterproofing, and built-in powerbank. Take your music anywhere.',
    price: 149.99,
    originalPrice: 199.99,
    category: 'Electronics',
    brand: 'SoundForge',
    stock: 75,
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600'],
    rating: { average: 4.4, count: 2109 },
    tags: ['speaker', 'bluetooth', 'portable', 'waterproof'],
    featured: false,
    specifications: [
      { key: 'Battery', value: '24 hours' },
      { key: 'Water Rating', value: 'IPX7' },
      { key: 'Output', value: '40W' },
      { key: 'Range', value: '30m' }
    ]
  },
  {
    name: 'HyperCore Gaming Laptop',
    description: 'Ultimate gaming laptop with RTX 4080, Intel i9 processor, 32GB RAM, and 2TB NVMe SSD. 240Hz QHD display with 1ms response. No compromises.',
    price: 2799.00,
    originalPrice: 3299.00,
    category: 'Electronics',
    brand: 'PhantomTech',
    stock: 8,
    images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600'],
    rating: { average: 4.8, count: 421 },
    tags: ['laptop', 'gaming', 'rtx', 'high-performance'],
    featured: true,
    specifications: [
      { key: 'GPU', value: 'RTX 4080' },
      { key: 'CPU', value: 'Intel i9-13900HX' },
      { key: 'RAM', value: '32GB DDR5' },
      { key: 'Display', value: '240Hz QHD' }
    ]
  }
];

const seed = async () => {
  await connectDB();

  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@nexshop.com',
      password: hashedPassword,
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    });

    // Create test user
    const userPassword = await bcrypt.hash('user123', 10);
    await User.create({
      name: 'John Doe',
      email: 'user@nexshop.com',
      password: userPassword,
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
    });

    // Create products
    await Product.insertMany(sampleProducts);

    console.log('\n✅ Database seeded successfully!');
    console.log('👑 Admin: admin@nexshop.com / admin123');
    console.log('👤 User:  user@nexshop.com / user123');
    console.log(`📦 ${sampleProducts.length} products created\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();