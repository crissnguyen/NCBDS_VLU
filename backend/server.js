require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Phục vụ thư mục tĩnh 'uploads' để lấy ảnh
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger Options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EstateAI API',
      version: '1.0.0',
      description: 'Tài liệu API cho hệ thống Bất động sản AI',
      contact: {
        name: 'Developer Team'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local server'
      }
    ]
  },
  // Đường dẫn đến các file chứa chú thích Swagger
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Đăng ký Routes
const propertiesRoute = require('./routes/properties');
const authRoute = require('./routes/auth');
const adminRoute = require('./routes/admin');

app.use('/api/properties', propertiesRoute);
app.use('/api/auth', authRoute);
app.use('/api/admin', adminRoute);

// Default Route
app.get('/', (req, res) => {
  res.send('Welcome to EstateAI Backend. Truy cập /api-docs để xem tài liệu API Swagger.');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📄 Swagger docs available at http://localhost:${PORT}/api-docs`);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION', err);
});
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION', err);
});
process.on('exit', (code) => {
  console.log('Process exiting with code:', code);
});
setInterval(() => {}, 1000 * 60 * 60);
