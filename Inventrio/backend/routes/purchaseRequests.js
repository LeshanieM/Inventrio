import express from 'express';
import PurchaseRequest from '../models/PurchaseRequest.js';

const router = express.Router();

// Get all purchase requests with filtering
router.get('/', async (req, res) => {
  try {
    const { search, status, vendor } = req.query;
    let filter = {};
    if (search) {
      filter.$or = [
        { partNameOrId: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      filter.status = status;
    }
    if (vendor) {
      filter.preferredVendor = { $regex: vendor, $options: 'i' };
    }
    const purchaseRequests = await PurchaseRequest.find(filter).sort({ createdAt: -1 });
    res.json(purchaseRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get purchase request by ID
router.get('/:id', async (req, res) => {
  try {
    const purchaseRequest = await PurchaseRequest.findOne({ id: req.params.id });
    if (!purchaseRequest) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }
    res.json(purchaseRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new purchase request
router.post('/', async (req, res) => {
  try {
    // Generate purchase request ID
    const count = await PurchaseRequest.countDocuments();
    const newId = `PR-${String(count + 1).padStart(3, '0')}`;
    const purchaseRequest = new PurchaseRequest({
      ...req.body,
      id: newId,
      status: req.body.status || 'pending' // Default to pending
    });
    const savedPurchaseRequest = await purchaseRequest.save();
    res.status(201).json(savedPurchaseRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update purchase request
router.put('/:id', async (req, res) => {
  try {
    const purchaseRequest = await PurchaseRequest.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
   
    if (!purchaseRequest) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }
   
    res.json(purchaseRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete purchase request
router.delete('/:id', async (req, res) => {
  try {
    const purchaseRequest = await PurchaseRequest.findOneAndDelete({ id: req.params.id });
   
    if (!purchaseRequest) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }
   
    res.json({ message: 'Purchase request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await PurchaseRequest.countDocuments();
    const pending = await PurchaseRequest.countDocuments({ status: 'pending' });
    const approved = await PurchaseRequest.countDocuments({ status: 'approved' });
    const rejected = await PurchaseRequest.countDocuments({ status: 'rejected' });
    const completed = await PurchaseRequest.countDocuments({ status: 'completed' });
   
    res.json({
      total,
      pending,
      approved,
      rejected,
      completed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;