import mongoose from 'mongoose';

const sparePartSchema = new mongoose.Schema({
  partNumber: {
    type: String,
    required: true,
    unique: true
  },
  partName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  unit: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  minimumStock: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  vendor: {
    type: String,
    required: true
  },
  acquisitionDate: Date,
  lastReorderDate: Date,
  lastReorderNote: String
}, {
  timestamps: true
});

export default mongoose.model('SparePart', sparePartSchema);