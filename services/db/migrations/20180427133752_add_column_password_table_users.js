exports.up = function(knex, Promise) {
  return knex.schema.table("users", (table) => {
    table.string("password", 20).notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table("users", (table) => {
    table.dropColumn("password");
  });
};
