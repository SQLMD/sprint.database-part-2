exports.up = function(knex, Promise) {
  return knex.schema.createTable("channel_messages", (table) => {
    table.increments().index();

    table.integer("channel_id").notNullable();

    table.integer("from_id").notNullable();

    table.text("message").notNullable();

    table
      .timestamp("sent_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index(["channel_id", "from_id"], "index_channel_from");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("channel_messages");
};
