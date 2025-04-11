const express = require('express');
const router = express.Router();
const restaurantsController = require('../controllers/restaurants');

// Все маршруты теперь будут иметь префикс /api/restaurants
router.get('/', restaurantsController.getAllRestaurants);
router.get('/search', restaurantsController.searchRestaurants); // Поиск
router.get('/:id', restaurantsController.getRestaurant);
router.get('/cuisine/:cuisine', restaurantsController.getRestaurantsByCuisine);

module.exports = router;
