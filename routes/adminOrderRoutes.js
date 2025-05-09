const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/adminOrderController');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db');

// Define adminMiddleware directly in this file, like in dashboardRoutes.js
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

// Stats routes should come BEFORE the parameterized routes
/**
 * @swagger
 * /api/admin/orders/stats:
 *   get:
 *     summary: Get order statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics
 *       403:
 *         description: Access denied, admin rights required
 *       500:
 *         description: Server error
 */
router.get('/stats', authMiddleware, adminMiddleware, adminOrderController.getOrderStats);

// Keep the existing stats/overview route as well
router.get('/stats/overview', authMiddleware, adminMiddleware, adminOrderController.getOrderStats);

/**
 * @swagger
 * /api/admin/orders/batch-status:
 *   put:
 *     summary: Update status for multiple orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderIds
 *               - status
 *             properties:
 *               orderIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of order IDs to update
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled]
 *     responses:
 *       200:
 *         description: Statuses updated successfully
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Access denied, admin rights required
 *       500:
 *         description: Server error
 */
router.put('/batch-status', authMiddleware, adminMiddleware, adminOrderController.batchUpdateOrderStatus);

// Regular routes with parameters should come AFTER specific routes
/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders with pagination and filtering
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by order status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for username, address or restaurant
 *     responses:
 *       200:
 *         description: List of orders
 *       403:
 *         description: Access denied, admin rights required
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, adminMiddleware, adminOrderController.getAllOrders);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *       403:
 *         description: Access denied, admin rights required
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authMiddleware, adminMiddleware, adminOrderController.getOrderById);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status
 *       403:
 *         description: Access denied, admin rights required
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put('/:id/status', authMiddleware, adminMiddleware, adminOrderController.updateOrderStatus);

// Add this new route for updating cooking status
/**
 * @swagger
 * /api/admin/orders/{id}/cooking-status:
 *   put:
 *     summary: Update order cooking status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cookingStatus
 *             properties:
 *               cookingStatus:
 *                 type: string
 *                 enum: [not_started, preparing, ready_for_pickup, on_the_way, delivered]
 *     responses:
 *       200:
 *         description: Cooking status updated successfully
 *       400:
 *         description: Invalid cooking status
 *       403:
 *         description: Access denied, admin rights required
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put('/:id/cooking-status', authMiddleware, adminMiddleware, adminOrderController.updateCookingStatus);
module.exports = router;