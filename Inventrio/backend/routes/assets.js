import express from 'express';
import Asset from '../models/Asset.js';

const router = express.Router();

// Get all assets with filtering
router.get('/', async (req, res) => {
  try {
    const { search, status, location } = req.query;
    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { id: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (location) {
      filter.location = location;
    }

    const assets = await Asset.find(filter).sort({ createdAt: -1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get asset by ID
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findOne({ id: req.params.id });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new asset
router.post('/', async (req, res) => {
  try {
    // Generate asset ID
    const count = await Asset.countDocuments();
    const newId = `AS-${1000 + count + 1}`;

    const asset = new Asset({
      ...req.body,
      id: newId
    });

    const savedAsset = await asset.save();
    res.status(201).json(savedAsset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update asset
router.put('/:id', async (req, res) => {
  try {
    const asset = await Asset.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    res.json(asset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete asset
router.delete('/:id', async (req, res) => {
  try {
    const asset = await Asset.findOneAndDelete({ id: req.params.id });
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Asset.countDocuments();
    const active = await Asset.countDocuments({ status: 'active' });
    const repair = await Asset.countDocuments({ status: 'repair' });
    
    const lowStock = await Asset.find({
      $expr: { $lte: ['$quantity', '$minThreshold'] }
    });

    res.json({
      total,
      active,
      repair,
      lowStock: lowStock.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;