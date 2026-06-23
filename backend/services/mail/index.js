const nodemailer = require('nodemailer');
const { env } = require('../../config/env');

let transporterPromise;

const createTransporter = async () => {
  if (env.smtp.host) {
    if (!env.smtp.user || !env.smtp.pass) {
      throw new Error('SMTP_USER hoặc SMTP_PASS chưa được cấu hình');
    }

    const transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass.replace(/\s+/g, ''), // Xoá khoảng trắng trong App Password
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      pool: true,
      maxConnections: 2,
      maxMessages: 50,
    });

    await transporter.verify();
    return transporter;
  }

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

const getTransporter = () => {
  if (!transporterPromise) {
    transporterPromise = createTransporter().catch(error => {
      transporterPromise = null;
      throw error;
    });
  }
  return transporterPromise;
};

const closeMailTransporter = async () => {
  if (!transporterPromise) return;
  const transporter = await transporterPromise.catch(() => null);
  if (transporter?.close) transporter.close();
  transporterPromise = null;
};

/**
 * Gửi email chung cho hệ thống
 * @param {string} to - Địa chỉ người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} htmlContent - Nội dung email (HTML)
 */
const sendMail = async (to, subject, htmlContent) => {
  try {
    // Trong môi trường production, nếu chưa có SMTP_HOST thì báo lỗi ngay
    if (env.nodeEnv === 'production' && !env.smtp.host) {
      throw new Error('Chưa cấu hình biến môi trường SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS) trên server (Render/Vercel).');
    }

    const transporter = await getTransporter();
    
    const info = await transporter.sendMail({
      from: `"EstateAI Vietnam" <${env.smtp.from}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("✅ Message sent: %s", info.messageId);
    
    // Nếu dùng Ethereal, cung cấp link xem trước email trên terminal
    if (!env.smtp.host) {
      console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Send email error:", error);
    // Trả về chi tiết lỗi để API có thể báo cáo rõ ràng
    return { 
      success: false, 
      error: error.message || 'Lỗi gửi email không xác định',
      code: error.code || 'UNKNOWN'
    };
  }
};

module.exports = {
  sendMail,
  closeMailTransporter,
};
