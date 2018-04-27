const moment = require("moment");

class ChannelMessage {
  constructor(dbChannelMessage) {
    this.id = dbChannelMessage.id;
    this.fromUser = dbChannelMessage.from;
    this.toChannel = dbChannelMessage.to;
    this.message = dbChannelMessage.message;
    this.sentAt = new Date(dbChannelMessage.sent_at);
  }

  serialize() {
    return {
      id: this.id,
      fromUser: this.fromUser,
      toChannel: this.toChannel,
      message: this.message,
      sentAt: moment(this.sentAt).fromNow(),
    };
  }
}

module.exports = (knex) => ({
  create: require("./create")(knex, ChannelMessage),
  list: require("./list")(knex, ChannelMessage),
});
