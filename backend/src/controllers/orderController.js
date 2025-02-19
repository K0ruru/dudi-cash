import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const createOrder = async (req, res) => {
  const { items, totalAmount, discountAmount = 0, voucherCode = null, totalPaid } = req.body;

  try {
    // Start a transaction
    const trx = await db.transaction();

    try {
      // Calculate subtotal
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Create the transaction
      const [transactionId] = await trx('transactions').insert({
        transaction_id: uuidv4(),
        subtotal: subtotal,
        discount_amount: discountAmount,
        voucher_id: null, // Will be updated if voucher exists
        voucher_code: voucherCode,
        total: totalAmount,
        total_paid: totalPaid,
        status: 'completed',
        created_at: new Date(),
        updated_at: new Date()
      });

      // Create transaction items
      await Promise.all(items.map(item => 
        trx('transaction_items').insert({
          transaction_id: transactionId,
          product_id: item.id,
          quantity: item.quantity,
          price_at_time: item.price,
          subtotal: item.price * item.quantity,
          created_at: new Date(),
          updated_at: new Date()
        })
      ));

      // If voucher was used, handle voucher updates
      if (voucherCode) {
        const voucher = await trx('vouchers')
          .where('code', voucherCode)
          .first();

        if (voucher) {
          // Update transaction with voucher_id
          await trx('transactions')
            .where('id', transactionId)
            .update({ voucher_id: voucher.id });

          // Update voucher claimed count
          await trx('vouchers')
            .where('code', voucherCode)
            .increment('claimed_count', 1)
            .update({ updated_at: new Date() });

          // Check if max claims reached
          const updatedVoucher = await trx('vouchers')
            .where('code', voucherCode)
            .first();

          if (updatedVoucher.max_claims && 
              updatedVoucher.claimed_count >= updatedVoucher.max_claims) {
            await trx('vouchers')
              .where('code', voucherCode)
              .update({
                status: 'expired',
                updated_at: new Date()
              });
          }
        }
      }

      // Commit the transaction
      await trx.commit();

      // Get the complete transaction with items
      const transaction = await db('transactions')
        .where('transactions.id', transactionId)
        .first();

      const transactionItems = await db('transaction_items')
        .where('transaction_id', transactionId)
        .join('products', 'transaction_items.product_id', 'products.id')
        .select(
          'transaction_items.*',
          'products.name',
          'products.image',
          'products.description'
        );

      res.status(201).json({
        ...transaction,
        items: transactionItems
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: error.message });
  }
}; 