const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: pendingProperties });
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
  const bcrypt = require('bcryptjs');
  try {
    const { name, email, password, title, performance } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng điền đủ Tên, Email và Mật khẩu" });
    }

    // Kiểm tra email trùng
    const existing = await prisma.user.findUnique({ where: { email } });
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
        author: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: allProps });
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

module.exports = router;

