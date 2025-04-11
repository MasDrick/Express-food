// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Проверяем сначала заголовок Authorization
    const authHeader = req.headers.authorization;
    let token;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Извлекаем токен из заголовка
      token = authHeader.split(' ')[1];
    } else {
      // Если нет в заголовке, проверяем в cookies
      token = req.cookies?.token;
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    console.error('Ошибка аутентификации:', e);
    res.status(401).json({ message: 'Не авторизован' });
  }
};
