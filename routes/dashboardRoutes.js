const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db');

// Require admin role for dashboard access
const adminMiddleware = async (req, res, next) => {
  console.log('User in request:', req.user); // Debug: log the user object
  
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Пользователь не авторизован' });
  }
  
  try {
    // Fetch user role from database since it's not in the JWT token
    const [userResult] = await db.query(
      'SELECT role FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (userResult.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    const userRole = (userResult[0].role || '').toLowerCase();
    console.log('User role from DB:', userRole); // Debug: log the role
    
    if (userRole === 'admin') {
      next();
    } else {
      res.status(403).json({ 
        message: 'Доступ запрещен. Требуются права администратора.',
        currentRole: userResult[0].role // Return the current role for debugging
      });
    }
  } catch (error) {
    console.error('Error checking admin role:', error);
    res.status(500).json({ message: 'Ошибка при проверке прав доступа' });
  }
};

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: integer
 *                   description: Total number of orders
 *                 totalUsers:
 *                   type: integer
 *                   description: Total number of users
 *                 totalRestaurants:
 *                   type: integer
 *                   description: Total number of restaurants
 *                 totalRevenue:
 *                   type: number
 *                   description: Total revenue from all orders
 *                 ordersByStatus:
 *                   type: array
 *                   description: Orders grouped by status
 *                 recentOrders:
 *                   type: array
 *                   description: Recent orders
 *                 topRestaurants:
 *                   type: array
 *                   description: Top restaurants by order count
 *                 monthlyRevenue:
 *                   type: array
 *                   description: Monthly revenue for the last 6 months
 *       403:
 *         description: Access denied, admin rights required
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, adminMiddleware, dashboardController.getStats);

/**
 * @swagger
 * /api/admin/dashboard/users:
 *   get:
 *     summary: Get user statistics for admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *       403:
 *         description: Access denied, admin rights required
 *       500:
 *         description: Server error
 */
router.get('/users', authMiddleware, adminMiddleware, dashboardController.getUserStats);

/**
 * @swagger
 * /api/admin/dashboard/restaurants:
 *   get:
 *     summary: Get restaurant statistics for admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Restaurant statistics
 *       403:
 *         description: Access denied, admin rights required
 *       500:
 *         description: Server error
 */
router.get('/restaurants', authMiddleware, adminMiddleware, dashboardController.getRestaurantStats);

module.exports = router;