const db = require('../config/db');

class Order {
  static async createOrder(orderData) {
    const { user_id, restaurant_id, total_price, delivery_address, items } = orderData;
    
    // Начинаем транзакцию
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Создаем заказ
      const [orderResult] = await connection.query(
        `INSERT INTO orders (user_id, restaurant_id, total_price, status, delivery_address) 
         VALUES (?, ?, ?, 'pending', ?)`,
        [user_id, restaurant_id, total_price, delivery_address]
      );
      
      const orderId = orderResult.insertId;
      
      // Добавляем позиции заказа
      for (const item of items) {
        await connection.query(
          `INSERT INTO order_items (order_id, menu_item_id, quantity, price) 
           VALUES (?, ?, ?, ?)`,
          [orderId, item.menu_item_id, item.quantity, item.price]
        );
      }
      
      // Увеличиваем счетчик заказов пользователя
      await connection.query(
        `INSERT INTO user_info (user_id, orders_count) 
         VALUES (?, 1) 
         ON DUPLICATE KEY UPDATE orders_count = orders_count + 1`,
        [user_id]
      );
      
      await connection.commit();
      
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getOrderById(orderId, userId) {
    const [orders] = await db.query(
      `SELECT o.id, o.total_price, o.status, o.created_at, o.delivery_address, 
              r.name as restaurant_name, r.image_url as restaurant_image
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = ? AND o.user_id = ?`,
      [orderId, userId]
    );
    
    if (orders.length === 0) {
      return null;
    }
    
    const order = orders[0];
    
    // Получаем позиции заказа
    const [orderItems] = await db.query(
      `SELECT oi.id, oi.quantity, oi.price, mi.name, mi.weight
       FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    
    order.items = orderItems;
    
    return order;
  }
}

module.exports = Order;