const pool = require('../utils/pool');

module.exports = class Item {
  id;
  user_id;
  description;
  completed;

  constructor(row) {
    this.id = row.id;
    this.user_id = row.user_id;
    this.description = row.description;
    this.completed = row.completed;
  }

  static async insert({ user_id, description, completed }) {
    const { rows } = await pool.query(
      `INSERT INTO list (user_id, description, completed)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [user_id, description, completed]
    );
    return new Item(rows[0]);
  }

  static async getAll(user_id) {
    const { rows } = await pool.query('SELECT * from list WHERE user_id = $1', [
      user_id,
    ]);
    return rows.map((item) => new Item(item));
  }

  static async getItemById(id) {
    const { rows } = await pool.query('SELECT * from list WHERE id = $1', [id]);
    return new Item(rows[0]);
  }

  static async updateById(id, attrs) {
    const item = await Item.getItemById(id);
    console.log(item, 'ITEM');
    if (!item) return null;
    const { description, completed } = { ...item, ...attrs };
    const { rows } = await pool.query(
      `UPDATE list
    SET description = $2, completed =$3 WHERE id = $1 RETURNING *`,
      [id, description, completed]
    );
    return new Item(rows[0]);
  }

  static async deleteById(id) {
    const { rows } = await pool.query(
      'DELETE from list WHERE id = $1 RETURNING *',
      [id]
    );
    return new Item(rows[0]);
  }
};
