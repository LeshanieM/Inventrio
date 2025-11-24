import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  asset: {
    type: String,
    required: true
  },
  assetId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  technician: String,
  description: String,
  parts: String,
  condition: Number
}, {
  timestamps: true
});

export default mongoose.model('Maintenance', maintenanceSchema);