const fs = require('fs');

const path = 'routes/admin.js';
let content = fs.readFileSync(path, 'utf8');

const deleteEndpoint = `
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

module.exports = router;
`;

content = content.replace('module.exports = router;', deleteEndpoint);

fs.writeFileSync(path, content, 'utf8');
console.log('Patched admin.js');
