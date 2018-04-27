module.exports = (knex, UserMessage) => {
  return (params) => {
    const fromId = Number(params.fromId);
    const toId = Number(params.toId);

    return knex("user_messages")
      .join("users as fromUser", "fromUser.id", "=", "user_messages.from_id")
      .join("users as toUser", "toUser.id", "=", "user_messages.to_id")
      .select(
        "fromUser.username as from",
        "user_messages.message",
        "user_messages.id",
        "user_messages.sent_at"
      )
      .where({
        "user_messages.from_id": fromId,
        "user_messages.to_id": toId,
      })
      .orWhere({
        "user_messages.from_id": toId,
        "user_messages.to_id": fromId,
      })
      .orderBy("sent_at")
      .then((userMessages) => {
        return userMessages.map((message) => {
          return new UserMessage(message);
        });
      });
  };
};
