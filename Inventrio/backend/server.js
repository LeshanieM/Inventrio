import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import assetRoutes from './routes/assets.js';
import maintenanceRoutes from './routes/maintenance.js';
import sparePartsRoutes from './routes/spareParts.js'; 
import purchaseRequestRoutes from './routes/purchaseRequests.js'; 
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/assets', assetRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/spare-parts', sparePartsRoutes); 
app.use('/api/purchase-requests', purchaseRequestRoutes); 
// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully');
  console.log('Database: asset-management');
})
.catch(err => {
  console.log('MongoDB connection error:', err);
  console.log('Please make sure MongoDB is running on your system');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});