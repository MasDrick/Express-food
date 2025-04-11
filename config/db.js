const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3307, // добавляем порт с fallback на 3306
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '', // явно указываем пустой пароль если не задан
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // добавляем таймаут подключения
});

// Проверка подключения при старте
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Ошибка подключения к MySQL:', err);
  } else {
    console.log('Успешное подключение к MySQL');
    connection.release();
  }
});

module.exports = pool.promise();
