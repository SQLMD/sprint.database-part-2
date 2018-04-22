const express = require("express");

const router = express.Router();

const userRouter = require("./user");
const channelRouter = require("./channel");

module.exports = (services) => {
  router.use("/users", userRouter(services));
  router.use("/channels", channelRouter(services));

  return router;
};
