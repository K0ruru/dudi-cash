export const up = function(knex) {
  return knex.raw(`
    CREATE TRIGGER trigger_update_popular_products
    AFTER INSERT ON transaction_items
    FOR EACH ROW
    BEGIN
      -- Update all products to not popular first
      UPDATE products SET popular = false;
      
      -- Update top 3 sold products to popular
      UPDATE products p
      JOIN (
        SELECT p.id
        FROM products p
        JOIN transaction_items ti ON p.id = ti.product_id
        JOIN transactions t ON ti.transaction_id = t.id
        WHERE t.status = 'completed'
        GROUP BY p.id
        ORDER BY SUM(ti.quantity) DESC
        LIMIT 3
      ) top_products ON p.id = top_products.id
      SET p.popular = true;
    END;
  `);
};

export const down = function(knex) {
  return knex.raw(`
    DROP TRIGGER IF EXISTS trigger_update_popular_products;
  `);
}; 