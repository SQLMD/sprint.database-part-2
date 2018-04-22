const express = require("express");

const router = express.Router();

module.exports = (services) => {
  router.post("", (req, res) =>
    services.db.channels
      .create({ name: req.body.name })
      .then((channels) => res.status(201).json(channels.serialize()))
      .catch((err) => res.status(400).send(err.message))
  );

  router.get("", (req, res) =>
    services.db.channels
      .list()
      .then((channels) => channels.map((channel) => channel.serialize()))
      .then((channels) => res.status(200).json(channels))
      .catch((err) => res.status(400).send(err.message))
  );

  router.get("/:id", (req, res) =>
    services.db.channelMessages
      .list({ channelId: req.params.id })
      .then((messages) => messages.map((msg) => msg.serialize()))
      .then((messages) => res.status(200).json(messages))
      .catch((err) => res.status(400).send(err.message))
  );

  router.post("/:id/messages", (req, res) =>
    services.db.channelMessages
      .create({
        channelId: req.params.id,
        fromId: req.body.fromId,
        message: req.body.message,
      })
      .then((messages) => messages.map((msg) => msg.serialize()))
      .then((messages) => res.status(200).json(messages))
      .catch((err) => res.status(400).send(err.message))
  );

  return router;
};
