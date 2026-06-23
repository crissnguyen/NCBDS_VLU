const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary sẽ tự động nhận CLOUDINARY_URL từ file .env
// Ví dụ: CLOUDINARY_URL=cloudinary://my_key:my_secret@my_cloud_name

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'estateai_uploads', // Tên thư mục trên Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }] // Tự động nén ảnh để load nhanh
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB mỗi ảnh
  }
});

module.exports = upload;
