import express from 'express';
import { 
  getVouchers,
  getVoucherByCode,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  validateVoucher
} from '../controllers/voucherController.js';

const router = express.Router();

router.post('/vouchers/validate', validateVoucher);

router.get('/vouchers', getVouchers);
router.get('/vouchers/:code', getVoucherByCode);
router.post('/vouchers', createVoucher);
router.put('/vouchers/:code', updateVoucher);
router.delete('/vouchers/:code', deleteVoucher);

export default router; 