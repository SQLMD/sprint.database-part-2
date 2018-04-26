module.exports = (knex, ChannelMessage) => {
  return (params) => {
    const fromId = params.fromId;
    const channelId = params.channelId;
    const message = params.message;

    return knex("channel_messages")
      .insert({
        from_id: fromId,
        channel_id: channelId,
        message,
      })
      .then(() => {
        return knex("channel_messages")
          .join("channels", "channel_messages.channel_id", "=", "channels.id")
          .join("users", "channel_messages.from_id", "=", "users.id")
          .select(
            "channels.name as to",
            "users.username as from",
            "channel_messages.id",
            "message",
            "sent_at"
          )
          .where("channels.id", channelId);
      })
      .then((channelMessages) => {
        return channelMessages.map((message) => {
          return new ChannelMessage(message);
        });
      });
  };
};
