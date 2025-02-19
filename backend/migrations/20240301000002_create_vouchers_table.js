export const up = function(knex) {
  return knex.schema.createTable('vouchers', table => {
    table.increments('id').primary();
    table.string('code').notNullable().unique();
    table.string('description').notNullable();
    table.integer('discount').notNullable();
    table.integer('claimed_count').defaultTo(0);
    table.integer('max_claims');
    table.date('expiry_date');
    table.enum('status', ['active', 'expired']).defaultTo('active');
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('vouchers');
}; 