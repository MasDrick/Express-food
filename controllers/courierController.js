const db = require("../config/db");

class CourierController {
  // Получить все заказы со статусом "transferring"
  async getAvailableOrders(req, res) {
    try {
      const [orders] = await db.query(`
        SELECT o.*, u.username
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.status = 'transferring'
        ORDER BY o.created_at DESC
      `);

      res.json(orders);
    } catch (error) {
      console.error("Error fetching available orders:", error);
      res.status(500).json({ message: "Ошибка при получении списка заказов" });
    }
  }

  // Взять заказ в доставку
  async assignDelivery(req, res) {
    const connection = await db.getConnection();
    
    try {
      const { orderId } = req.params;
      const courierId = req.user.id;
  
      // Получаем username курьера
      const [courier] = await connection.query(
        'SELECT username FROM users WHERE id = ?',
        [courierId]
      );
  
      await connection.beginTransaction();
  
      // Создаем запись в таблице доставок
      await connection.query(
        `INSERT INTO courier_deliveries (order_id, courier_id) VALUES (?, ?)`,
        [orderId, courierId]
      );
  
      // Обновляем статус заказа и добавляем курьера
      await connection.query(
        `UPDATE orders SET 
          status = 'delivering', 
          courier_id = ?,
          courier_username = ?
        WHERE id = ?`,
        [courierId, courier[0].username, orderId]
      );
  
      await connection.commit();
      connection.release();
  
      res.json({ message: "Заказ успешно принят в доставку" });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("Error assigning delivery:", error);
      res.status(500).json({ message: "Ошибка при назначении доставки" });
    }
  }

  // Получить активные доставки курьера
  async getCourierDeliveries(req, res) {
    try {
      const courierId = req.user.id;
      const [deliveries] = await db.query(`
        SELECT cd.*, o.*, u.username as customer_username
        FROM courier_deliveries cd
        JOIN orders o ON cd.order_id = o.id
        JOIN users u ON o.user_id = u.id
        WHERE cd.courier_id = ? AND cd.status != 'completed'
        ORDER BY cd.assigned_at DESC
      `, [courierId]);
  
      res.json(deliveries);
    } catch (error) {
      console.error("Error fetching courier deliveries:", error);
      res.status(500).json({ message: "Ошибка при получении списка доставок" });
    }
  }

  // Завершить доставку
  async completeDelivery(req, res) {
    const connection = await db.getConnection();
    
    try {
      const { orderId } = req.params;
      const courierId = req.user.id;

      await connection.beginTransaction();

      await connection.query(`
        UPDATE courier_deliveries 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE order_id = ? AND courier_id = ?
      `, [orderId, courierId]);

      await connection.query(
        `UPDATE orders SET status = 'completed' WHERE id = ?`,
        [orderId]
      );

      await connection.commit();
      connection.release();

      res.json({ message: "Доставка успешно завершена" });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("Error completing delivery:", error);
      res.status(500).json({ message: "Ошибка при завершении доставки" });
    }
  }
}

module.exports = new CourierController();