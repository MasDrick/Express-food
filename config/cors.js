// Настройки CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://food-delivery-black-seven.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = corsOptions;