export const up = function(knex) {
    return knex.schema.createTable('products', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('sku').notNullable().unique();
      table.decimal('price', 10, 2).notNullable();
      table.string('image').notNullable();
      table.string('category').notNullable();
      table.string('supplier').notNullable();
      table.boolean('popular').notNullable().defaultTo(false);
      table.text('description');
      table.integer('stock').defaultTo(0);
      table.timestamps(true, true);
    });
  };
  
  export const down = function(knex) {
    return knex.schema.dropTable('products');
  };