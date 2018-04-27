const moment = require("moment");

class User {
  constructor(dbUser) {
    this.id = dbUser.id;
    this.username = dbUser.username;
    this.createdAt = new Date(dbUser.created_at);
    this.password = dbUser.password;
  }

  serialize() {
    return {
      id: this.id,
      username: this.username,
      createdAt: moment(this.createdAt).format("hh:mm:ss"),
    };
  }

  authenticate(password) {
    return this.password === password;
  }
}

module.exports = (knex) => {
  return {
    create: require("./create")(knex, User),
    list: require("./list")(knex, User),
    get: require("./get")(knex, User),
  };
};
