const MenuItem = require('../models/MenuItem');

exports.createMenuItem = async (req, res) => {
  try {
    const itemId = await MenuItem.create(req.params.restaurantId, req.body);
    res.status(201).json({ id: itemId });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании пункта меню' });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    await MenuItem.update(req.params.id, req.body);
    res.json({ message: 'Пункт меню обновлен' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении пункта меню' });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    await MenuItem.delete(req.params.id);
    res.json({ message: 'Пункт меню удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении пункта меню' });
  }
};
