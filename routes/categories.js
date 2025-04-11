const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories');

router.get('/', categoriesController.getAllCategories);
router.get('/:id/restaurants', categoriesController.getRestaurantsByCategory);

module.exports = router;