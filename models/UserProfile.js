const db = require('../config/db');

class UserProfile {
  // Get user profile by user ID
  static async getByUserId(userId) {
    try {
      // Get basic user info
      const [users] = await db.query(
        'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        return null;
      }
      
      const user = users[0];
      
      // Get user profile info
      const [profiles] = await db.query(
        'SELECT phone, card_number, discount_percent, registration_date, orders_count, profile_image FROM user_info WHERE user_id = ?',
        [userId]
      );
      
      // Combine all data
      return {
        ...user,
        profile: profiles.length > 0 ? profiles[0] : null
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
  
  // Update user profile
  static async updateProfile(userId, profileData) {
    try {
      const { phone, card_number, profile_image } = profileData;
      
      // Check if profile exists
      const [existingProfiles] = await db.query(
        'SELECT id FROM user_info WHERE user_id = ?',
        [userId]
      );
      
      if (existingProfiles.length > 0) {
        // Update existing profile
        let query = 'UPDATE user_info SET ';
        const queryParams = [];
        const updateFields = [];
        
        if (phone !== undefined) {
          updateFields.push('phone = ?');
          queryParams.push(phone);
        }
        
        if (card_number !== undefined) {
          updateFields.push('card_number = ?');
          queryParams.push(card_number);
        }
        
        if (profile_image !== undefined) {
          updateFields.push('profile_image = ?');
          queryParams.push(profile_image);
        }
        
        if (updateFields.length === 0) {
          return await this.getByUserId(userId);
        }
        
        query += updateFields.join(', ') + ' WHERE user_id = ?';
        queryParams.push(userId);
        
        await db.query(query, queryParams);
      } else {
        // Create new profile (should not happen due to trigger, but just in case)
        await db.query(
          'INSERT INTO user_info (user_id, email, phone, card_number, profile_image, discount_percent) VALUES (?, (SELECT email FROM users WHERE id = ?), ?, ?, ?, 5.00)',
          [userId, userId, phone, card_number, profile_image]
        );
      }
      
      return await this.getByUserId(userId);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  
  // Get order history for user
  static async getOrderHistory(userId) {
    try {
      // Check if orders table exists
      const [tables] = await db.query(
        "SHOW TABLES LIKE 'orders'"
      );
      
      if (tables.length === 0) {
        // Orders table doesn't exist yet
        return [];
      }
      
      const [orders] = await db.query(
        `SELECT o.id, o.total_price, o.status, o.created_at, o.delivery_address, 
                r.name as restaurant_name, r.image_url as restaurant_image
         FROM orders o
         JOIN restaurants r ON o.restaurant_id = r.id
         WHERE o.user_id = ?
         ORDER BY o.created_at DESC`,
        [userId]
      );
      
      // Get items for each order if order_items table exists
      const [itemTables] = await db.query(
        "SHOW TABLES LIKE 'order_items'"
      );
      
      if (itemTables.length > 0) {
        for (let order of orders) {
          const [items] = await db.query(
            `SELECT oi.id, oi.quantity, oi.price, mi.name, mi.weight
             FROM order_items oi
             JOIN menu_items mi ON oi.menu_item_id = mi.id
             WHERE oi.order_id = ?`,
            [order.id]
          );
          
          order.items = items;
        }
      }
      
      return orders;
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  }
  
  // Update user discount based on orders count
  static async updateDiscount(userId) {
    try {
      const [userInfo] = await db.query(
        'SELECT orders_count FROM user_info WHERE user_id = ?',
        [userId]
      );
      
      if (userInfo.length === 0) {
        return;
      }
      
      const ordersCount = userInfo[0].orders_count;
      let discount = 5.00; // Default discount
      
      // Increase discount based on orders count
      if (ordersCount >= 50) {
        discount = 20.00;
      } else if (ordersCount >= 30) {
        discount = 15.00;
      } else if (ordersCount >= 10) {
        discount = 10.00;
      }
      
      await db.query(
        'UPDATE user_info SET discount_percent = ? WHERE user_id = ?',
        [discount, userId]
      );
    } catch (error) {
      console.error('Error updating user discount:', error);
      throw error;
    }
  }
}

module.exports = UserProfile;