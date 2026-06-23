const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: Tạo một yêu cầu liên hệ mới từ khách hàng
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đã tạo yêu cầu liên hệ thành công
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' });
    }

    const contact = await prisma.contactRequest.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
        status: 'Pending'
      }
    });

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    console.error("Lỗi khi tạo yêu cầu liên hệ:", error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi gửi liên hệ.', error: error.message });
  }
});

module.exports = router;
