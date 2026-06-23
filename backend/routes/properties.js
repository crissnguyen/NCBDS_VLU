const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const upload = require('../middleware/upload');
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     Property:
 *       type: object
 *       required:
 *         - title
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: ID tự sinh của bất động sản
 *         title:
 *           type: string
 *           description: Tiêu đề tin đăng
 *         price:
 *           type: string
 *           description: Mức giá
 *         location:
 *           type: string
 *           description: Khu vực
 *         beds:
 *           type: integer
 *         baths:
 *           type: integer
 *         area:
 *           type: number
 *       example:
 *         id: "1"
 *         title: "Căn hộ 2PN Lộc Thọ view biển"
 *         price: "2.85 Tỷ"
 *         location: "Lộc Thọ, Nha Trang"
 *         beds: 2
 *         baths: 2
 *         area: 68
 */

/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: Quản lý danh mục Bất động sản
 */

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Lấy danh sách toàn bộ bất động sản
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: Trả về danh sách bất động sản
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 */
router.get('/', async (req, res) => {
  try {
    const { authorId } = req.query;
    let whereClause = { status: 'Approved' };

    // Nếu có truyền authorId thì lấy tất cả tin của tác giả đó (không quan tâm status)
    if (authorId) {
      whereClause = { authorId };
    }

    const properties = await prisma.property.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    res.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: "Lỗi máy chủ khi lấy danh sách bất động sản" });
  }
});

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Lấy chi tiết bất động sản theo ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của bất động sản
 *     responses:
 *       200:
 *         description: Trả về thông tin chi tiết
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       404:
 *         description: Không tìm thấy bất động sản
 */
router.get('/:id', async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id }
    });
    
    if (!property) {
      return res.status(404).json({ error: "Không tìm thấy bất động sản" });
    }
    
    res.json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Tạo một tin đăng bất động sản mới (Hỗ trợ upload ảnh)
 *     tags: [Properties]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: string
 *               location:
 *                 type: string
 *               beds:
 *                 type: integer
 *               baths:
 *                 type: integer
 *               area:
 *                 type: number
 *               description:
 *                 type: string
 *               transactionType:
 *                 type: string
 *               propertyType:
 *                 type: string
 *               legalStatus:
 *                 type: string
 *               authorId:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Đã tạo thành công
 */
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const { title, price, location, beds, baths, area, description, transactionType, propertyType, legalStatus, authorId } = req.body;
    // Mã hoá các file ảnh thành chuỗi Base64 để lưu thẳng vào DB
    const imagePaths = req.files ? req.files.map(file => {
      const base64Data = file.buffer.toString('base64');
      return `data:${file.mimetype};base64,${base64Data}`;
    }) : [];

    const property = await prisma.property.create({
      data: {
        title,
        price,
        location,
        beds: beds ? parseInt(beds) : null,
        baths: baths ? parseInt(baths) : null,
        area: area ? parseFloat(area) : null,
        description,
        transactionType,
        propertyType,
        legalStatus,
        authorId,
        images: imagePaths,
        status: req.body.status || 'Pending' // Admin tin tự duyệt truyền vào 'Approved'
      }
    });
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    console.error("Lỗi tạo property:", error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
});

module.exports = router;
