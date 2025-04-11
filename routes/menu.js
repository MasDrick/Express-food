const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:restaurantId', authMiddleware, menuController.createMenuItem);
router.put('/:id', authMiddleware, menuController.updateMenuItem);
router.delete('/:id', authMiddleware, menuController.deleteMenuItem);

module.exports = router;
