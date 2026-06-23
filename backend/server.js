const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const { env } = require('./config/env');
const prisma = require('./lib/prisma');
const { closeMailTransporter } = require('./services/mail');

const app = express();
const PORT = env.port;

const isLocalOrigin = (origin) => {
  if (!origin) return false;

  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    return false;
  }
};

const corsOptions = {
  origin(origin, callback) {
    if (
      !origin
      || env.corsOrigins.length === 0
      || env.corsOrigins.includes(origin)
      || (env.nodeEnv !== 'production' && isLocalOrigin(origin))
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));

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
        url: process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`,
        description: env.nodeEnv === 'production' ? 'Production server' : 'Local server'
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
const aiRoute = require('./routes/ai');
const newsRoute = require('./routes/news');

app.use('/api/properties', propertiesRoute);
app.use('/api/auth', authRoute);
app.use('/api/admin', adminRoute);
app.use('/api/ai', aiRoute);
app.use('/api/news', newsRoute);

app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// Default Route
app.get('/', (req, res) => {
  res.send('Welcome to EstateAI Backend. Truy cập /api-docs để xem tài liệu API Swagger.');
});

const server = app.listen(PORT);

server.on('listening', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📄 Swagger docs available at http://localhost:${PORT}/api-docs`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} đang bị chiếm. Hãy tắt process cũ hoặc đổi PORT trong backend/.env.local.`);
  } else {
    console.error('❌ Không thể khởi động server:', error);
  }
  process.exitCode = 1;
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await closeMailTransporter();
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION', err);
});
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION', err);
});
process.on('exit', (code) => {
  console.log('Process exiting with code:', code);
});
