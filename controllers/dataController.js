const db = require('../config/db');

class DataController {
  async addItem(req, res) {
    try {
      const { text } = req.body;

      if (!text || text.trim() === '') {
        return res.status(400).json({ message: 'Текст не может быть пустым' });
      }

      const [result] = await db.query('INSERT INTO items (text) VALUES (?)', [text]);

      res.status(201).json({
        id: result.insertId,
        text,
        message: 'Элемент успешно добавлен',
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Ошибка при добавлении элемента' });
    }
  }

  async getItems(req, res) {
    try {
      const [items] = await db.query('SELECT * FROM items ORDER BY id DESC');
      res.json({
        success: true,
        data: items, // Убедитесь, что данные возвращаются в поле "data"
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении данных',
      });
    }
  }
}

module.exports = new DataController();
