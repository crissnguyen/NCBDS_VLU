const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { normalizeEmail } = require('../utils/auth');
const { sendMail } = require('../services/mail');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Chức năng Quản trị hệ thống
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Lấy dữ liệu tổng quan cho Admin Dashboard
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Lấy dữ liệu thành công
 */
router.get('/dashboard', async (req, res) => {
  try {
    // 1. Tổng số Sale
    const totalSales = await prisma.user.count({
      where: { role: 'sale' }
    });

    // 2. Số tin đang chờ duyệt
    const pendingListings = await prisma.property.count({
      where: { status: 'Pending' }
    });

    // 3. Số giao dịch thành công (isSold = true)
    const successfulTransactions = await prisma.property.count({
      where: { isSold: true }
    });

    // 4. Danh sách người dùng (tính cả số tin đăng)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        status: true,
        performance: true,
        _count: {
          select: { properties: true }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json({
      success: true,
      data: {
        metrics: {
          totalSales,
          pendingListings,
          successfulTransactions
        },
        users
      }
    });
  } catch (error) {
    console.error("Lỗi lấy dữ liệu Admin Dashboard:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Thay đổi trạng thái tài khoản (Khóa/Mở)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Active, Pending, Locked]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Pending', 'Locked'].includes(status)) {
      return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, message: `Đã đổi trạng thái thành ${status}`, user: updatedUser });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái user:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ hoặc không tìm thấy người dùng" });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Thay đổi vai trò tài khoản
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, sale, admin]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'sale', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: "Vai trò không hợp lệ" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role, title: role === 'sale' ? 'Chuyên viên Môi giới' : 'Khách hàng' }
    });

    res.json({ success: true, message: `Đã đổi quyền thành ${role}`, user: updatedUser });
  } catch (error) {
    console.error("Lỗi cập nhật quyền user:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/**
 * @swagger
 * /api/admin/properties/pending:
 *   get:
 *     summary: Lấy danh sách tin đăng đang chờ duyệt
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 */
router.get('/properties/pending', async (req, res) => {
  try {
    const pendingProperties = await prisma.property.findMany({
      where: { status: 'Pending' },
      include: {
        author: {
          select: { name: true, email: true }
        },
        images: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Format response
    const formatted = pendingProperties.map(p => ({
      ...p,
      images: p.images.map(img => img.url)
    }));
    
    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Lỗi lấy danh sách chờ duyệt:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/**
 * @swagger
 * /api/admin/properties/{id}/status:
 *   put:
 *     summary: Duyệt hoặc từ chối tin đăng
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Approved, Rejected]
 *     responses:
 *       200:
 *         description: Đã duyệt/từ chối thành công
 */
router.put('/properties/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ" });
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, message: `Tin đăng đã được chuyển sang ${status}`, data: updatedProperty });
  } catch (error) {
    console.error("Lỗi duyệt tin đăng:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ hoặc không tìm thấy tin đăng" });
  }
});

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Tạo tài khoản nhân viên Sale mới
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               title:
 *                 type: string
 *               performance:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/users', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { name, password, title, performance } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng điền đủ Tên, Email và Mật khẩu" });
    }

    // Kiểm tra email trùng
    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email này đã được sử dụng" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'sale',
        title: title || 'Chuyên viên Môi giới',
        performance: performance || '-',
        status: 'Active',
      },
      select: { id: true, name: true, email: true, role: true, title: true, status: true, performance: true, _count: { select: { properties: true } } }
    });

    res.status(201).json({ success: true, message: `Đã tạo tài khoản cho ${name}`, data: newUser });
  } catch (error) {
    console.error("Lỗi tạo nhân viên:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/**
 * @swagger
 * /api/admin/properties/all:
 *   get:
 *     summary: Lấy danh sách tất cả tin đăng
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 */
router.get('/properties/all', async (req, res) => {
  try {
    const allProps = await prisma.property.findMany({
      include: {
        author: { select: { name: true, email: true } },
        images: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Format response
    const formatted = allProps.map(p => ({
      ...p,
      images: p.images.map(img => img.url)
    }));
    
    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Lỗi lấy danh sách bài viết:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/**
 * @swagger
 * /api/admin/properties/{id}:
 *   delete:
 *     summary: Xóa tin đăng
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/properties/:id', async (req, res) => {
  try {
    await prisma.property.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Đã xóa tin đăng thành công" });
  } catch (error) {
    console.error("Lỗi xóa bài viết:", error);
    res.status(500).json({ success: false, message: "Không tìm thấy tin đăng hoặc lỗi máy chủ" });
  }
});

/**
 * @swagger
 * /api/admin/properties/{id}:
 *   put:
 *     summary: Chỉnh sửa thông tin tin đăng
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/properties/:id', async (req, res) => {
  try {
    const { title, price, location, beds, baths, area, description, transactionType, propertyType, legalStatus, status } = req.body;
    
    const updated = await prisma.property.update({
      where: { id: req.params.id },
      data: {
        title, price, location, description, transactionType, propertyType, legalStatus, status,
        beds: beds ? parseInt(beds) : null,
        baths: baths ? parseInt(baths) : null,
        area: area ? parseFloat(area) : null,
      }
    });
    res.json({ success: true, message: "Đã cập nhật tin đăng", data: updated });
  } catch (error) {
    console.error("Lỗi cập nhật tin đăng:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});


/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Xóa người dùng khỏi hệ thống
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }
    
    // Prisma will automatically set authorId to null in properties (onDelete: SetNull)
    await prisma.user.delete({ where: { id } });

    res.json({ success: true, message: "Đã xóa tài khoản thành công" });
  } catch (error) {
    console.error("Lỗi xóa người dùng:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin cơ bản người dùng (Tên, Email)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ tên và email" });
    }

    const normalized = normalizeEmail(email);

    // Kiểm tra trùng email (loại trừ tài khoản hiện tại)
    const existing = await prisma.user.findFirst({
      where: {
        email: { equals: normalized, mode: 'insensitive' },
        NOT: { id }
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Email này đã được sử dụng bởi tài khoản khác" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email: normalized },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true,
        status: true,
        performance: true,
        _count: {
          select: { properties: true }
        }
      }
    });

    res.json({ success: true, message: "Cập nhật thông tin thành công", data: updatedUser });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin user:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ hoặc không tìm thấy người dùng" });
  }
});

// --- QUẢN LÝ LIÊN HỆ (CONTACTS) ---

// Lấy danh sách liên hệ
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await prisma.contactRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error("Lỗi lấy danh sách liên hệ:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy danh sách liên hệ" });
  }
});

// Trả lời liên hệ của khách hàng và gửi email
router.post('/contacts/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { replyText, subject } = req.body;

    if (!replyText) {
      return res.status(400).json({ success: false, message: "Nội dung phản hồi không được để trống" });
    }

    const contact = await prisma.contactRequest.findUnique({
      where: { id }
    });

    if (!contact) {
      return res.status(404).json({ success: false, message: "Không tìm thấy yêu cầu liên hệ" });
    }

    // Gửi email cho khách hàng qua GAS
    const emailSubject = subject || `[EstateAI] Phản hồi yêu cầu: ${contact.subject}`;
    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 10px;">EstateAI Việt Nam</h2>
        <p>Xin chào <strong>${contact.name}</strong>,</p>
        <p>Chúng tôi đã nhận được yêu cầu liên hệ của bạn với nội dung:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #cbd5e1; margin-bottom: 20px; font-style: italic;">
          "${contact.message}"
        </div>
        <p><strong>Câu trả lời từ Ban quản trị EstateAI:</strong></p>
        <div style="background-color: #f0fdfa; padding: 15px; border-left: 4px solid #0f766e; margin-bottom: 20px; white-space: pre-line;">
          ${replyText}
        </div>
        <p style="margin-top: 30px;">Nếu bạn có thêm câu hỏi, vui lòng liên hệ hotline <strong>+84 987 654 321</strong>.</p>
        <p>Trân trọng,<br/><strong>Đội ngũ EstateAI Việt Nam</strong></p>
      </div>
    `;

    const mailResult = await sendMail(contact.email, emailSubject, emailHtml);
    if (!mailResult.success) {
      return res.status(500).json({ success: false, message: `Lỗi gửi email: ${mailResult.error}` });
    }

    // Cập nhật trạng thái trong DB
    const updatedContact = await prisma.contactRequest.update({
      where: { id },
      data: {
        status: 'Replied',
        replyText
      }
    });

    res.json({ success: true, message: "Đã gửi phản hồi thành công", data: updatedContact });
  } catch (error) {
    console.error("Lỗi khi phản hồi liên hệ:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi phản hồi liên hệ" });
  }
});

// Tạo liên hệ mới từ Admin
router.post('/contacts', async (req, res) => {
  try {
    const { name, email, phone, subject, message, status, replyText } = req.body;
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ các thông tin bắt buộc." });
    }
    const newContact = await prisma.contactRequest.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
        status: status || 'Pending',
        replyText
      }
    });
    res.status(201).json({ success: true, message: "Thêm khách hàng liên hệ thành công", data: newContact });
  } catch (error) {
    console.error("Lỗi thêm liên hệ từ admin:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi thêm liên hệ" });
  }
});

// Cập nhật liên hệ
router.put('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, subject, message, status, replyText } = req.body;
    const updated = await prisma.contactRequest.update({
      where: { id },
      data: { name, email, phone, subject, message, status, replyText }
    });
    res.json({ success: true, message: "Cập nhật liên hệ thành công", data: updated });
  } catch (error) {
    console.error("Lỗi cập nhật liên hệ:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi cập nhật liên hệ" });
  }
});

// Xóa liên hệ
router.delete('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contactRequest.deleteMany({
      where: { id }
    });
    res.json({ success: true, message: "Xóa liên hệ thành công" });
  } catch (error) {
    console.error("Lỗi xóa liên hệ:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi xóa liên hệ" });
  }
});

// Xóa hàng loạt liên hệ
router.post('/contacts/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Danh sách ID không hợp lệ" });
    }
    await prisma.contactRequest.deleteMany({
      where: {
        id: { in: ids }
      }
    });
    res.json({ success: true, message: "Xóa hàng loạt liên hệ thành công" });
  } catch (error) {
    console.error("Lỗi xóa hàng loạt liên hệ:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi xóa hàng loạt liên hệ" });
  }
});

// Import hàng loạt tin đăng từ CSV/Excel đã chuyển thành JSON ở frontend
router.post('/properties/import', async (req, res) => {
  try {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'Không có dữ liệu để import.' });
    }
    if (rows.length > 500) {
      return res.status(400).json({ success: false, message: 'Mỗi lần chỉ được import tối đa 500 tin.' });
    }

    const validRows = rows.filter(row => row.title && row.price && row.location);
    if (!validRows.length) {
      return res.status(400).json({ success: false, message: 'Mỗi tin cần có title, price và location.' });
    }

    const created = await prisma.$transaction(validRows.map(row => prisma.property.create({
      data: {
        title: String(row.title).trim(),
        price: String(row.price).trim(),
        location: String(row.location).trim(),
        beds: row.beds ? Number.parseInt(row.beds, 10) : null,
        baths: row.baths ? Number.parseInt(row.baths, 10) : null,
        area: row.area ? Number.parseFloat(row.area) : null,
        description: row.description ? String(row.description) : null,
        transactionType: row.transactionType || 'sale',
        propertyType: row.propertyType || 'apartment',
        legalStatus: row.legalStatus || null,
        status: row.status || 'Approved',
        images: row.imageUrl ? { create: [{ url: String(row.imageUrl).trim() }] } : undefined,
      },
    })));

    return res.status(201).json({
      success: true,
      imported: created.length,
      skipped: rows.length - validRows.length,
      message: `Đã import ${created.length} tin đăng.`,
    });
  } catch (error) {
    console.error('Lỗi import tin đăng:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi import tin đăng.' });
  }
});

// Xóa hàng loạt tin đăng bất động sản
router.post('/properties/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Danh sách ID không hợp lệ" });
    }
    // Delete related images first due to foreign keys
    await prisma.propertyImage.deleteMany({
      where: {
        propertyId: { in: ids }
      }
    });
    // Delete properties
    await prisma.property.deleteMany({
      where: {
        id: { in: ids }
      }
    });
    res.json({ success: true, message: "Xóa hàng loạt tin đăng thành công" });
  } catch (error) {
    console.error("Lỗi xóa hàng loạt tin đăng:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi xóa hàng loạt tin đăng" });
  }
});

module.exports = router;
