/* eslint-disable no-console */
const { expect } = require("chai");
const config = require("../config");
const knex = require("knex")(config.db);
const db = require("../services/db")(config.db);
const Promise = require("bluebird");

const forcePromiseReject = () => {
  throw new Error("This promise should have failed, but did not.");
};
after(() => {
  return knex
    .raw("ALTER SEQUENCE users_id_seq RESTART WITH 1;")
    .then(() => knex.raw("ALTER SEQUENCE channels_id_seq RESTART WITH 1;"))
    .then(() => knex.raw("ALTER SEQUENCE user_messages_id_seq RESTART WITH 1;"))
    .then(() =>
      knex.raw("ALTER SEQUENCE channel_messages_id_seq RESTART WITH 1;")
    );
});

describe("users", () => {
  describe("setup", () => {
    it("has run the initial migrations", () =>
      knex("users")
        .select()
        .catch((e) => console.log(e)));
  });

  describe("#create", () => {
    let params = { username: "", password: "" };

    context("when bad params are given", () => {
      before(() => {
        params = { username: " " };
      });

      it("politely refuses", () =>
        db.users
          .create(params)
          .then(forcePromiseReject)
          .catch((err) =>
            expect(err.message).to.equal(
              "Username must be provided, and be at least two characters"
            )
          ));
    });

    context("when good params are given", () => {
      before(() => {
        params.username = "rp-3";
        params.password = "1234";
      });

      afterEach(() => knex("users").del()); // delete all users after each spec

      it("creates a user", () =>
        db.users.create(params).then((user) => {
          expect(user).to.include({ username: params.username });
          expect(user.id).to.be.a("number");
        }));

      context("when a duplicate username is provided", () => {
        beforeEach(() => db.users.create(params));

        it("generates a sanitized error message", () =>
          db.users
            .create(params)
            .then(forcePromiseReject)
            .catch((err) =>
              expect(err.message).to.equal("That username already exists")
            ));
      });
    });
  });

  describe("#list", () => {
    const usernames = ["rp-3", "muddybarefeet"];
    const passwords = ["password", "1234"];
    const users = usernames.map((username, index) => ({
      username,
      password: passwords[index],
    }));

    before(() => Promise.all(users.map(db.users.create)));
    after(() => knex("users").del());

    it("lists all users", () =>
      db.users.list().then((resp) => {
        expect(usernames).to.include(resp[0].username);
        expect(usernames).to.include(resp[1].username);
      }));

    it("returns serializable objects", () =>
      db.users.list().then((resp) => {
        expect(resp[0].serialize).to.be.a("function");
        expect(resp[0].serialize().id).to.be.a("number");
        expect(resp[0].serialize().username).to.be.a("string");
      }));
  });

  describe("User.authenticate", () => {
    it("authenticates users correctly", () => {
      const testUser = { username: "alex", password: "ilovesql" };
      db.users.create(testUser).then((user) => {
        expect(user.authenticate).to.be.a("function");
        user.authenticate(testUser.password).then((isAuthenticated) => {
          expect(isAuthenticated).to.be.true;
        });
        user.authenticate("ihatesql").then((isAuthenticated) => {
          expect(isAuthenticated).to.be.false;
        });
      });
      knex("users").del();
    });
  });
});

describe("channels", () => {
  describe("#create", () => {
    const params = { name: "" };

    before(() => {
      params.name = "general";
    });

    afterEach(() => knex("channels").del());

    it("creates a channel", () =>
      db.channels.create(params).then((channel) => {
        expect(channel).to.include({ name: params.name });
        expect(channel.id).to.be.a("number");
      }));

    context("when the name is upper cased", () => {
      it("forces the name to lower case", () =>
        db.channels.create({ name: "BIG CHANNEL" }).then((channel) => {
          expect(channel.name).to.equal("big channel");
        }));
    });

    context("when a duplicate name is provided", () => {
      beforeEach(() => db.channels.create(params));

      it("generates a sanitized error message", () =>
        db.channels
          .create(params)
          .then(forcePromiseReject)
          .catch((err) =>
            expect(err.message).to.equal("That channel already exists")
          ));
    });
  });

  describe("#list", () => {
    const channelNames = ["general", "random"];
    const channels = channelNames.map((name) => ({ name }));
    before(() => Promise.all(channels.map(db.channels.create)));
    after(() => knex("channels").del());

    it("lists all channels", () =>
      db.channels.list().then((resp) => {
        expect(channelNames).to.include(resp[0].name);
        expect(channelNames).to.include(resp[1].name);
      }));

    it("returns serializable objects", () =>
      db.channels.list().then((resp) => {
        expect(resp[0].serialize).to.be.a("function");
        expect(resp[0].serialize().id).to.be.a("number");
        expect(resp[0].serialize().name).to.be.a("string");
      }));
  });
});

