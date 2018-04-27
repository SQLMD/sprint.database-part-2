const moment = require("moment");
const bcrypt = require("bcrypt");

class User {
  constructor(dbUser) {
    this.id = dbUser.id;
    this.username = dbUser.username;
    this.createdAt = new Date(dbUser.created_at);
    this.hash = dbUser.password;
  }

  serialize() {
    return {
      id: this.id,
      username: this.username,
      createdAt: moment(this.createdAt).format("hh:mm:ss"),
    };
  }

  authenticate(password) {
    return bcrypt.compare(password, this.hash);
  }
}

module.exports = (knex) => {
  return {
    create: require("./create")(knex, User),
    list: require("./list")(knex, User),
    get: require("./get")(knex, User),
  };
};
