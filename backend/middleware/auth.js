const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const prisma = require('../lib/prisma');

/**
 * Middleware xác thực token JWT hoặc phiên làm việc hợp lệ
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['x-access-token'];

  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Mã xác thực không hợp lệ.'
      });
    }

    try {
      const decoded = jwt.verify(token, env.jwtSecret);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: 'Mã xác thực không hợp lệ hoặc đã hết hạn.'
      });
    }
  }

  // Hỗ trợ header x-user-id trong môi trường tương tác client
  const userId = req.headers['x-user-id'];
  if (userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.status === 'Active') {
        req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
        return next();
      }
    } catch (e) {
      // Bỏ qua lỗi DB
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Truy cập bị từ chối. Vui lòng cung cấp mã xác thực (Token).'
  });
};

/**
 * Middleware kiểm tra quyền (Role-Based Access Control)
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực người dùng.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền thực hiện thao tác này. Quyền yêu cầu: [${allowedRoles.join(', ')}].`
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole,
};
