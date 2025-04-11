const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

const db = require('../config/db');

exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.getAll();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении ресторанов' });
  }
};

exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.getById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Ресторан не найден' });
    }
    const menu = await Restaurant.getMenu(req.params.id);
    res.json({ ...restaurant, menu });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении ресторана' });
  }
};

exports.getRestaurantsByCuisine = async (req, res) => {
  try {
    const restaurants = await Restaurant.getByCuisine(req.params.cuisine);
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при поиске ресторанов' });
  }
};
// Добавьте этот метод в controllers/restaurants.js
exports.searchRestaurants = async (req, res) => {
  try {
    const search = req.query.search;
    if (!search) {
      return res.status(400).json({ message: 'Не указан поисковый запрос' });
    }

    const [rows] = await db.query(
      `SELECT * FROM restaurants 
       WHERE name LIKE ? OR cuisine LIKE ?`,
      [`%${search}%`, `%${search}%`],
    );

    res.json(rows);
  } catch (error) {
    console.error('Ошибка поиска:', error);
    res.status(500).json({ message: 'Ошибка при поиске ресторанов' });
  }
};
