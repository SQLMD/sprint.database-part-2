exports.up = function(knex, Promise) {
  return knex.schema.createTable("user_messages", (table) => {
    table.increments().index();

    table.integer("from_id").notNullable();

    table.integer("to_id").notNullable();

    table.text("message").notNullable();

    table
      .timestamp("sent_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index(["from_id", "to_id"], "index_from_to");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("user_messages");
};
