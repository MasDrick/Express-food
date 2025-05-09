const db = require('../config/db');

class DashboardController {
  async getStats(req, res) {
    try {
      // Basic stats
      const [ordersResult] = await db.query('SELECT COUNT(*) as totalOrders FROM orders');
      const totalOrders = ordersResult[0].totalOrders;

      const [usersResult] = await db.query('SELECT COUNT(*) as totalUsers FROM users');
      const totalUsers = usersResult[0].totalUsers;

      const [restaurantsResult] = await db.query('SELECT COUNT(*) as totalRestaurants FROM restaurants');
      const totalRestaurants = restaurantsResult[0].totalRestaurants;

      // Revenue stats
      const [revenueResult] = await db.query('SELECT SUM(total_amount) as totalRevenue FROM orders');
      const totalRevenue = revenueResult[0].totalRevenue || 0;

      // Orders by status
      const [ordersByStatus] = await db.query(`
        SELECT status, COUNT(*) as count 
        FROM orders 
        GROUP BY status
      `);

      // Recent orders (last 5)
      const [recentOrders] = await db.query(`
        SELECT o.id, o.total_amount, o.status, o.created_at, u.username 
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 5
      `);

      // Top restaurants by order count
      const [topRestaurants] = await db.query(`
        SELECT r.id, r.name, COUNT(DISTINCT oi.order_id) as order_count
        FROM restaurants r
        JOIN order_items oi ON r.id = oi.restaurant_id
        GROUP BY r.id, r.name
        ORDER BY order_count DESC
        LIMIT 5
      `);

      // Monthly revenue for the last 6 months
      const [monthlyRevenue] = await db.query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          SUM(total_amount) as revenue
        FROM orders
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY month
        ORDER BY month
      `);

      // Get top spender with detailed user info
      const [topSpenderResult] = await db.query(`
        SELECT u.username, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent,
               ui.email, ui.phone, ui.card_number, ui.discount_percent, ui.registration_date, 
               ui.orders_count, ui.profile_image
        FROM users u
        JOIN orders o ON u.id = o.user_id
        LEFT JOIN user_info ui ON u.id = ui.user_id
        GROUP BY u.id, u.username, ui.email, ui.phone, ui.card_number, 
                 ui.discount_percent, ui.registration_date, ui.orders_count, ui.profile_image
        ORDER BY total_spent DESC
        LIMIT 1
      `);
      
      const topSpender = topSpenderResult.length > 0 ? {
        username: topSpenderResult[0].username,
        order_count: topSpenderResult[0].order_count,
        total_spent: topSpenderResult[0].total_spent,
        email: topSpenderResult[0].email,
        phone: topSpenderResult[0].phone,
        card_number: topSpenderResult[0].card_number,
        discount_percent: topSpenderResult[0].discount_percent,
        registration_date: topSpenderResult[0].registration_date,
        orders_count: topSpenderResult[0].orders_count,
        profile_image: topSpenderResult[0].profile_image
      } : null;

      // Return all stats
      res.json({
        totalOrders,
        totalUsers,
        totalRestaurants,
        totalRevenue,
        ordersByStatus,
        recentOrders,
        topRestaurants,
        monthlyRevenue,
        topSpender
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Ошибка при получении статистики' });
    }
  }

  // Get detailed user statistics
  async getUserStats(req, res) {
    try {
      // New users in the last 30 days
      const [newUsers] = await db.query(`
        SELECT COUNT(*) as count
        FROM users
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);

      // Users with most orders
      const [topUsers] = await db.query(`
        SELECT u.id, u.username, u.email, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent
        FROM users u
        JOIN orders o ON u.id = o.user_id
        GROUP BY u.id, u.username, u.email
        ORDER BY order_count DESC
        LIMIT 10
      `);

      res.json({
        newUsersLast30Days: newUsers[0].count,
        topUsers
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ message: 'Ошибка при получении статистики пользователей' });
    }
  }

  // Get detailed restaurant statistics
  async getRestaurantStats(req, res) {
    try {
      // Top selling menu items
      const [topItems] = await db.query(`
        SELECT mi.id, mi.name, r.name as restaurant_name, COUNT(oi.id) as order_count
        FROM menu_items mi
        JOIN order_items oi ON mi.id = oi.menu_item_id
        JOIN restaurants r ON mi.restaurant_id = r.id
        GROUP BY mi.id, mi.name, r.name
        ORDER BY order_count DESC
        LIMIT 10
      `);

      res.json({
        topSellingItems: topItems
      });
    } catch (error) {
      console.error('Error fetching restaurant stats:', error);
      res.status(500).json({ message: 'Ошибка при получении статистики ресторанов' });
    }
  }
}

module.exports = new DashboardController();