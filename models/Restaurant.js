const db = require('../config/db');

class Restaurant {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM restaurants');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM restaurants WHERE id = ?', [id]);
    return rows[0];
  }

  static async getMenu(restaurantId) {
    const [rows] = await db.query('SELECT * FROM menu_items WHERE restaurant_id = ?', [
      restaurantId,
    ]);
    return rows;
  }

  static async getByCuisine(cuisine) {
    const [rows] = await db.query('SELECT * FROM restaurants WHERE cuisine LIKE ?', [
      `%${cuisine}%`,
    ]);
    return rows;
  }
}

module.exports = Restaurant;
