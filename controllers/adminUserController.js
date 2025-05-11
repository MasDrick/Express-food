const db = require('../config/db');
const bcrypt = require('bcryptjs'); // Убедитесь, что bcrypt импортирован

class AdminUserController {
  // Get all users with optional filtering
  // Simplified method to get all users without filters
  async getAllUsers(req, res) {
    try {
      const [users] = await db.query(`
        SELECT u.id, u.username, u.email, u.role, u.created_at,
               ui.phone, ui.card_number, ui.discount_percent, ui.orders_count, ui.profile_image
        FROM users u
        LEFT JOIN user_info ui ON u.id = ui.user_id
        ORDER BY u.created_at DESC
      `);
      
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Ошибка при получении пользователей' });
    }
  }
  
  // Get user by ID
  async getUserById(req, res) {
    try {
      const userId = req.params.id;
      
      const [users] = await db.query(`
        SELECT u.id, u.username, u.email, u.role, u.created_at,
               ui.phone, ui.card_number, ui.discount_percent, ui.orders_count, ui.profile_image
        FROM users u
        LEFT JOIN user_info ui ON u.id = ui.user_id
        WHERE u.id = ?
      `, [userId]);
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      
      // Get user's recent orders
      const [recentOrders] = await db.query(`
        SELECT o.id, o.total_amount, o.status, o.created_at, o.delivery_address
        FROM orders o
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
        LIMIT 5
      `, [userId]);
      
      res.json({
        ...users[0],
        recentOrders
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Ошибка при получении пользователя' });
    }
  }
  
  // Update user
  async updateUser(req, res) {
    try {
      const userId = req.params.id;
      const { username, email, phone, card_number, discount_percent, role } = req.body;
      
      // Check if user exists
      const [userCheck] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
      if (userCheck.length === 0) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      
      // Update user table
      if (username || email || role) {
        let updateFields = [];
        let updateParams = [];
        
        if (username) {
          updateFields.push('username = ?');
          updateParams.push(username);
        }
        
        if (email) {
          updateFields.push('email = ?');
          updateParams.push(email);
        }
        
        if (role) {
          updateFields.push('role = ?');
          updateParams.push(role);
        }
        
        if (updateFields.length > 0) {
          updateParams.push(userId);
          await db.query(`
            UPDATE users 
            SET ${updateFields.join(', ')} 
            WHERE id = ?
          `, updateParams);
        }
      }
      
      // Update user_info table
      if (phone !== undefined || card_number !== undefined || discount_percent !== undefined) {
        // Check if user_info record exists
        const [userInfoCheck] = await db.query(
          'SELECT user_id FROM user_info WHERE user_id = ?', 
          [userId]
        );
        
        if (userInfoCheck.length > 0) {
          // Update existing record
          let updateFields = [];
          let updateParams = [];
          
          if (phone !== undefined) {
            updateFields.push('phone = ?');
            updateParams.push(phone);
          }
          
          if (card_number !== undefined) {
            updateFields.push('card_number = ?');
            updateParams.push(card_number);
          }
          
          if (discount_percent !== undefined) {
            updateFields.push('discount_percent = ?');
            updateParams.push(discount_percent);
          }
          
          if (updateFields.length > 0) {
            updateParams.push(userId);
            await db.query(`
              UPDATE user_info 
              SET ${updateFields.join(', ')} 
              WHERE user_id = ?
            `, updateParams);
          }
        } else {
          // Create new record
          await db.query(`
            INSERT INTO user_info (user_id, phone, card_number, discount_percent)
            VALUES (?, ?, ?, ?)
          `, [userId, phone || null, card_number || null, discount_percent || 0]);
        }
      }
      
      // Get updated user data
      const [updatedUser] = await db.query(`
        SELECT u.id, u.username, u.email, u.role, u.created_at,
               ui.phone, ui.card_number, ui.discount_percent, ui.orders_count, ui.profile_image
        FROM users u
        LEFT JOIN user_info ui ON u.id = ui.user_id
        WHERE u.id = ?
      `, [userId]);
      
      res.json(updatedUser[0]);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Ошибка при обновлении пользователя' });
    }
  }
  
  // Delete user
  async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      
      // Check if user exists
      const [userCheck] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
      if (userCheck.length === 0) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      
      // Delete from user_info first (foreign key constraint)
      await db.query('DELETE FROM user_info WHERE user_id = ?', [userId]);
      
      // Delete from users
      await db.query('DELETE FROM users WHERE id = ?', [userId]);
      
      res.json({ message: 'Пользователь успешно удален' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Ошибка при удалении пользователя' });
    }
  }
  
  // Make user an admin
  async makeAdmin(req, res) {
    try {
      const userId = req.params.id;
      
      // Check if user exists
      const [userCheck] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
      if (userCheck.length === 0) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      
      // Update user role to admin
      await db.query('UPDATE users SET role = ? WHERE id = ?', ['admin', userId]);
      
      // Get updated user data
      const [updatedUser] = await db.query(`
        SELECT id, username, email, role, created_at
        FROM users
        WHERE id = ?
      `, [userId]);
      
      res.json({
        message: 'Пользователь успешно назначен администратором',
        user: updatedUser[0]
      });
    } catch (error) {
      console.error('Error making user admin:', error);
      res.status(500).json({ message: 'Ошибка при назначении пользователя администратором' });
    }
  }
  
  // Add new user (for admin)
  async addUser(req, res) {
    try {
      const { username, email, password, phone, confirmPassword } = req.body;
      
      // Validate required fields
      if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ 
          message: 'Все поля обязательны для заполнения',
          errors: [
            { path: 'username', msg: 'Имя пользователя обязательно' },
            { path: 'email', msg: 'Email обязателен' },
            { path: 'password', msg: 'Пароль обязателен' },
            { path: 'confirmPassword', msg: 'Подтверждение пароля обязательно' }
          ]
        });
      }
      
      // Check if passwords match
      if (password !== confirmPassword) {
        return res.status(400).json({ 
          message: 'Пароли не совпадают',
          errors: [
            { path: 'confirmPassword', msg: 'Пароли не совпадают' }
          ]
        });
      }
      
      // Check if user with this email already exists
      const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        return res.status(400).json({ 
          message: 'Пользователь с таким email уже существует',
          errors: [
            { path: 'email', msg: 'Email уже используется' }
          ]
        });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user
      const [result] = await db.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, 'user']
      );
      
      const userId = result.insertId;
      
      // Create user_info record with phone if provided
      await db.query(
        'INSERT INTO user_info (user_id, phone, discount_percent) VALUES (?, ?, ?)',
        [userId, phone || null, 0]
      );
      
      // Get created user
      const [newUser] = await db.query(`
        SELECT u.id, u.username, u.email, u.role, u.created_at,
               ui.phone, ui.discount_percent
        FROM users u
        LEFT JOIN user_info ui ON u.id = ui.user_id
        WHERE u.id = ?
      `, [userId]);
      
      res.status(201).json({
        message: 'Пользователь успешно создан',
        user: newUser[0]
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Ошибка при создании пользователя' });
    }
  }
}

module.exports = new AdminUserController();