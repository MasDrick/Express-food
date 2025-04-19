const db = require('../config/db');

// Create a new order
exports.createOrder = async (req, res) => {
  // Get a connection from the pool for transaction
  const connection = await db.getConnection();
  
  try {
    const { 
      items,
      total_amount, 
      delivery_fee, 
      address, 
      phone,
      comment 
    } = req.body;
    
    // Получаем userId из JWT или сессии
    const userId = (req.user && req.user.id) || req.session.userId || 1;
    
    // Start transaction
    await connection.beginTransaction();
    
    // Create order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, delivery_fee, address, phone, comment) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, total_amount, delivery_fee, address, phone, comment]
    );
    
    const orderId = orderResult.insertId;
    
    // Insert order items
    for (const item of items) {
      await connection.query(
        'INSERT INTO order_items (order_id, restaurant_id, menu_item_id, quantity, price, item_name) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.restaurant_id, item.menu_item_id, item.quantity, item.price, item.name]
      );
    }
    
    // Insert initial status
    await connection.query(
      'INSERT INTO order_status_history (order_id, status) VALUES (?, ?)',
      [orderId, 'pending']
    );
    
    // Commit transaction
    await connection.commit();
    
    // Update user's orders count if user exists
    if (userId) {
      try {
        await db.query(
          'UPDATE user_info SET orders_count = orders_count + 1 WHERE user_id = ?',
          [userId]
        );
      } catch (err) {
        console.log('Could not update orders count, continuing anyway');
      }
    }
    
    res.status(201).json({ 
      message: 'Заказ успешно создан', 
      orderId 
    });
    
  } catch (error) {
    // Rollback transaction in case of error
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Ошибка при создании заказа' });
  } finally {
    // Release the connection back to the pool
    connection.release();
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    // Получаем id пользователя из authMiddleware
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const [orders] = await db.query(
      `SELECT o.*, 
        (SELECT COUNT(DISTINCT restaurant_id) FROM order_items WHERE order_id = o.id) as restaurant_count
      FROM orders o 
      WHERE o.user_id = ? 
      ORDER BY o.created_at DESC`,
      [userId]
    );

    // Get items for each order
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, r.name as restaurant_name 
        FROM order_items oi
        JOIN restaurants r ON oi.restaurant_id = r.id
        WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);

  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    // Removed authentication check
    const userId = req.session.userId || 1; // Default to user ID 1 if not authenticated
    
    // Get order - removed user check
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }
    
    const order = orders[0];
    
    // Get order items
    const [items] = await db.query(
      `SELECT oi.*, r.name as restaurant_name 
      FROM order_items oi
      JOIN restaurants r ON oi.restaurant_id = r.id
      WHERE oi.order_id = ?`,
      [orderId]
    );
    
    // Get status history
    const [statusHistory] = await db.query(
      'SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at',
      [orderId]
    );
    
    order.items = items;
    order.statusHistory = statusHistory;
    
    res.json(order);
    
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Ошибка при получении деталей заказа' });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    // Removed authentication check
    
    // Check if order exists - removed user check
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }
    
    const order = orders[0];
    
    // Check if order can be cancelled (only pending or processing)
    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({ 
        message: 'Невозможно отменить заказ в текущем статусе' 
      });
    }
    
    // Update order status
    await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['cancelled', orderId]
    );
    
    // Add status history
    await db.query(
      'INSERT INTO order_status_history (order_id, status) VALUES (?, ?)',
      [orderId, 'cancelled']
    );
    
    res.json({ message: 'Заказ успешно отменен' });
    
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Ошибка при отмене заказа' });
  }
};