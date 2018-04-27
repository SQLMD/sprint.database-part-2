const moment = require("moment");

class UserMessage {
  constructor(dbMessage) {
    this.id = dbMessage.id;
    this.fromUser = dbMessage.from;
    this.message = dbMessage.message;
    this.sentAt = new Date(dbMessage.sent_at);
  }

  serialize() {
    return {
      id: this.id,
      fromUser: this.fromUser,
      message: this.message,
      sentAt: moment(this.sentAt).fromNow(),
    };
  }
}

module.exports = (knex) => {
  return {
    create: require("./create")(knex, UserMessage),
    list: require("./list")(knex, UserMessage),
  };
};
