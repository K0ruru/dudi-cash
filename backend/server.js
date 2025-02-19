import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './src/routes/productRoutes.js';
import voucherRoutes from './src/routes/voucherRoutes.js';
import transactionRoutes from './src/routes/transactionRoutes.js';
import fileUpload from 'express-fileupload';
import path from 'path';
import uploadRoutes from './src/routes/uploadRoutes.js';
import { fileURLToPath } from 'url';
import orderRoutes from './src/routes/orderRoutes.js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  abortOnLimit: true
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// API Routes
app.use('/api', productRoutes);
app.use('/api', voucherRoutes);
app.use('/api', transactionRoutes);
app.use('/api', uploadRoutes);
app.use('/api', orderRoutes);

const PORT = process.env.PORT || 7070;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 