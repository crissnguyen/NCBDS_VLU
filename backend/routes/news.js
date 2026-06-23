const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

/**
 * @swagger
 * tags:
 *   name: News
 *   description: Quản lý tin tức
 */

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Lấy danh sách tin tức
 *     tags: [News]
 *     responses:
 *       200:
 *         description: Trả về danh sách tin tức
 */
router.get('/', async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Tạo tin tức mới (Dành cho admin)
 *     tags: [News]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *               category:
 *                 type: string
 *               featured:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Tạo tin tức thành công
 */
router.post('/', async (req, res) => {
  try {
    const { title, excerpt, content, image, category, featured } = req.body;
    if (!title || !excerpt) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ tiêu đề và tóm tắt' });
    }

    const newNews = await prisma.news.create({
      data: {
        title,
        excerpt,
        content,
        image: image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80',
        category: category || 'Thị trường',
        featured: featured || false,
        author: 'Admin'
      }
    });

    res.status(201).json({ success: true, data: newNews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

/**
 * @swagger
 * /api/news/{id}:
 *   put:
 *     summary: Cập nhật tin tức
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               image:
 *                 type: string
 *               category:
 *                 type: string
 *               featured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updated = await prisma.news.update({
      where: { id },
      data
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

/**
 * @swagger
 * /api/news/{id}:
 *   delete:
 *     summary: Xóa tin tức
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.news.delete({ where: { id } });
    res.json({ success: true, message: 'Đã xóa tin tức' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;
