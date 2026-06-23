const nodemailer = require('nodemailer');

// Khởi tạo transporter
// Sử dụng các biến môi trường để cấu hình linh hoạt (có thể dùng Gmail, SendGrid, Mailgun...)
// Mặc định cho phát triển, nếu không có config sẽ in ra cảnh báo hoặc dùng config test
const createTransporter = async () => {
  // Nếu có cấu hình SMTP thực tế trong .env
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true cho port 465, false cho các port khác
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Nếu không có, tự động tạo tài khoản test Ethereal để phát triển
  console.log("⚠️  Chưa cấu hình SMTP. Hệ thống sẽ tạo Ethereal Email test account...");
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

/**
 * Gửi email chung cho hệ thống
 * @param {string} to - Địa chỉ người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} htmlContent - Nội dung email (HTML)
 */
const sendMail = async (to, subject, htmlContent) => {
  try {
    const transporter = await createTransporter();
    
    const info = await transporter.sendMail({
      from: `"EstateAI Vietnam" <${process.env.SMTP_FROM || 'no-reply@estateai.vn'}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("✅ Message sent: %s", info.messageId);
    
    // Nếu dùng Ethereal, cung cấp link xem trước email trên terminal
    if (!process.env.SMTP_HOST) {
      console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Send email error:", error);
    return { success: false, error };
  }
};

module.exports = {
  sendMail
};
