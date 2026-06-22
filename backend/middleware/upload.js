const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Cấu hình nơi lưu trữ file và tên file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Thư mục lưu trữ ảnh (cần đảm bảo thư mục này tồn tại)
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Tạo tên file ngẫu nhiên để tránh trùng lặp
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Kiểm tra loại file (chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép tải lên file ảnh (jpeg, png, etc.)'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB mỗi ảnh
  }
});

module.exports = upload;
