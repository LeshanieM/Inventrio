import express from 'express';
import Maintenance from '../models/Maintenance.js';

const router = express.Router();

// Get all maintenance records
router.get('/', async (req, res) => {
  try {
    const maintenance = await Maintenance.find().sort({ date: -1 });
    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get maintenance record by ID
router.get('/:id', async (req, res) => {
  try {
    const maintenance = await Maintenance.findOne({ id: req.params.id });
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create maintenance record
router.post('/', async (req, res) => {
  try {
    // Use provided id if exists, else generate
    const providedId = req.body.id;
    const maintenance = new Maintenance({
      id: providedId || `WO-${3330 + (await Maintenance.countDocuments()) + 1}`, // Fallback only
      ...req.body,
      date: new Date(req.body.date),
    });
    const savedMaintenance = await maintenance.save();
    res.status(201).json(savedMaintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Update maintenance record (full update)
router.put('/:id', async (req, res) => {
  try {
    const maintenance = await Maintenance.findOneAndUpdate(
      { id: req.params.id },
      {
        ...req.body,
        date: new Date(req.body.date),
      },
      { new: true, runValidators: true }
    );

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    res.json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update maintenance status
router.patch('/:id/status', async (req, res) => {
  try {
    const maintenance = await Maintenance.findOneAndUpdate(
      { id: req.params.id },
      { status: req.body.status },
      { new: true }
    );

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    res.json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete maintenance record
router.delete('/:id', async (req, res) => {
  try {
    const maintenance = await Maintenance.findOneAndDelete({
      id: req.params.id,
    });

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    res.json({ message: 'Maintenance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
