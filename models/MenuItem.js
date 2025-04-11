const db = require('../config/db');

class MenuItem {
  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM menu_items WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(restaurantId, itemData) {
    const { name, price, weight } = itemData;
    const [result] = await db.query(
      'INSERT INTO menu_items (restaurant_id, name, price, weight) VALUES (?, ?, ?, ?)',
      [restaurantId, name, price, weight],
    );
    return result.insertId;
  }

  static async update(id, itemData) {
    const { name, price, weight } = itemData;
    await db.query('UPDATE menu_items SET name = ?, price = ?, weight = ? WHERE id = ?', [
      name,
      price,
      weight,
      id,
    ]);
  }

  static async delete(id) {
    await db.query('DELETE FROM menu_items WHERE id = ?', [id]);
  }
}

module.exports = MenuItem;
