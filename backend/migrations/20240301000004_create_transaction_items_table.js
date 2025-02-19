export const up = function(knex) {
  return knex.schema.createTable('transaction_items', table => {
    table.increments('id').primary();
    table.integer('transaction_id').unsigned().references('id').inTable('transactions').onDelete('CASCADE');
    table.integer('product_id').unsigned().references('id').inTable('products');
    table.integer('quantity').notNullable();
    table.decimal('price_at_time', 10, 2).notNullable();
    table.decimal('subtotal', 10, 2).notNullable();
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('transaction_items');
}; 