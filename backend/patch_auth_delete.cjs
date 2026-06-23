const fs = require('fs');

const path = 'routes/auth.js';
let content = fs.readFileSync(path, 'utf8');

const deleteEndpoint = `
/**
 * @swagger
 * /api/auth/profile:
 *   delete:
 *     summary: Xóa tài khoản của chính mình
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/profile', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Thiếu email để xác thực xóa" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }
    
    // Xóa user
    await prisma.user.delete({ where: { email } });

    res.json({ success: true, message: "Đã xóa tài khoản vĩnh viễn" });
  } catch (error) {
    console.error("Lỗi xóa profile:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

module.exports = router;
`;

content = content.replace('module.exports = router;', deleteEndpoint);

fs.writeFileSync(path, content, 'utf8');
console.log('Patched auth.js');
