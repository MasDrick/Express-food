const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();
// Add Swagger imports here
const { swaggerUi, specs } = require('./backend/swagger');

const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurants');
const menuRoutes = require('./routes/menu');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
// Add the new dashboard routes
const dashboardRoutes = require('./routes/dashboardRoutes');

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

// Add Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Маршруты
app.use('/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/user', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
// Add the new dashboard route
app.use('/api/admin/dashboard', dashboardRoutes);

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
  console.log(`Swagger документация доступна по адресу: http://localhost:${PORT}/api-docs`);
});
