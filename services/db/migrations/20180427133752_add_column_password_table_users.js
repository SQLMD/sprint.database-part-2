exports.up = function(knex, Promise) {
  return knex.schema.table("users", (table) => {
    table.text("password").notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table("users", (table) => {
    table.dropColumn("password");
  });
};
