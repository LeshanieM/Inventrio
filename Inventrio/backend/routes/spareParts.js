import express from 'express';
import SparePart from '../models/SpareParts.js';

const router = express.Router();

// Get all spare parts with filtering
router.get('/', async (req, res) => {
  try {
    const { search, unit, vendor } = req.query;
    let filter = {};
    if (search) {
      filter.$or = [
        { partName: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (unit) {
      filter.unit = unit;
    }
    if (vendor) {
      filter.vendor = { $regex: vendor, $options: 'i' };
    }
    const spareParts = await SparePart.find(filter).sort({ createdAt: -1 });
    res.json(spareParts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get spare part by partNumber
router.get('/:partNumber', async (req, res) => {
  try {
    const sparePart = await SparePart.findOne({
      partNumber: req.params.partNumber,
    });
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }
    res.json(sparePart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new spare part
router.post('/', async (req, res) => {
  try {
    // Generate partNumber if not provided
    const providedPartNumber = req.body.partNumber;
    const count = await SparePart.countDocuments();
    const newPartNumber = providedPartNumber || `SP-${1000 + count + 1}`;
    const sparePart = new SparePart({
      ...req.body,
      partNumber: newPartNumber,
    });
    const savedSparePart = await sparePart.save();
    res.status(201).json(savedSparePart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update spare part
router.put('/:partNumber', async (req, res) => {
  try {
    const sparePart = await SparePart.findOneAndUpdate(
      { partNumber: req.params.partNumber },
      req.body,
      { new: true, runValidators: true }
    );

    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    res.json(sparePart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete spare part
router.delete('/:partNumber', async (req, res) => {
  try {
    const sparePart = await SparePart.findOneAndDelete({
      partNumber: req.params.partNumber,
    });

    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    res.json({ message: 'Spare part deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get usage history (simple endpoint - can be expanded with a Usage model)
router.get('/usage', async (req, res) => {
  try {
    // Initially, return mock usage data filtered by partNumber if provided
    // In production, query a Usage collection
    const { partNumber } = req.query;
    let mockUsage = [
      {
        id: 'USG-001',
        partNumber: 'SP001',
        action: 'Issued for repair',
        status: 'issued',
        quantity: 1,
        technician: 'John Smith',
        date: new Date(Date.now() - 86400000 * 3), // 3 days ago
        notes: 'Used for forklift hydraulic service',
      },
      {
        id: 'USG-002',
        partNumber: 'SP002',
        action: 'Received from vendor',
        status: 'received',
        quantity: 50,
        technician: 'Mike Johnson',
        date: new Date(Date.now() - 86400000 * 1), // Yesterday
        notes: 'Bulk oil delivery',
      },
    ];
    if (partNumber) {
      mockUsage = mockUsage.filter((u) => u.partNumber === partNumber);
    }
    res.json(mockUsage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard statistics for spare parts
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await SparePart.countDocuments();
    const lowStock = await SparePart.find({
      $expr: { $lte: ['$stock', '$minimumStock'] },
    });
    res.json({
      total,
      lowStock: lowStock.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
