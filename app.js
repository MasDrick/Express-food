const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurants');
const menuRoutes = require('./routes/menu');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes'); // Добавляем новый маршрут

const app = express();

// Настройка CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'https://food-delivery-black-seven.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Настройка сессии
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'my_super_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // В продакшене должно быть true для HTTPS
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 день
    },
  }),
);

app.use(bodyParser.json());

// Маршруты
app.use('/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/user', userRoutes);
// Добавляем маршрут для совместимости с фронтендом
app.use('/api/users', userRoutes); // Добавляем этот маршрут для поддержки запросов к /api/users/profile
app.use('/api/orders', orderRoutes);

// Проверка соединения с базой данных
const db = require('./config/db');
db.query('SELECT 1')
  .then(() => console.log('Соединение с базой данных установлено'))
  .catch((err) => console.error('Ошибка подключения к базе данных:', err));

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
