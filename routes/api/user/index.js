const express = require("express");

const router = express.Router();

module.exports = (services) => {
  router.post("/", (req, res) =>
    services.db.users
      .create({ username: req.body.username })
      .then((user) => res.status(201).json(user.serialize()))
      .catch((err) => {
        if (err.message === "That username already exists") {
          return services.db.users
            .get({ username: req.body.username })
            .then((user) => res.status(200).json(user.serialize()));
        }

        return res.status(400).send(err.message);
      })
  );

  router.get("/", (req, res) =>
    services.db.users
      .list()
      .then((users) => users.map((user) => user.serialize()))
      .then((users) => res.status(200).json(users))
      .catch((err) => res.status(400).send(err.message))
  );

  router.get("/:id/messages", (req, res) =>
    services.db.userMessages
      .list({ toId: req.params.id, fromId: req.query.fromId })
      .then((messages) => messages.map((msg) => msg.serialize()))
      .then((messages) => res.status(200).json(messages))
      .catch((err) => res.status(400).send(err.message))
  );

  router.post("/:id/messages", (req, res) =>
    services.db.userMessages
      .create({
        toId: req.params.id,
        fromId: req.body.fromId,
        message: req.body.message,
      })
      .then((messages) => messages.map((msg) => msg.serialize()))
      .then((messages) => res.status(200).json(messages))
      .catch((err) => res.status(400).send(err.message))
  );

  return router;
};
