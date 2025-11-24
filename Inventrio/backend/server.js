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
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://your-vercel-app.vercel.app'
        : 'http://localhost:5173', // Adjust Vercel domain/Vite port
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/assets', assetRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/spare-parts', sparePartsRoutes);
app.use('/api/purchase-requests', purchaseRequestRoutes);

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// MongoDB (Modern options—no deprecations)
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('❌ MongoDB error:', err.message));
} else {
  console.warn('⚠️ No MONGODB_URI—running without DB');
}

// Global error handler (Logs details for 500s)
app.use((err, req, res, next) => {
  console.error('🔥 Error:', {
    message: err.message,
    url: req.url,
    method: req.method,
  });
  res.status(500).json({ error: err.message || 'Server error' });
});

// 404
app.use('*', (req, res) => res.status(404).json({ error: 'Not found' }));

// Export for Vercel
export default app;

// Local server (ONLY for dev—ignores in Vercel/prod)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server on http://localhost:${PORT}`);
  });
} else {
  console.log('🌐 Serverless mode (Vercel)');
}
