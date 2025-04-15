const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    // Check if the header exists and has the correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid Authorization header found:', authHeader);
      return res.status(401).json({ message: 'Не авторизован' });
    }
    
    // Extract the token (remove 'Bearer ' prefix)
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('No token found in Authorization header');
      return res.status(401).json({ message: 'Не авторизован' });
    }
    
    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      console.log('Error verifying token:', error.message);
      return res.status(401).json({ message: 'Ошибка аутентификации: ' + error.message });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};
