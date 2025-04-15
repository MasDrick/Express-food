const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create({ username, email, password }) {
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password],
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return users[0];
  }

  static async findByUsername(username) {
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return users[0];
  }

  static async findById(id) {
    const [users] = await db.query('SELECT id, username, email, role FROM users WHERE id = ?', [
      id,
    ]);
    return users[0];
  }

  // New method to get user info
  static async getUserInfo(userId) {
    const [rows] = await db.query(
      `SELECT u.id, u.username, u.email, u.role, u.created_at,
              ui.phone, ui.card_number, ui.discount_percent, ui.orders_count, ui.profile_image
       FROM users u
       LEFT JOIN user_info ui ON u.id = ui.user_id
       WHERE u.id = ?`,
      [userId]
    );
    return rows[0];
  }

  // New method to update user info
  static async updateUserInfo(userId, userInfo) {
    const { phone, card_number, discount_percent, profile_image } = userInfo;
    
    // Check if user_info record exists
    const [existingInfo] = await db.query(
      'SELECT * FROM user_info WHERE user_id = ?',
      [userId]
    );
    
    if (existingInfo.length > 0) {
      // Update existing record
      await db.query(
        `UPDATE user_info 
         SET phone = ?, card_number = ?, discount_percent = ?, profile_image = ?
         WHERE user_id = ?`,
        [phone, card_number, discount_percent, profile_image, userId]
      );
    } else {
      // Create new record
      await db.query(
        `INSERT INTO user_info (user_id, phone, card_number, discount_percent, profile_image)
         SELECT id, ?, ?, ?, ? FROM users WHERE id = ?`,
        [phone, card_number, discount_percent, profile_image, userId]
      );
    }
    
    return this.getUserInfo(userId);
  }

  // New method to increment order count
  static async incrementOrderCount(userId) {
    await db.query(
      `UPDATE user_info 
       SET orders_count = orders_count + 1
       WHERE user_id = ?`,
      [userId]
    );
  }
}

module.exports = User;