describe("channel_messages", () => {
  let fromId;
  let channelId;
  let otherChannelId;
  const message = "Hola!";

  before(() =>
    db.users
      .create({ username: "rp-3", password: "1234" })
      .then((user) => {
        fromId = user.id;
        return db.channels.create({ name: "general" });
      })
      .then((channel) => {
        channelId = channel.id;
        return db.channels.create({ name: "random" });
      })
      .then((channel) => {
        otherChannelId = channel.id;
        knex("channel_messages").del();
      })
  );

  after(() =>
    knex("channel_messages")
      .del()
      .then(() => knex("users").del())
      .then(() => knex("channels").del())
  );

  describe("#create", () => {
    after(() => knex("channel_messages").del());

    it("creates a message", () =>
      db.channelMessages
        .create({ fromId, channelId, message })
        .then((messages) => {
          expect(messages[0]).to.include({
            fromUser: "rp-3",
            toChannel: "general",
            message,
          });
          expect(messages[0].id).to.be.a("number");
          expect(messages[0].sentAt).to.be.a("Date");
        }));
  });

  describe("#list", () => {
    before(() =>
      knex("channel_messages")
        .insert([
          { from_id: fromId, channel_id: channelId, message },
          { from_id: fromId, channel_id: otherChannelId, message },
        ])
        .then(() => Promise.delay(500))
        .then(() =>
          knex("channel_messages").insert({
            from_id: fromId,
            channel_id: channelId,
            message: "booya!",
          })
        )
    );

    after(() => knex("channel_messages").del());

    it("lists the right number of messages", () =>
      db.channelMessages
        .list({ channelId })
        .then((messages) => expect(messages.length).to.equal(2)));

    it("lists the right messages", () =>
      db.channelMessages.list({ channelId }).then((messages) => {
        expect(messages[0]).to.include({
          fromUser: "rp-3",
          toChannel: "general",
          message,
        });
        expect(messages[0].id).to.be.a("number");
      }));

    it("lists message in the right order", () =>
      db.channelMessages.list({ channelId }).then((messages) => {
        expect(messages[0].message).to.equal(message);
        expect(messages[1].message).to.equal("booya!");
      }));
  });
});

describe("user_messages", () => {
  let fromId;
  let toId;
  let otherToId;
  const message = "Hola!";

  before(() =>
    db.users
      .create({ username: "rp-3", password: "password" })
      .then((user) => {
        fromId = user.id;
        return db.users.create({ username: "muddybarefeet", password: "test" });
      })
      .then((user) => {
        toId = user.id;
        return db.users.create({ username: "yanarchy", password: "0987" });
      })
      .then((user) => {
        otherToId = user.id;
        knex("user_messages").del();
      })
  );

  after(() =>
    knex("user_messages")
      .del()
      .then(() => knex("users").del())
  );

  describe("#create", () => {
    after(() => knex("user_messages").del());

    it("creates a message", () =>
      db.userMessages.create({ fromId, toId, message }).then((messages) => {
        expect(messages[0]).to.include({ fromUser: "rp-3", message });
        expect(messages[0].id).to.be.a("number");
        expect(messages[0].sentAt).to.be.a("Date");
      }));
  });

  describe("#list", () => {
    before(() =>
      knex("user_messages")
        .insert([
          { from_id: fromId, to_id: toId, message },
          { from_id: fromId, to_id: otherToId, message },
        ])
        .then(() => Promise.delay(500))
        .then(() =>
          knex("user_messages").insert({
            from_id: toId,
            to_id: fromId,
            message: "booya!",
          })
        )
    );

    after(() => knex("user_messages").del());

    it("lists the right number of messages", () =>
      db.userMessages
        .list({ fromId, toId })
        .then((messages) => expect(messages.length).to.equal(2)));

    it("lists the right messages", () =>
      db.userMessages.list({ fromId, toId }).then((messages) => {
        expect(messages[0]).to.include({ fromUser: "rp-3", message });
        expect(messages[0].id).to.be.a("number");
        expect(messages[1]).to.include({
          fromUser: "muddybarefeet",
          message: "booya!",
        });
        expect(messages[1].id).to.be.a("number");
      }));

    it("lists message in the right order", () =>
      db.userMessages.list({ fromId, toId }).then((messages) => {
        expect(messages[0].message).to.equal(message);
        expect(messages[1].message).to.equal("booya!");
      }));
  });
});
