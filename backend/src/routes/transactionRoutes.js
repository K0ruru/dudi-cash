import express from 'express';
import { 
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionStatus,
  getTransactionsByDateRange,
  getTransactionStats
} from '../controllers/transactionController.js';
import { createOrder } from '../controllers/orderController.js';

const router = express.Router();

router.get('/transactions', getTransactions);
router.get('/transactions/stats', getTransactionStats);
router.get('/transactions/date-range', getTransactionsByDateRange);
router.get('/transactions/:id', getTransactionById);
router.post('/transactions', createTransaction);
router.patch('/transactions/:id/status', updateTransactionStatus);
router.post('/transactions/order', createOrder);

export default router; 