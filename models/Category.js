const db = require('../config/db');

class Category {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM categories');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
  }

  static async getRestaurantsByCategory(categoryId) {
    const [rows] = await db.query(
      `SELECT r.* FROM restaurants r
       JOIN restaurant_categories rc ON r.id = rc.restaurant_id
       WHERE rc.category_id = ?`,
      [categoryId]
    );
    return rows;
  }
}

module.exports = Category;