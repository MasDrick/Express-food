const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');
const userController = require('../controllers/userController');

// Get user profile
router.get('/profile', authMiddleware, userController.getUserProfile);

// Update user profile
router.put('/profile', authMiddleware, userController.updateUserProfile);

router.get('/profile/orders', authMiddleware, orderController.getUserOrders);

module.exports = router;