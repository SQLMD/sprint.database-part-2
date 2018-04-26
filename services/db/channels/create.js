const Promise = require("bluebird");

const validateChannelName = (uName) =>
  typeof uName === "string" && uName.replace(" ", "").length > 3;

module.exports = (knex, Channel) => {
  return (params) => {
    const channelName = params.name;

    return Promise.try(() => {
      if (!validateChannelName(channelName))
        throw new Error(
          "Channel name must be provided, and be at least three characters"
        );
    })
      .then(() => knex("channels").insert({ name: channelName.toLowerCase() }))
      .then(() => {
        return knex("channels")
          .where({ name: channelName.toLowerCase() })
          .select();
      })
      .then((channels) => new Channel(channels.pop())) // create a user model out of the plain database response
      .catch((err) => {
        // sanitize known errors
        if (err.message.match("duplicate key value"))
          throw new Error("That channel already exists");

        // throw unknown errors
        throw err;
      });
  };
};
