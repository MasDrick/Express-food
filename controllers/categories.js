const Category = require('../models/Category');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    // Add "All" category at the beginning
    const allCategories = [{ id: 0, name: 'Все', image_url: null }, ...categories];
    res.json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Ошибка при получении категорий' });
  }
};

exports.getRestaurantsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const restaurants = await Category.getRestaurantsByCategory(categoryId);
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants by category:', error);
    res.status(500).json({ message: 'Ошибка при получении ресторанов по категории' });
  }
};