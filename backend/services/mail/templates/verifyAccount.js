/**
 * Mẫu email Xác thực tài khoản
 * @param {string} code - Mã xác thực 6 chữ số
 * @param {string} name - Tên người dùng
 * @returns {string} Chuỗi HTML của email
 */
function verifyAccountTemplate(code, name) {
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Xác thực tài khoản - EstateAI</title>
      <style>
        body {
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333333;
          background-color: #f4f7f6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        .header {
          background: linear-gradient(135deg, #0f2a44, #0f766e);
          color: #ffffff;
          padding: 30px 40px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .content {
          padding: 40px;
        }
        .content p {
          margin-bottom: 20px;
          font-size: 16px;
        }
        .verification-code-container {
          text-align: center;
          margin: 30px 0;
        }
        .verification-code {
          display: inline-block;
          font-size: 36px;
          font-weight: 800;
          letter-spacing: 5px;
          color: #0f766e;
          background-color: #f0fdf4;
          padding: 15px 30px;
          border-radius: 8px;
          border: 2px dashed #86efac;
        }
        .warning {
          font-size: 14px;
          color: #666666;
          background-color: #f8f9fa;
          padding: 15px;
          border-left: 4px solid #f59e0b;
          border-radius: 4px;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px 40px;
          text-align: center;
          font-size: 14px;
          color: #888888;
          border-top: 1px solid #eeeeee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>EstateAI Vietnam</h1>
        </div>
        <div class="content">
          <p>Chào <strong>${name}</strong>,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại EstateAI. Để hoàn tất việc đăng ký, vui lòng sử dụng mã xác thực dưới đây:</p>
          
          <div class="verification-code-container">
            <div class="verification-code">${code}</div>
          </div>
          
          <p>Mã xác thực này có hiệu lực trong <strong>15 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
          
          <div class="warning">
            <p style="margin: 0;">Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này. Tài khoản sẽ không được kích hoạt nếu không có mã xác thực.</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} EstateAI. Mọi quyền được bảo lưu.</p>
          <p>Email này được tạo tự động, vui lòng không trả lời.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
  
  module.exports = {
    verifyAccountTemplate
  };
