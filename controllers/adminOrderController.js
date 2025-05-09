const db = require("../config/db");

class AdminOrderController {
  // Get all orders with pagination and filtering
  async getAllOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const status = req.query.status || "";
      const search = req.query.search || "";

      let query = `
        SELECT o.id, o.user_id, o.restaurant_id, o.total_amount, o.status, 
               o.delivery_address, o.created_at, u.username, u.email, u.phone,
               r.name as restaurant_name, r.image_url as restaurant_image,
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN restaurants r ON o.restaurant_id = r.id
        WHERE 1=1
      `;

      const queryParams = [];

      // Add status filter if provided
      if (status) {
        query += ` AND o.status = ?`;
        queryParams.push(status);
      }

      // Add search filter if provided
      if (search) {
        query += ` AND (u.username LIKE ? OR o.delivery_address LIKE ? OR r.name LIKE ?)`;
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      // Count total orders for pagination
      const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM (${query}) as filtered_orders`,
        queryParams
      );
      const totalOrders = countResult[0].total;

      // Add sorting and pagination
      query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);

      // Execute the main query
      const [orders] = await db.query(query, queryParams);

      // Get a sample of items for each order (for card preview)
      for (const order of orders) {
        const [orderItems] = await db.query(
          `
          SELECT mi.name, mi.image_url
          FROM order_items oi
          JOIN menu_items mi ON oi.menu_item_id = mi.id
          WHERE oi.order_id = ?
          LIMIT 3
        `,
          [order.id]
        );

        order.preview_items = orderItems;
      }

      res.json({
        orders,
        pagination: {
          total: totalOrders,
          page,
          limit,
          pages: Math.ceil(totalOrders / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Ошибка при получении списка заказов" });
    }
  }

  // Get order details by ID
  async getOrderById(req, res) {
    try {
      const orderId = req.params.id;

      // Get order details
      const [orderResult] = await db.query(
        `
        SELECT o.id, o.user_id, o.restaurant_id, o.total_amount, o.status, 
               o.delivery_address, o.created_at, u.username, u.email, u.phone,
               r.name as restaurant_name, r.image_url as restaurant_image
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN restaurants r ON o.restaurant_id = r.id
        WHERE o.id = ?
      `,
        [orderId]
      );

      if (orderResult.length === 0) {
        return res.status(404).json({ message: "Заказ не найден" });
      }

      const order = orderResult[0];

      // Get order items
      const [orderItems] = await db.query(
        `
        SELECT oi.id, oi.menu_item_id, oi.quantity, oi.price, mi.name, mi.description, mi.image_url
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = ?
      `,
        [orderId]
      );

      res.json({
        ...order,
        items: orderItems,
      });
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({ message: "Ошибка при получении деталей заказа" });
    }
  }

  // Update order status
  async updateOrderStatus(req, res) {
    try {
      const orderId = req.params.id;
      const { status } = req.body;

      // Validate input
      if (!status) {
        return res.status(400).json({ message: "Статус заказа обязателен" });
      }

      const validStatuses = [
        "pending",
        "processing",
        "delivering",
        "completed",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Недопустимый статус заказа" });
      }

      // Update order status
      const [result] = await db.query(
        "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [status, orderId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Заказ не найден" });
      }

      // Record status change
      await db.query(
        "INSERT INTO order_status_history (order_id, status) VALUES (?, ?)",
        [orderId, status]
      );

      // Get updated order
      const [updatedOrder] = await db.query(
        `SELECT o.*, u.username as user_name 
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.id = ?`,
        [orderId]
      );

      res.json({
        message: "Статус заказа обновлен",
        order: updatedOrder[0],
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res
        .status(500)
        .json({ message: "Ошибка сервера при обновлении статуса" });
    }
  }

  // Batch update multiple order statuses
  async batchUpdateOrderStatus(req, res) {
    try {
      const { orderIds, status } = req.body;

      if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return res
          .status(400)
          .json({ message: "Необходимо указать ID заказов" });
      }

      if (!status) {
        return res.status(400).json({ message: "Статус заказа обязателен" });
      }

      // Validate status - add "delivering" to valid statuses
      const validStatuses = [
        "pending",
        "processing",
        "delivering",
        "completed",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Недопустимый статус заказа",
          validStatuses: validStatuses,
        });
      }

      // Update order statuses
      await db.query("UPDATE orders SET status = ? WHERE id IN (?)", [
        status,
        orderIds,
      ]);

      res.json({
        message: `Статус ${orderIds.length} заказов успешно обновлен на "${status}"`,
      });
    } catch (error) {
      console.error("Error batch updating order statuses:", error);
      res
        .status(500)
        .json({ message: "Ошибка при обновлении статусов заказов" });
    }
  }

  // Get order statistics
  // Add this method if it doesn't exist or update it if it does
  async getOrderStats(req, res) {
    try {
      // Get all orders (not filtered by user_id)
      const [orders] = await db.query(
        `SELECT o.*, 
        u.username as user_name,
        (SELECT COUNT(DISTINCT restaurant_id) FROM order_items WHERE order_id = o.id) as restaurant_count
      FROM orders o 
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC`
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
      console.error("Error fetching all orders:", error);
      res.status(500).json({ message: "Ошибка при получении заказов" });
    }
  }
  async updateCookingStatus(req, res) {
    try {
      const orderId = req.params.id;
      const { cookingStatus } = req.body;

      if (!cookingStatus) {
        return res
          .status(400)
          .json({ message: "Статус готовки заказа обязателен" });
      }

      // Validate cooking status
      const validCookingStatuses = [
        "not_started",
        "preparing",
        "ready_for_pickup",
        "on_the_way",
        "delivered",
      ];
      if (!validCookingStatuses.includes(cookingStatus)) {
        return res.status(400).json({
          message: "Недопустимый статус готовки заказа",
          validStatuses: validCookingStatuses,
        });
      }

      // Check if order exists
      const [orderCheck] = await db.query(
        "SELECT id FROM orders WHERE id = ?",
        [orderId]
      );

      if (orderCheck.length === 0) {
        return res.status(404).json({ message: "Заказ не найден" });
      }

      // Update order cooking status
      // First, check if we need to add a cooking_status column
      try {
        // Try to update the cooking_status column
        await db.query("UPDATE orders SET cooking_status = ? WHERE id = ?", [
          cookingStatus,
          orderId,
        ]);
      } catch (error) {
        // If column doesn't exist, create it
        if (error.code === "ER_BAD_FIELD_ERROR") {
          await db.query(
            "ALTER TABLE orders ADD COLUMN cooking_status VARCHAR(50) DEFAULT 'not_started'"
          );
          // Then try the update again
          await db.query("UPDATE orders SET cooking_status = ? WHERE id = ?", [
            cookingStatus,
            orderId,
          ]);
        } else {
          throw error; // Re-throw if it's a different error
        }
      }

      // Get updated order details for response
      const [updatedOrder] = await db.query(
        `
        SELECT o.id, o.status, o.cooking_status, o.total_amount, o.created_at, 
               u.username, r.name as restaurant_name
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN restaurants r ON o.restaurant_id = r.id
        WHERE o.id = ?
      `,
        [orderId]
      );

      res.json({
        message: "Статус готовки заказа успешно обновлен",
        order: updatedOrder[0],
      });
    } catch (error) {
      console.error("Error updating cooking status:", error);
      res
        .status(500)
        .json({ message: "Ошибка при обновлении статуса готовки заказа" });
    }
  }
}

// Add this method to your AdminOrderController class

// Update order cooking status

module.exports = new AdminOrderController();
