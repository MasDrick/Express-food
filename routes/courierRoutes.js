const express = require('express');
const router = express.Router();
const courierController = require('../controllers/courierController');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db');

// Define courierMiddleware directly in this file
const courierMiddleware = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Пользователь не авторизован' });
  }
  
  try {
    // Fetch user role from database
    const [userResult] = await db.query(
      'SELECT role FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (userResult.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    const userRole = (userResult[0].role || '').toLowerCase();
    
    if (userRole === 'courier') {
      next();
    } else {
      res.status(403).json({ 
        message: 'Доступ запрещен. Требуются права курьера.',
        currentRole: userResult[0].role
      });
    }
  } catch (error) {
    console.error('Error checking courier role:', error);
    res.status(500).json({ message: 'Ошибка при проверке прав доступа' });
  }
};

// Apply middleware to all routes
router.use(authMiddleware, courierMiddleware);

router.get('/available-orders', courierController.getAvailableOrders);
router.post('/assign/:orderId', courierController.assignDelivery);
router.get('/my-deliveries', courierController.getCourierDeliveries);
router.post('/complete/:orderId', courierController.completeDelivery);

module.exports = router;