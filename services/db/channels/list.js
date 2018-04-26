module.exports = (knex, Channel) => {
  return () => {
    return knex
      .select("*")
      .from("channels")
      .then((channels) => {
        return channels.map((channel) => {
          return new Channel(channel);
        });
      });
  };
};
