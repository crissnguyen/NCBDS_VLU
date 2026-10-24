# Nhập tài liệu vào tin bất động sản

Trong **Đăng tin mới**, chọn **Điền tin từ tài liệu → Chọn tài liệu**. Hỗ trợ PDF có chữ, DOCX, TXT và Markdown, tối đa 5MB/file, 30 trang PDF và 30.000 ký tự. Mỗi file dùng cho một bất động sản.

Hệ thống đọc chữ, nhận diện các trường, rồi hiển thị bản xem trước có thể sửa. Chọn **Áp dụng vào bài đăng** để điền form, bổ sung ảnh và đăng theo luồng duyệt hiện tại. Nhập tài liệu không tự tạo bài đăng. Có tùy chọn chỉ điền trường trống để giữ dữ liệu đã nhập.

Các trường hỗ trợ: tiêu đề, giao dịch, loại bất động sản, địa chỉ đầy đủ, giá và đơn vị, diện tích, phòng ngủ, phòng tắm, pháp lý, mô tả. Đề mục, đoạn văn và danh sách trong mô tả được hiển thị thành bố cục bài. Hệ thống không tái tạo nguyên trang PDF, phông chữ, cột, màu hay ảnh nhúng; ảnh bất động sản được tải riêng. PDF scan ảnh cần OCR trước.

## Chuẩn bị tài liệu

Dùng nhãn rõ ràng, ví dụ `Giá: 2,85 tỷ`, `Diện tích: 68 m²`, `Địa chỉ: Phường Lộc Thọ, Nha Trang, Khánh Hòa`. Nhãn và giá trị cũng có thể nằm ở hai dòng liên tiếp. Đặt các mục nội dung bên dưới `Mô tả chi tiết:`. Mẫu Word có tại `Web/public/mau-tai-lieu-bat-dong-san.docx` và có thể tải trực tiếp trên form bằng nút **Tải mẫu Word (.docx)**. Chỉnh thông tin trong Word rồi lưu dưới dạng `.docx` để nhập lại.

Không bắt buộc khóa AI đối với tài liệu theo nhãn. Nếu cấu hình `GEMINI_API_KEY` (hoặc các tên khóa Gemini đã hỗ trợ) và `GEMINI_MODEL`, hệ thống gửi nội dung chữ đã đọc tới Gemini để bổ sung trường chưa nhận diện. AI không viết lại mô tả và không thay thế các trường đã nhận diện theo nhãn. Nếu AI lỗi hoặc quá thời gian, bản xem trước vẫn dùng kết quả theo nhãn kèm thông báo. Luôn kiểm tra kết quả nhận diện trước khi đăng.

## API và triển khai

- Cài dependencies mới với `npm ci` trong `backend`, sau đó khởi động lại backend; build frontend với `npm run build` trong `Web`. PDF parser yêu cầu Node.js 20.16+ hoặc 22.3+.
- `POST /api/properties/import-document`, `multipart/form-data`, một file ở trường `document`.
- Yêu cầu đăng nhập với vai trò `admin` hoặc `sale`; dùng cơ chế xác thực hiện tại. Giới hạn 20 lần/15 phút/IP.
- Trả về `{ success, data: { property, text, method, missingFields, warnings } }`. Không lưu tài liệu hoặc ghi database ở bước đọc.
- PDF/DOCX được xử lý trong worker giới hạn bộ nhớ và thời gian. API từ chối file quá lớn, quá dài, không có chữ, PDF yêu cầu mật khẩu hoặc tài liệu không hợp lệ.
- Không cần thay đổi Prisma schema hoặc chạy migration.

## Kiểm thử

```sh
cd backend
node --test services/documents/propertyImport.test.js routes/propertyDocuments.test.js services/ai/listingScore.test.js
cd ../Web
node --test tests/propertyDescription.test.js
npm run build
```

Kiểm thử API sử dụng cổng localhost tạm thời, token kiểm thử và tắt AI trong tiến trình kiểm thử; không tạo bài hoặc sửa dữ liệu thật. Fixtures PDF và DOCX là dữ liệu mẫu tổng hợp.
