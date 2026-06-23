const express = require('express');
const { randomUUID } = require('crypto');
const router = express.Router();
const prisma = require('../lib/prisma');
const upload = require('../middleware/upload');

const handleNewsUpload = (req, res, next) => {
  upload.single('imageFile')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Ảnh bìa quá lớn. Vui lòng chọn ảnh dưới 10MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Không thể tải ảnh bìa.',
      });
    }
    next();
  });
};

const isMissingSourceUrlColumn = (error) => {
  const message = `${error.message || ''} ${error.meta?.message || ''}`;
  return message.includes('sourceUrl') || message.includes('source_url');
};

const createNews = async (data) => {
  try {
    return await prisma.news.create({ data });
  } catch (error) {
    if (!isMissingSourceUrlColumn(error)) throw error;
    const id = randomUUID();
    const now = new Date();
    const rows = await prisma.$queryRaw`
      INSERT INTO "News" (id, title, excerpt, content, image, category, author, featured, status, "createdAt", "updatedAt")
      VALUES (
        ${id},
        ${data.title},
        ${data.excerpt},
        ${data.content},
        ${data.image},
        ${data.category},
        ${data.author || 'Admin'},
        ${data.featured},
        ${data.status || 'Published'},
        ${now},
        ${now}
      )
      RETURNING id, title, excerpt, content, image, category, author, featured, status, "createdAt", "updatedAt"
    `;
    return { ...rows[0], sourceUrl: null };
  }
};

const updateNews = async (id, data) => {
  try {
    return await prisma.news.update({ where: { id }, data });
  } catch (error) {
    if (!isMissingSourceUrlColumn(error)) throw error;
    const rows = await prisma.$queryRaw`
      UPDATE "News"
      SET
        title = COALESCE(${data.title || null}, title),
        excerpt = COALESCE(${data.excerpt || null}, excerpt),
        content = ${data.content ?? null},
        image = COALESCE(${data.image || null}, image),
        category = COALESCE(${data.category || null}, category),
        featured = ${data.featured},
        "updatedAt" = ${new Date()}
      WHERE id = ${id}
      RETURNING id, title, excerpt, content, image, category, author, featured, status, "createdAt", "updatedAt"
    `;
    if (!rows[0]) {
      const notFound = new Error('Không tìm thấy tin tức');
      notFound.statusCode = 404;
      throw notFound;
    }
    return { ...rows[0], sourceUrl: null };
  }
};

const findNewsList = async () => {
  try {
    return await prisma.news.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    if (!isMissingSourceUrlColumn(error)) throw error;
    const rows = await prisma.$queryRaw`
      SELECT id, title, excerpt, content, image, category, author, featured, status, "createdAt", "updatedAt"
      FROM "News"
      ORDER BY "createdAt" DESC
    `;
    return rows.map(row => ({ ...row, sourceUrl: null }));
  }
};

const findNewsById = async (id) => {
  try {
    return await prisma.news.findUnique({ where: { id } });
  } catch (error) {
    if (!isMissingSourceUrlColumn(error)) throw error;
    const rows = await prisma.$queryRaw`
      SELECT id, title, excerpt, content, image, category, author, featured, status, "createdAt", "updatedAt"
      FROM "News"
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] ? { ...rows[0], sourceUrl: null } : null;
  }
};

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
    const news = await findNewsList();
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const news = await findNewsById(req.params.id);

    if (!news) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin tức' });
    }

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
router.post('/', handleNewsUpload, async (req, res) => {
  try {
    const { title, excerpt, content, image, category, featured, sourceUrl } = req.body;
    if (!title || !excerpt) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ tiêu đề và tóm tắt' });
    }

    let imageUrl = image;
    if (req.file) {
      const base64Data = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64Data}`;
    }

    const isFeatured = featured === 'true' || featured === true;

    const newNews = await createNews({
      title,
      excerpt,
      content: content || null,
      sourceUrl: sourceUrl || null,
      image: imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80',
      category: category || 'Thị trường',
      featured: isFeatured,
      author: 'Admin'
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
router.put('/:id', handleNewsUpload, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, image, category, featured, sourceUrl } = req.body;
    
    let imageUrl = image;
    if (req.file) {
      const base64Data = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64Data}`;
    }

    const isFeatured = featured === 'true' || featured === true;

    const updated = await updateNews(id, {
      ...(title && { title }),
      ...(excerpt && { excerpt }),
      content: content || null,
      sourceUrl: sourceUrl || null,
      ...(imageUrl && { image: imageUrl }),
      ...(category && { category }),
      featured: isFeatured
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

// Xóa hàng loạt tin tức
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách ID không hợp lệ' });
    }
    await prisma.news.deleteMany({
      where: {
        id: { in: ids }
      }
    });
    res.json({ success: true, message: 'Đã xóa hàng loạt tin tức thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa hàng loạt tin tức', error: error.message });
  }
});

module.exports = router;
