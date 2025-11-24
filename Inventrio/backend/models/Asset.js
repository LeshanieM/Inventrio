import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'repair', 'standby', 'retired'],
    default: 'active'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  minThreshold: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    required: true
  },
  category: String,
  model: String,
  serial: String,
  vendor: String,
  warranty: String,
  installationDate: Date,
  building: String,
  floor: String,
  room: String,
  lastRepairDate: Date,
  lastRepairNote: String,
  retiredDate: Date
}, {
  timestamps: true
});

export default mongoose.model('Asset', assetSchema);