export const up = function(knex) {
  return knex.schema.createTable('transactions', table => {
    table.increments('id').primary();
    table.string('transaction_id').notNullable().unique();
    table.decimal('subtotal', 10, 2).notNullable();
    table.decimal('discount_amount', 10, 2).defaultTo(0);
    table.integer('voucher_id').unsigned().references('id').inTable('vouchers');
    table.string('voucher_code');
    table.decimal('total', 10, 2).notNullable();
    table.decimal('total_paid', 10, 2).notNullable();
    table.enum('status', ['completed', 'refunded', 'voided']).defaultTo('completed');
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('transactions');
}; 