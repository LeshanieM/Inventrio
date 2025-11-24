import mongoose from 'mongoose';

const purchaseRequestSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    partNameOrId: {
      type: String,
      required: true,
    },
    requiredQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
    },
    preferredVendor: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('PurchaseRequest', purchaseRequestSchema);
