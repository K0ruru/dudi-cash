import db from '../config/database.js';

export const getVouchers = async (req, res) => {
  try {
    const vouchers = await db('vouchers').select('*');
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVoucherByCode = async (req, res) => {
  try {
    const voucher = await db('vouchers')
      .where({ code: req.params.code })
      .first();
    
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }
    
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createVoucher = async (req, res) => {
  try {
    const [id] = await db('vouchers').insert(req.body);
    const voucher = await db('vouchers').where('id', id).first();
    res.status(201).json(voucher);
  } catch (error) {
    console.error('Create voucher error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateVoucher = async (req, res) => {
  try {
    await db('vouchers')
      .where('code', req.params.code)
      .update(req.body);
    
    const voucher = await db('vouchers')
      .where('code', req.params.code)
      .first();
      
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteVoucher = async (req, res) => {
  try {
    await db('vouchers').where('code', req.params.code).del();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const validateVoucher = async (req, res) => {
  const { code } = req.body;

  try {
    const voucher = await db('vouchers')
      .where('code', code)
      .where('status', 'active')
      .first();

    if (!voucher) {
      return res.status(404).json({ 
        valid: false,
        message: 'Voucher not found or expired'
      });
    }

    if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) {
      await db('vouchers')
        .where('code', code)
        .update({ status: 'expired' });
        
      return res.status(400).json({
        valid: false,
        message: 'Voucher has expired'
      });
    }

    if (voucher.max_claims && voucher.claimed_count >= voucher.max_claims) {
      return res.status(400).json({
        valid: false,
        message: 'Voucher has reached maximum claims'
      });
    }

    res.json({
      valid: true,
      discount_percentage: voucher.discount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 