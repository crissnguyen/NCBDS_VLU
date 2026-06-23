const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { env } = require('../config/env');
const { sendMail } = require('../services/mail');
const { forgotPasswordTemplate } = require('../services/mail/templates/forgotPassword');
const { verifyAccountTemplate } = require('../services/mail/templates/verifyAccount');
const {
  normalizeEmail,
  normalizeOtp,
  createOtp,
  hashOtp,
  hashToken,
  otpMatches,
  getOtpExpiry,
  sanitizeUser,
} = require('../utils/auth');

const findUserByEmail = (email) => prisma.user.findFirst({
  where: {
    email: {
      equals: normalizeEmail(email),
      mode: 'insensitive',
    },
  },
});

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
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập email và mật khẩu" });
    }
    
    // Tìm user trong DB
    const user = await findUserByEmail(email);
    
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
    res.json({
      success: true,
      message: "Đăng nhập thành công",
      user: sanitizeUser(user)
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
    const email = normalizeEmail(req.body.email);
    const { password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đủ thông tin" });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      if (!existingUser.isVerified) {
        const otp = createOtp();
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            verificationCode: hashOtp(otp),
            verificationCodeExpiry: getOtpExpiry(15),
          },
        });

        const htmlContent = verifyAccountTemplate(otp, existingUser.name || name || 'bạn');
        const mailResult = await sendMail(existingUser.email, "Xác thực tài khoản - EstateAI", htmlContent);

        if (!mailResult.success) {
          console.error("Gửi email xác thực cho tài khoản chưa kích hoạt thất bại", mailResult.error);
          return res.status(502).json({
            success: false,
            message: "Tài khoản đã tồn tại nhưng chưa xác thực. Không gửi được email xác thực, vui lòng thử lại sau.",
            errorDetail: mailResult.error // Thêm chi tiết lỗi
          });
        }

        return res.json({
          success: true,
          message: "Tài khoản đã tồn tại nhưng chưa xác thực. Mã xác thực mới đã được gửi đến email.",
          requireVerification: true,
          email: existingUser.email,
        });
      }

      return res.status(400).json({ success: false, message: "Email đã tồn tại" });
    }

    const otp = createOtp();
    const verificationCode = hashOtp(otp);
    const verificationCodeExpiry = getOtpExpiry(15);

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

    const htmlContent = verifyAccountTemplate(otp, name);
    const mailResult = await sendMail(email, "Xác thực tài khoản - EstateAI", htmlContent);
    
    if (!mailResult.success) {
      console.error("Gửi email xác thực thất bại", mailResult.error);
      return res.status(502).json({
        success: false,
        message: "Không gửi được email xác thực. Vui lòng kiểm tra cấu hình SMTP hoặc thử gửi lại sau.",
        errorDetail: mailResult.error // Thêm dòng này để dễ debug khi deploy
      });
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
    const email = normalizeEmail(req.body.email);
    const code = normalizeOtp(req.body.code);
    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đủ thông tin" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Tài khoản đã được xác thực" });
    }

    if (!otpMatches(user.verificationCode, code)) {
      return res.status(400).json({ success: false, message: "Mã xác thực không chính xác" });
    }

    if (!user.verificationCodeExpiry || user.verificationCodeExpiry < new Date()) {
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
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ success: false, message: "Thiếu email" });

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    if (user.isVerified) return res.status(400).json({ success: false, message: "Tài khoản đã được xác thực" });

    const otp = createOtp();
    const verificationCode = hashOtp(otp);
    const verificationCodeExpiry = getOtpExpiry(15);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode, verificationCodeExpiry }
    });

    const htmlContent = verifyAccountTemplate(otp, user.name || "bạn");
    const mailResult = await sendMail(email, "Xác thực tài khoản - EstateAI", htmlContent);

    if (!mailResult.success) {
      console.error("Gửi lại email xác thực thất bại", mailResult.error);
      return res.status(502).json({
        success: false,
        message: "Không gửi được email xác thực. Vui lòng thử lại sau.",
        errorDetail: mailResult.error // Thêm chi tiết lỗi
      });
    }

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
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập email" });
    }
    
    // Tìm user trong DB để lấy tên
    const user = await findUserByEmail(email);
    
    if (user) {
      // Sinh token ngẫu nhiên
      const resetToken = crypto.randomBytes(32).toString('hex');
      // Băm token (bảo mật hơn khi lưu ở DB)
      const hashedToken = hashToken(resetToken);
      
      // Token có hiệu lực 1 giờ (3600000 ms)
      const resetTokenExpiry = new Date(Date.now() + 3600000);
      
      // Lưu vào DB
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry,
        }
      });
      
      // Gửi link chứa token chưa băm cho người dùng
      const resetLink = `${env.frontendUrl.replace(/\/$/, '')}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
      const htmlContent = forgotPasswordTemplate(resetLink, user.name || 'bạn');
      
      // Gửi email không chặn (fire-and-forget hoặc await tùy nhu cầu, ở đây ta await để dễ debug Ethereal)
      const mailResult = await sendMail(user.email, "Khôi phục mật khẩu - EstateAI", htmlContent);
      
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
    const { token, newPassword } = req.body;
    const email = normalizeEmail(req.body.email);
    
    if (!token || !email || !newPassword) {
      return res.status(400).json({ success: false, message: "Thông tin không hợp lệ" });
    }
    
    // Băm token do user gửi lên để so sánh với DB
    const hashedToken = hashToken(token);
    
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
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
    const email = normalizeEmail(req.body.email);
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Thiếu email để xác thực xóa" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }
    
    // Xóa user
    await prisma.user.delete({ where: { id: user.id } });

    res.json({ success: true, message: "Đã xóa tài khoản vĩnh viễn" });
  } catch (error) {
    console.error("Lỗi xóa profile:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

module.exports = router;
