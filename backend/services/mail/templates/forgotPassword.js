/**
 * Mẫu email Quên mật khẩu
 * @param {string} resetLink - Đường dẫn khôi phục mật khẩu
 * @param {string} userName - Tên người dùng (tuỳ chọn)
 * @returns {string} Chuỗi HTML của email
 */
const forgotPasswordTemplate = (resetLink, userName = 'bạn') => {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Khôi phục mật khẩu - EstateAI</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
          color: #0f172a;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        .header {
          background-color: #0f766e;
          padding: 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
          line-height: 1.6;
        }
        .content p {
          margin-top: 0;
          margin-bottom: 20px;
          color: #334155;
          font-size: 16px;
        }
        .btn-wrapper {
          text-align: center;
          margin: 35px 0;
        }
        .btn {
          display: inline-block;
          background-color: #0f766e;
          color: #ffffff;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
        }
        .btn:hover {
          background-color: #115e59;
        }
        .footer {
          background-color: #f1f5f9;
          padding: 20px;
          text-align: center;
          font-size: 13px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>EstateAI Vietnam</h1>
        </div>
        <div class="content">
          <p>Chào ${userName},</p>
          <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn tại <strong>EstateAI</strong>.</p>
          <p>Vui lòng nhấn vào nút bên dưới để thiết lập lại mật khẩu mới. Đường dẫn này sẽ hết hạn sau 24 giờ.</p>
          
          <div class="btn-wrapper">
            <a href="${resetLink}" class="btn" style="color: #ffffff;">Thiết lập mật khẩu mới</a>
          </div>
          
          <p>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này hoặc liên hệ với chúng tôi nếu cần hỗ trợ bảo mật.</p>
          <p>Trân trọng,<br>Đội ngũ EstateAI</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} EstateAI Vietnam. All rights reserved.</p>
          <p>Email này được gửi tự động. Vui lòng không trả lời.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  forgotPasswordTemplate
};
