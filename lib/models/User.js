const pool = require('../utils/pool');

module.exports = class User {
  id;
  first_name;
  last_name;
  email;
  #passwordHash;

  constructor(row) {
    this.id = row.id;
    this.first_name = row.firstName;
    this.last_name = row.lastName;
    this.email = row.email;
    this.#passwordHash = row.password_hash;
  }

  static async insert({ firstName, last_name, email, passwordHash }) {
    const { rows } = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING * `,
      [firstName, last_name, email, passwordHash]
    );

    return new User(rows[0]);
  }

  get passwordHash() {
    return this.#passwordHash;
  }
};
