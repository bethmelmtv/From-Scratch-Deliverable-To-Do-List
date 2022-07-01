const pool = require('../utils/pool');

module.exports = class Item {
  id;
  description;
  completed;

  constructor(row) {
    this.id = row.id;
    this.user_id = row.user_id;
    this.description = row.description;
    this.completed = row.completed;
  }

  static async insert({ description, user_id }) {
    const { rows } = await pool.query(
      `INSERT INTO items (description, user_id)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [description, user_id]
    );
    return new Item(rows[0]);
  }
};
