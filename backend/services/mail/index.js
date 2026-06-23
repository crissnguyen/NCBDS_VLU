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
    // Gọi Google Apps Script Web App để lách luật chặn port của Render
    const GAS_URL = "https://script.google.com/macros/s/AKfycbzqHyQOokV_eHulqr7ael5snUuRXfSnzqjIqH0hexk494HO_L6t0ZY87i2s-2H-d2s/exec";
    
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: to,
        subject: subject,
        htmlBody: htmlContent,
        secret: "ESTATE_AI_SECRET_2026"
      })
    });

    const textResult = await response.text();
    let result;
    try {
      result = JSON.parse(textResult);
    } catch(e) {
      throw new Error("Lỗi phản hồi từ Google: " + textResult.substring(0, 100));
    }

    if (!result.success) {
      throw new Error(result.error || "Lỗi không xác định từ Google Apps Script");
    }

    console.log("✅ Message sent via GAS Proxy");
    return { success: true, messageId: `gas-${Date.now()}` };

  } catch (error) {
    console.error("❌ Send email error via GAS:", error);
    return { 
      success: false, 
      error: error.message || 'Lỗi gửi email qua GAS',
      code: error.code || 'UNKNOWN'
    };
  }
};

module.exports = {
  sendMail,
  closeMailTransporter,
};
