const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendMail } = require('../services/mail');
const { forgotPasswordTemplate } = require('../services/mail/templates/forgotPassword');
const { verifyAccountTemplate } = require('../services/mail/templates/verifyAccount');

const prisma = new PrismaClient();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Xác thực tài khoản
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập vào hệ thống
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       400:
 *         description: Thiếu thông tin
 *       401:
 *         description: Sai email hoặc mật khẩu
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập email và mật khẩu" });
    }
    
    // Tìm user trong DB
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu" });
    }
    
    // Kiểm tra xác thực email
    if (user.isVerified === false) {
      return res.status(403).json({ 
        success: false, 
        message: "Tài khoản chưa được xác thực email", 
        requireVerification: true, 
        email: user.email 
      });
    }
    
    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu" });
    }
    
    // Trả về thông tin user (không bao gồm password)
    const { password: _, ...userInfo } = user;
    
    res.json({
      success: true,
      message: "Đăng nhập thành công",
      user: userInfo
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 *       400:
 *         description: Lỗi đầu vào
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đủ thông tin" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email đã tồn tại" });
    }

    // Sinh mã xác thực 6 số
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'user', // Default role for public registration
        title: 'User',
        isVerified: false,
        verificationCode,
        verificationCodeExpiry
      }
    });

    // Gửi email
    const htmlContent = verifyAccountTemplate(verificationCode, name);
    const mailResult = await sendMail(email, "Xác thực tài khoản - EstateAI", htmlContent);
    
    if (!mailResult.success) {
      console.error("Gửi email xác thực thất bại", mailResult.error);
    }

    res.json({
      success: true,
      message: "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác thực.",
      requireVerification: true,
      email: newUser.email
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Xác thực tài khoản bằng mã OTP
 *     tags: [Auth]
 */
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đủ thông tin" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Tài khoản đã được xác thực" });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ success: false, message: "Mã xác thực không chính xác" });
    }

    if (user.verificationCodeExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "Mã xác thực đã hết hạn" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null
      }
    });

    res.json({ success: true, message: "Xác thực thành công. Bạn có thể đăng nhập ngay bây giờ." });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Gửi lại mã xác thực
 *     tags: [Auth]
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Thiếu email" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    if (user.isVerified) return res.status(400).json({ success: false, message: "Tài khoản đã được xác thực" });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode, verificationCodeExpiry }
    });

    const htmlContent = verifyAccountTemplate(verificationCode, user.name || "bạn");
    await sendMail(email, "Xác thực tài khoản - EstateAI", htmlContent);

    res.json({ success: true, message: "Đã gửi lại mã xác thực" });
  } catch (error) {
    console.error("Resend error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Quên mật khẩu
 *     tags: [Auth]
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập email" });
    }
    
    // Tìm user trong DB để lấy tên
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (user) {
      // Sinh token ngẫu nhiên
      const resetToken = crypto.randomBytes(32).toString('hex');
      // Băm token (bảo mật hơn khi lưu ở DB)
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      
      // Token có hiệu lực 1 giờ (3600000 ms)
      const resetTokenExpiry = new Date(Date.now() + 3600000);
      
      // Lưu vào DB
      await prisma.user.update({
        where: { email },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry,
        }
      });
      
      // Gửi link chứa token chưa băm cho người dùng
      const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
      const htmlContent = forgotPasswordTemplate(resetLink, user.name || 'bạn');
      
      // Gửi email không chặn (fire-and-forget hoặc await tùy nhu cầu, ở đây ta await để dễ debug Ethereal)
      const mailResult = await sendMail(email, "Khôi phục mật khẩu - EstateAI", htmlContent);
      
      if (!mailResult.success) {
        console.error("Gửi email thất bại", mailResult.error);
        // Tùy chọn xử lý lỗi gửi mail, nhưng tốt nhất vẫn báo thành công cho người dùng
      }
    }
    
    res.json({
      success: true,
      message: "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết khôi phục."
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu bằng Token
 *     tags: [Auth]
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    
    if (!token || !email || !newPassword) {
      return res.status(400).json({ success: false, message: "Thông tin không hợp lệ" });
    }
    
    // Băm token do user gửi lên để so sánh với DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await prisma.user.findFirst({
      where: {
        email,
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date() // Token phải còn hạn (lớn hơn thời gian hiện tại)
        }
      }
    });
    
    if (!user) {
      return res.status(400).json({ success: false, message: "Link khôi phục không hợp lệ hoặc đã hết hạn" });
    }
    
    // Mã hoá mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Cập nhật mật khẩu và xoá token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    
    res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."
    });
    
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Cập nhật thông tin cá nhân
 *     tags: [Auth]
 */
router.put('/profile', async (req, res) => {
  try {
    const { id, name, password } = req.body;
    
    if (!id || !name) {
      return res.status(400).json({ success: false, message: "Thiếu ID hoặc Tên hiển thị" });
    }
    
    const updateData = { name };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });
    
    const { password: _, ...userInfo } = updatedUser;
    
    res.json({
      success: true,
      message: "Cập nhật hồ sơ thành công",
      user: userInfo
    });
    
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});


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

