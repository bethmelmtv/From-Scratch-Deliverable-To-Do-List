const pool = require('../utils/pool');

module.exports = class User {
  id;
  first_name;
  last_name;
  email;
  #passwordHash;

  constructor(row) {
    this.id = row.id;
    this.first_name = row.first_name;
    //can i do snake case on both left and right?
    this.last_name = row.last_name;
    this.email = row.email;
    //right side is from SQL table 
    this.#passwordHash = row.password_hash;
  }

  static insert({ first_name, last_name,email, #passwordHash }) {
    const {rows} = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING * `, [first_name, last_name,email, #passwordHash]
    );

    return new User(rows[0]);

  }
};
