const multer = require('multer');

// Sử dụng memoryStorage để giữ file trên RAM (buffer), sau đó sẽ chuyển thành Base64
const storage = multer.memoryStorage();

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
    fileSize: 10 * 1024 * 1024 // Tăng giới hạn lên 10MB mỗi ảnh
  }
});

module.exports = upload;
