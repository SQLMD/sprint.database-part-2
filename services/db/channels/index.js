const moment = require("moment");

class Channel {
  constructor(dbChannel) {
    this.id = dbChannel.id;
    this.name = dbChannel.name;
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
    };
  }
}

module.exports = (knex) => {
  return {
    create: require("./create")(knex, Channel),
    list: require("./list")(knex, Channel),
  };
};
