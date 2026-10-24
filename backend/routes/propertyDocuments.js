const express = require('express');
const multer = require('multer');
const path = require('node:path');
const { rateLimit } = require('express-rate-limit');
const { verifyToken, requireRole } = require('../middleware/auth');
const { env } = require('../config/env');
const { MAX_FILE_SIZE, EXTENSIONS, importPropertyDocument } = require('../services/documents/propertyImport');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1, fields: 0 },
  fileFilter(req, file, callback) {
    callback(EXTENSIONS.includes(path.extname(file.originalname).toLowerCase())
      ? null : new Error('Chỉ hỗ trợ .txt, .md, .docx và PDF có chữ.'), true);
  },
}).single('document');

/**
 * @swagger
 * /api/properties/import-document:
 *   post:
 *     summary: Đọc tài liệu và nhận diện thông tin để xem trước, chưa tạo tin đăng
 *     tags: [Properties]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [document]
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Thông tin nhận diện, nội dung gốc và danh sách trường còn thiếu
 *       400:
 *         description: Tài liệu không hợp lệ, quá 5MB hoặc không có chữ
 *       401:
 *         description: Chưa đăng nhập
 */
router.post('/import-document', verifyToken, requireRole('admin', 'sale'), rateLimit({
  windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false,
  message: { success: false, message: 'Bạn đã nhập quá nhiều tài liệu. Vui lòng thử lại sau 15 phút.' },
}), (req, res) => {
  upload(req, res, async error => {
    if (error) return res.status(400).json({ success: false, message: error.code === 'LIMIT_FILE_SIZE' ? 'Tài liệu vượt quá 5MB.' : error.message });
    if (!req.file?.buffer.length) return res.status(400).json({ success: false, message: 'Vui lòng chọn tài liệu có nội dung.' });
    try {
      const data = await importPropertyDocument(req.file, { ai: env.ai });
      return res.json({ success: true, data });
    } catch (error) {
      const message = /password/i.test(error.message) ? 'PDF được bảo vệ bằng mật khẩu. Vui lòng bỏ mật khẩu trước khi nhập.'
        : /zip|central directory|invalid|corrupt|end of|failed to|could not/i.test(error.message) ? 'Không đọc được tài liệu. File có thể bị hỏng hoặc sai định dạng.' : error.message;
      return res.status(400).json({ success: false, message });
    }
  });
});

module.exports = router;
