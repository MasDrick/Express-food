const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Получение истории заказов
router.get('/history', orderController.getOrderHistory);

// Создание нового заказа
router.post('/', orderController.createOrder);

// Получение деталей заказа
router.get('/:id', orderController.getOrderDetails);

// Отмена заказа
router.put('/:id/cancel', orderController.cancelOrder);

module.exports = router;