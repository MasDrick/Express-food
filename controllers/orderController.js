const db = require('../config/db');
const Order = require('../models/Order');
const User = require('../models/User');

class OrderController {
  // Получение истории заказов пользователя
  async getOrderHistory(req, res) {
    try {
      const userId = req.user.id;
      
      // Получаем заказы пользователя
      const [orders] = await db.query(
        `SELECT o.id, o.total_price, o.status, o.created_at, o.delivery_address, 
                r.name as restaurant_name, r.image_url as restaurant_image
         FROM orders o
         JOIN restaurants r ON o.restaurant_id = r.id
         WHERE o.user_id = ?
         ORDER BY o.created_at DESC`,
        [userId]
      );
      
      // Для каждого заказа получаем его позиции
      for (let order of orders) {
        const [orderItems] = await db.query(
          `SELECT oi.id, oi.quantity, oi.price, mi.name, mi.weight
           FROM order_items oi
           JOIN menu_items mi ON oi.menu_item_id = mi.id
           WHERE oi.order_id = ?`,
          [order.id]
        );
        
        order.items = orderItems;
      }
      
      res.json(orders);
    } catch (error) {
      console.error('Ошибка при получении истории заказов:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении истории заказов' });
    }
  }

  // Создание нового заказа
  async createOrder(req, res) {
    try {
      const userId = req.user.id;
      const { restaurant_id, total_price, delivery_address, items } = req.body;
      
      // Валидация данных
      if (!restaurant_id || !total_price || !delivery_address || !items || !items.length) {
        return res.status(400).json({ message: 'Не все обязательные поля заполнены' });
      }
      
      // Создаем заказ
      const orderId = await Order.createOrder({
        user_id: userId,
        restaurant_id,
        total_price,
        delivery_address,
        items
      });
      
      // Увеличиваем счетчик заказов пользователя
      await User.incrementOrderCount(userId);
      
      // Получаем созданный заказ
      const order = await Order.getOrderById(orderId, userId);
      
      res.status(201).json({
        message: 'Заказ успешно создан',
        order
      });
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      res.status(500).json({ message: 'Ошибка сервера при создании заказа' });
    }
  }

  // Получение деталей заказа
  async getOrderDetails(req, res) {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      
      const order = await Order.getOrderById(orderId, userId);
      
      if (!order) {
        return res.status(404).json({ message: 'Заказ не найден' });
      }
      
      res.json(order);
    } catch (error) {
      console.error('Ошибка при получении деталей заказа:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении деталей заказа' });
    }
  }

  // Отмена заказа
  async cancelOrder(req, res) {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      
      // Проверяем существование заказа
      const [orders] = await db.query(
        'SELECT id, status FROM orders WHERE id = ? AND user_id = ?',
        [orderId, userId]
      );
      
      if (orders.length === 0) {
        return res.status(404).json({ message: 'Заказ не найден' });
      }
      
      const order = orders[0];
      
      // Проверяем, можно ли отменить заказ
      if (order.status !== 'pending' && order.status !== 'processing') {
        return res.status(400).json({ message: 'Невозможно отменить заказ в текущем статусе' });
      }
      
      // Отменяем заказ
      await db.query(
        'UPDATE orders SET status = "cancelled" WHERE id = ?',
        [orderId]
      );
      
      res.json({ message: 'Заказ успешно отменен' });
    } catch (error) {
      console.error('Ошибка при отмене заказа:', error);
      res.status(500).json({ message: 'Ошибка сервера при отмене заказа' });
    }
  }
}

module.exports = new OrderController();