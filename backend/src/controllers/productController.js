import db from '../config/database.js';

export const getProducts = async (req, res) => {
  try {
    const products = await db('products')
      .select(
        'id',
        'name',
        'sku',
        'price',
        'image',
        'category',
        'supplier',
        'popular',
        'description',
        'stock'
      );
    
    // Transform the response to ensure popular is boolean
    const transformedProducts = products.map(product => ({
      ...product,
      popular: product.popular === 1 // Convert MySQL tinyint(1) to boolean
    }));

    res.json(transformedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await db('products').where('id', req.params.id).first();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const [id] = await db('products').insert(req.body);
    const product = await db('products').where('id', id).first();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    await db('products').where('id', req.params.id).update(req.body);
    const product = await db('products').where('id', req.params.id).first();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await db('products').where('id', req.params.id).del();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProductStock = async (req, res) => {
  try {
    await db('products')
      .where('id', req.params.id)
      .update({ stock: req.body.stock });
    const product = await db('products').where('id', req.params.id).first();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStock = async (req, res) => {
  const { id } = req.params;
  const { adjustment } = req.body;

  console.log('Stock update request:', { id, adjustment }); // Debug log

  if (adjustment === undefined || adjustment === null) {
    return res.status(400).json({ error: 'Stock adjustment value is required' });
  }

  // Ensure adjustment is a number
  const adjustmentValue = parseInt(adjustment);
  if (isNaN(adjustmentValue)) {
    return res.status(400).json({ error: 'Stock adjustment must be a number' });
  }

  try {
    const product = await db('products').where('id', id).first();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('Current product:', product); // Debug log

    const newStock = product.stock + adjustmentValue;
    if (newStock < 0) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    console.log('Updating stock to:', newStock); // Debug log

    const updateResult = await db('products')
      .where('id', id)
      .update('stock', newStock);

    console.log('Update result:', updateResult); // Debug log

    if (!updateResult) {
      throw new Error('Failed to update stock');
    }

    const updatedProduct = await db('products').where('id', id).first();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Stock update error:', error);
    res.status(500).json({ error: error.message });
  }
}; 