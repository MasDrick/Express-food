const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Добавьте authMiddleware для защищённых маршрутов
router.post('/', authMiddleware, orderController.createOrder);
router.get('/', authMiddleware, orderController.getUserOrders);
router.get('/:orderId', authMiddleware, orderController.getOrderDetails);
router.put('/:orderId/cancel', authMiddleware, orderController.cancelOrder);

module.exports = router;