const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db');

// Define adminMiddleware directly in this file, like in adminOrderRoutes.js
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
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Access denied, admin rights required
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, adminMiddleware, adminUserController.getAllUsers);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user
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
 *               - username
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Access denied, admin rights required
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, adminMiddleware, adminUserController.addUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied, admin rights required
 *       500:
 *         description: Server error
 */
router.get('/:id', authMiddleware, adminMiddleware, adminUserController.getUserById);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               card_number:
 *                 type: string
 *               discount_percent:
 *                 type: number
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user details
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied, admin rights required
 *       500:
 *         description: Server error
 */
router.put('/:id', authMiddleware, adminMiddleware, adminUserController.updateUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied, admin rights required
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware, adminMiddleware, adminUserController.deleteUser);

/**
 * @swagger
 * /api/admin/users/{id}/make-admin:
 *   put:
 *     summary: Make user an admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User role updated to admin
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied, admin rights required
 *       500:
 *         description: Server error
 */
router.put('/:id/make-admin', authMiddleware, adminMiddleware, adminUserController.makeAdmin);

module.exports = router;