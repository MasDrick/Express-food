

// На
const bcrypt = require('bcryptjs');

// Остальной код остается без изменений, так как API bcryptjs совместим с bcrypt
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
  // Регистрация пользователя
  async register(req, res) {
    try {
      const { username, email, password, confirmPassword } = req.body;

      // Валидация
      if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({
          message: 'Все поля обязательны для заполнения',
          errors: [
            { path: 'username', msg: 'Имя пользователя обязательно' },
            { path: 'email', msg: 'Email обязателен' },
            { path: 'password', msg: 'Пароль обязателен' },
            { path: 'confirmPassword', msg: 'Подтверждение пароля обязательно' }
          ]
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          message: 'Пароли не совпадают',
          errors: [
            { path: 'confirmPassword', msg: 'Пароли не совпадают' }
          ]
        });
      }

      // Проверка существующего пользователя
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          message: 'Пользователь с таким email уже существует',
          errors: [
            { path: 'email', msg: 'Пользователь с таким email уже существует' }
          ]
        });
      }

      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);

      // Создание пользователя
      const userId = await User.create({
        username,
        email,
        password: hashedPassword
      });

      // Создание JWT токена
      const token = jwt.sign(
        { userId, email, username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Отправка ответа
      res.status(201).json({
        message: 'Пользователь успешно зарегистрирован',
        token,
        user: {
          id: userId,
          username,
          email
        }
      });
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      res.status(500).json({ message: 'Ошибка сервера при регистрации' });
    }
  }

  // Авторизация пользователя
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(400).json({
          message: 'Неверные учетные данные',
          errors: [
            { path: 'email', msg: ' ' },
            { path: 'password', msg: 'Неверный email или пароль' },
          ],
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          message: 'Неверные учетные данные',
          errors: [
            { path: 'email', msg: ' ' },
            { path: 'password', msg: 'Неверный email или пароль' },
          ],
        });
      }

      // Генерация JWT токена
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });

      res.json({
        message: 'Успешный вход',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || 'user',
        },
        token: token, // возвращаем токен
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({
        message: 'Ошибка входа',
        errors: [{ path: 'server', msg: 'Ошибка сервера' }],
      });
    }
  }

  // Проверка авторизации (с использованием токена из заголовка)
  async checkAuth(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1]; // токен из заголовка Authorization

      if (!token) {
        return res.json({ isAuthenticated: false });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.json({ isAuthenticated: false });
      }

      res.json({
        isAuthenticated: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || 'user',
        },
      });
    } catch (e) {
      res.json({ isAuthenticated: false });
    }
  }

  // Логаут пользователя
  async logout(req, res) {
    // Нет необходимости в очищении cookie, т.к. мы не используем их
    res.json({ message: 'Вы вышли из системы' });
  }
}

module.exports = new AuthController();
