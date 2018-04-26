module.exports = (knex, UserMessage) => {
  return (params) => {
    const fromId = params.fromId;
    const toId = params.toId;
    const message = params.message;

    return knex("user_messages")
      .insert({
        from_id: fromId,
        to_id: toId,
        message,
      })
      .then(() => {
        return knex("user_messages")
          .join(
            "users as userFrom",
            "user_messages.from_id",
            "=",
            "userFrom.id"
          )
          .join("users as userTo", "user_messages.to_id", "=", "userTo.id")
          .select(
            "user_messages.id",
            "userFrom.username as from",
            "message",
            "sent_at"
          )
          .where("userFrom.id", fromId);
      })
      .then((userMessages) => {
        return userMessages.map((message) => {
          return new UserMessage(message);
        });
      });
  };
};
