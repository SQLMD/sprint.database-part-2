exports.up = function(knex, Promise) {
  return knex.schema.createTable("channels", (table) => {
    table.increments().index();

    table
      .text("name")
      .unique()
      .notNullable()
      .index();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("channels");
};
