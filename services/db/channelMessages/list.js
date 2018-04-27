module.exports = (knex, ChannelMessage) => {
  return (params) => {
    const channelId = params.channelId;

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
      .where("channels.id", channelId)
      .orderBy("sent_at")
      .then((channelMessages) => {
        return channelMessages.map((message) => {
          return new ChannelMessage(message);
        });
      });
  };
};
