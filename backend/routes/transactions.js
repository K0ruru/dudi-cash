router.get('/transactions', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = knex('transactions')
      .select('*')
      .orderBy('created_at', 'desc');

    // Add date filtering if dates are provided
    if (startDate) {
      query = query.where('created_at', '>=', `${startDate} 00:00:00`);
      if (endDate) {
        query = query.where('created_at', '<=', `${endDate} 23:59:59`);
      } else {
        query = query.where('created_at', '<=', `${startDate} 23:59:59`);
      }
    }

    const transactions = await query;
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}); 