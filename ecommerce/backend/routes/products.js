const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// @route GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, minPrice, maxPrice, featured, page = 1, limit = 12 } = req.query;
    
    let query = { isActive: true };

    if (category && category !== 'All') query.category = category;
    if (featured === 'true') query.featured = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let sortOption = {};
    switch (sort) {
      case 'price_asc': sortOption = { price: 1 }; break;
      case 'price_desc': sortOption = { price: -1 }; break;
      case 'rating': sortOption = { 'rating.average': -1 }; break;
      case 'newest': sortOption = { createdAt: -1 }; break;
      default: sortOption = { featured: -1, createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortOption).skip(skip).limit(Number(limit));

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/products/featured
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, featured: true }).limit(8);
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/products (Admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, message: 'Product created!', product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route PUT /api/products/:id (Admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product updated!', product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/products/:id (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/products/:id/review
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ success: false, message: 'Already reviewed this product' });

    product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
    const total = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.rating.average = (total / product.reviews.length).toFixed(1);
    product.rating.count = product.reviews.length;

    await product.save();
    res.json({ success: true, message: 'Review added!', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;