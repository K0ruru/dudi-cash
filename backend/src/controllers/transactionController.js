import db from '../config/database.js';
import { formatToRupiah } from '../utils/formatters.js';

export const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = db('transactions')
      .select(
        'transactions.*',
        'vouchers.code as voucher_code',
        'vouchers.discount as voucher_discount'
      )
      .leftJoin('vouchers', 'transactions.voucher_code', 'vouchers.code');

    // Apply date filtering if dates are provided
    if (startDate && endDate) {
      query = query.whereBetween('transactions.created_at', [
        `${startDate} 00:00:00`,
        `${endDate} 23:59:59`
      ]);
    }

    query = query.orderBy('transactions.created_at', 'desc');

    const transactions = await query;

    // Get items for each transaction
    const transactionsWithItems = await Promise.all(
      transactions.map(async (transaction) => {
        const items = await db('transaction_items')
          .select(
            'transaction_items.*',
            'products.name',
            'products.image',
            'products.category'
          )
          .join('products', 'transaction_items.product_id', 'products.id')
          .where('transaction_id', transaction.id);

        return {
          ...transaction,
          items
        };
      })
    );

    res.json(transactionsWithItems);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const transaction = await db('transactions')
      .select(
        'transactions.*',
        'vouchers.code as voucher_code',
        'vouchers.discount as voucher_discount'
      )
      .leftJoin('vouchers', 'transactions.voucher_code', 'vouchers.code')
      .where('transactions.id', req.params.id)
      .first();

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const items = await db('transaction_items')
      .select(
        'transaction_items.*',
        'products.name',
        'products.category'
      )
      .join('products', 'transaction_items.product_id', 'products.id')
      .where('transaction_id', transaction.id);

    res.json({
      ...transaction,
      items
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTransaction = async (req, res) => {
  const { items, voucher_code } = req.body;
  
  try {
    const result = await db.transaction(async trx => {
      // Calculate subtotal
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Apply voucher if present
      let discount_amount = 0;
      if (voucher_code) {
        const voucher = await trx('vouchers')
          .where({ 
            code: voucher_code, 
            status: 'active' 
          })
          .first();
          
        if (voucher) {
          discount_amount = Math.round((subtotal * voucher.discount) / 100);
          await trx('vouchers')
            .where({ code: voucher_code })
            .increment('claimed_count', 1);
        }
      }
      
      const total = subtotal - discount_amount;
      
      // Create transaction
      const [transaction] = await trx('transactions')
        .insert({
          transaction_id: `TRX${Date.now()}`,
          subtotal,
          discount_amount,
          total,
          voucher_code,
          status: 'completed'
        })
        .returning('*');
        
      // Create transaction items
      await trx('transaction_items')
        .insert(items.map(item => ({
          transaction_id: transaction.id,
          product_id: item.id,
          quantity: item.quantity,
          price_at_time: item.price,
          subtotal: item.price * item.quantity
        })));
        
      // Update product stock
      for (const item of items) {
        await trx('products')
          .where({ id: item.id })
          .decrement('stock', item.quantity);
      }
      
      return transaction;
    });
    
    const completeTransaction = await getTransactionById(result.id);
    res.status(201).json(completeTransaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTransactionStatus = async (req, res) => {
  const { status } = req.body;
  
  try {
    const [transaction] = await db('transactions')
      .where({ id: req.params.id })
      .update({ status })
      .returning('*');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // If transaction is refunded/voided, restore product stock
    if (status === 'refunded' || status === 'voided') {
      const items = await db('transaction_items')
        .where({ transaction_id: transaction.id });

      for (const item of items) {
        await db('products')
          .where({ id: item.product_id })
          .increment('stock', item.quantity);
      }
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTransactionsByDateRange = async (req, res) => {
  const { start_date, end_date } = req.query;
  
  try {
    const transactions = await db('transactions')
      .select('*')
      .whereBetween('created_at', [start_date, end_date])
      .orderBy('created_at', 'desc');

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTransactionStats = async (req, res) => {
  try {
    const [stats] = await db.raw(`
      SELECT
        COUNT(*) as total_transactions,
        SUM(total) as total_revenue,
        SUM(discount_amount) as total_discounts,
        AVG(total) as average_transaction_value,
        COUNT(DISTINCT voucher_code) as vouchers_used
      FROM transactions
      WHERE status = 'completed'
    `);

    const [topProducts] = await db.raw(`
      SELECT
        p.name,
        p.category,
        SUM(ti.quantity) as total_quantity,
        SUM(ti.subtotal) as total_revenue
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.status = 'completed'
      GROUP BY p.id, p.name, p.category
      ORDER BY total_quantity DESC
      LIMIT 5
    `);

    res.json({
      stats: {
        ...stats,
        total_revenue: formatToRupiah(stats.total_revenue),
        total_discounts: formatToRupiah(stats.total_discounts),
        average_transaction_value: formatToRupiah(stats.average_transaction_value)
      },
      top_products: topProducts.map(product => ({
        ...product,
        total_revenue: formatToRupiah(product.total_revenue)
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 