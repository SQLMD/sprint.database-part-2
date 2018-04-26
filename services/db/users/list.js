module.exports = (knex, User) => {
  return () => {
    return knex
      .select("*")
      .from("users")
      .then((users) => {
        return users.map((user) => {
          return new User(user);
        });
      });
  };
};
