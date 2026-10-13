# 📋 TÀI LIỆU TEST HỆ THỐNG EstateAI
## Phiên bản: 2.0 | Ngày tạo: 13/10/2026
### Base URL API: `http://localhost:5001` | Frontend: `http://localhost:5173`
### Swagger UI: `http://localhost:5001/api-docs`

---

> **Quy ước Trạng thái:**
> | Ký hiệu | Ý nghĩa |
> |---------|---------|
> | ⬜ | Chưa test |
> | ✅ | Pass – Kết quả đúng kỳ vọng |
> | ❌ | Fail – Kết quả sai |
> | ⚠️ | Partial – Một phần đúng / có bug nhỏ |
> | 🔁 | Cần test lại sau khi fix |

---

## 📌 MỤC LỤC

1. [Tài khoản Test & Dữ liệu Mẫu](#1-tài-khoản-test--dữ-liệu-mẫu)
2. [Module AUTH – Xác thực Tài khoản](#2-module-auth--xác-thực-tài-khoản)
3. [Module PROPERTIES – Tin đăng Bất động sản](#3-module-properties--tin-đăng-bất-động-sản)
4. [Module AI – Trí tuệ Nhân tạo](#4-module-ai--trí-tuệ-nhân-tạo)
5. [Module LEADS/CRM – Quản lý Khách hàng Tiềm năng](#5-module-leadscrm--quản-lý-khách-hàng-tiềm-năng)
6. [Module ADMIN – Quản trị Hệ thống](#6-module-admin--quản-trị-hệ-thống)
7. [Module CONTACTS – Liên hệ Khách hàng](#7-module-contacts--liên-hệ-khách-hàng)
8. [Module NEWS – Tin tức Thị trường](#8-module-news--tin-tức-thị-trường)
9. [Phân quyền RBAC – Kiểm tra Chéo Role](#9-phân-quyền-rbac--kiểm-tra-chéo-role)
10. [Giao diện & UX Frontend](#10-giao-diện--ux-frontend)
11. [Test Kịch bản End-to-End (E2E)](#11-test-kịch-bản-end-to-end-e2e)
12. [Checklist Nhanh Trước Demo](#12-checklist-nhanh-trước-demo)
13. [Bảng Tổng kết & Theo dõi Bug](#13-bảng-tổng-kết--theo-dõi-bug)
14. [Lệnh cURL Mẫu & Hướng dẫn Công cụ](#14-lệnh-curl-mẫu--hướng-dẫn-công-cụ)

---

## 1. Tài khoản Test & Dữ liệu Mẫu

### 1.1 Tài khoản Test Cần Tạo Sẵn

> ⚠️ **Tạo các tài khoản này trong DB trước khi bắt đầu test bất kỳ module nào.**
> **Mật khẩu chung cho tất cả: `Test@12345`**

| STT | Email | Role DB | Status | isVerified | Mục đích sử dụng |
|-----|-------|---------|--------|------------|-----------------|
| 1 | `admin@estateai.vn` | `admin` | `Active` | `true` | Test toàn bộ chức năng Admin |
| 2 | `sale01@estateai.vn` | `sale` | `Active` | `true` | Test chức năng Broker chính |
| 3 | `sale02@estateai.vn` | `sale` | `Active` | `true` | Test phân công CRM / lead giao chéo |
| 4 | `client@estateai.vn` | `user` | `Active` | `true` | Test role khách hàng |
| 5 | `locked@estateai.vn` | `user` | `Locked` | `true` | Test tài khoản bị khóa |
| 6 | `unverified@estateai.vn` | `user` | `Pending` | `false` | Test chưa xác thực email |
| 7 | `newtest_[timestamp]@gmail.com` | — | — | — | Test đăng ký mới (dùng email tươi mỗi lần) |

### 1.2 Dữ liệu Test Mẫu – Tin đăng BĐS

**Tin chất lượng CAO (kỳ vọng ≥ 80 điểm AI):**
```json
{
  "title": "Bán căn hộ 2PN 75m2 Masteri Centre Point Quận 9 có sổ hồng",
  "transactionType": "sale",
  "propertyType": "apartment",
  "location": "Quận 9, TP.HCM",
  "price": "3.5 tỷ",
  "area": "75",
  "beds": "2",
  "baths": "2",
  "legalStatus": "Sổ hồng riêng",
  "description": "Căn hộ Masteri Centre Point tầng cao view công viên, nội thất đầy đủ bao gồm tủ bếp, máy lạnh, máy nước nóng. Pháp lý sổ hồng riêng rõ ràng, thuận tiện vay ngân hàng. Khu căn hộ cao cấp với đầy đủ tiện ích hồ bơi, gym, công viên nội khu. Vị trí gần Vincom Mega Mall và trường học quốc tế. Phù hợp ở thực hoặc đầu tư cho thuê dài hạn.",
  "imageCount": 5
}
```

**Tin chất lượng THẤP (kỳ vọng < 60 điểm AI):**
```json
{
  "title": "Nhà đẹp",
  "transactionType": "sale",
  "propertyType": "house",
  "location": "HCM",
  "price": "5 ty",
  "area": "",
  "beds": "",
  "baths": "",
  "legalStatus": "",
  "description": "Nhà đẹp cần bán gấp liên hệ ngay",
  "imageCount": 0
}
```

**Tin cho thuê mẫu:**
```json
{
  "title": "Cho thuê phòng trọ quận Bình Thạnh 25m2 đầy đủ nội thất",
  "transactionType": "rent",
  "propertyType": "apartment",
  "location": "Quận Bình Thạnh, TP.HCM",
  "price": "5 triệu/tháng",
  "area": "25",
  "beds": "1",
  "baths": "1",
  "legalStatus": "",
  "description": "Phòng trọ cao cấp trong tòa nhà quản lý chuyên nghiệp, diện tích 25m2. Nội thất đầy đủ: giường, tủ, bếp, máy nước nóng, máy lạnh. An ninh 24/7, camera giám sát. Giá đã bao gồm điện nước, internet. Gần chợ Bình Thạnh, siêu thị Co.op Mart.",
  "imageCount": 3
}
```

---

## 2. Module AUTH – Xác thực Tài khoản

### 2.1 Đăng nhập `POST /api/auth/login`

| ID | Kịch bản | Input Body | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|------------|-------------------|-----------------|--------|
| AUTH-01 | Đăng nhập Admin hợp lệ | `{"email":"admin@estateai.vn","password":"Test@12345"}` | `200` | `success:true`, `user.role:"admin"`, `user.status:"Active"` | ⬜ |
| AUTH-02 | Đăng nhập Sale hợp lệ | `{"email":"sale01@estateai.vn","password":"Test@12345"}` | `200` | `success:true`, `user.role:"sale"` | ⬜ |
| AUTH-03 | Đăng nhập Client hợp lệ | `{"email":"client@estateai.vn","password":"Test@12345"}` | `200` | `success:true`, `user.role:"user"` | ⬜ |
| AUTH-04 | Sai mật khẩu | `{"email":"admin@estateai.vn","password":"wrongpass"}` | `401` | `"Sai email hoặc mật khẩu"` | ⬜ |
| AUTH-05 | Email không tồn tại | `{"email":"ghost@test.vn","password":"Test@12345"}` | `401` | `"Sai email hoặc mật khẩu"` | ⬜ |
| AUTH-06 | Tài khoản bị Locked | `{"email":"locked@estateai.vn","password":"Test@12345"}` | `403` | `"Tài khoản đã bị khóa"` | ⬜ |
| AUTH-07 | Tài khoản chưa xác thực | `{"email":"unverified@estateai.vn","password":"Test@12345"}` | `403` | `"Tài khoản chưa được xác thực email"`, `requireVerification:true`, `email` trả về | ⬜ |
| AUTH-08 | Thiếu email | `{"password":"Test@12345"}` | `400` | `"Vui lòng nhập email và mật khẩu"` | ⬜ |
| AUTH-09 | Thiếu password | `{"email":"admin@estateai.vn"}` | `400` | `"Vui lòng nhập email và mật khẩu"` | ⬜ |
| AUTH-10 | Body rỗng `{}` | `{}` | `400` | Error message | ⬜ |
| AUTH-11 | Kiểm tra response KHÔNG có trường password | Auth thành công | Response user object **không chứa** trường `password` | ⬜ |
| AUTH-12 | Email chứa ký tự hoa | `{"email":"ADMIN@ESTATEAI.VN","password":"Test@12345"}` | `200` | Đăng nhập thành công (case insensitive) | ⬜ |

### 2.2 Đăng ký `POST /api/auth/register`

| ID | Kịch bản | Input Body | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|------------|-------------------|-----------------|--------|
| REG-01 | Đăng ký mới hoàn toàn hợp lệ | `{"name":"Test User","email":"newtest@gmail.com","password":"Test@12345"}` | `200` | `requireVerification:true`, `email` trả về, OTP gửi email | ⬜ |
| REG-02 | Email đã tồn tại và đã xác thực | `{"name":"X","email":"client@estateai.vn","password":"Test@12345"}` | `400` | `"Email đã tồn tại"` | ⬜ |
| REG-03 | Email đã tồn tại nhưng **chưa xác thực** | `{"name":"X","email":"unverified@estateai.vn","password":"Test@12345"}` | `200` | `"Mã xác thực mới đã được gửi"`, `requireVerification:true` | ⬜ |
| REG-04 | Thiếu name | `{"email":"x@y.vn","password":"Test@12345"}` | `400` | `"Vui lòng nhập đủ thông tin"` | ⬜ |
| REG-05 | Thiếu password | `{"name":"X","email":"x@y.vn"}` | `400` | `"Vui lòng nhập đủ thông tin"` | ⬜ |
| REG-06 | Role mặc định sau đăng ký public | Đăng ký thành công → xác thực OTP → đăng nhập | `user.role = "user"` (không phải sale hoặc admin) | ⬜ |

### 2.3 Xác thực OTP `POST /api/auth/verify`

| ID | Kịch bản | Input Body | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|------------|-------------------|-----------------|--------|
| OTP-01 | OTP đúng còn hạn | `{"email":"unverified@estateai.vn","code":"<OTP từ email>"}` | `200` | `"Xác thực thành công"` | ⬜ |
| OTP-02 | OTP sai | `{"email":"unverified@estateai.vn","code":"000000"}` | `400` | `"Mã xác thực không chính xác"` | ⬜ |
| OTP-03 | OTP đúng nhưng hết hạn (> 15 phút) | OTP cũ quá hạn | `400` | `"Mã xác thực đã hết hạn"` | ⬜ |
| OTP-04 | Tài khoản đã xác thực trước rồi | `{"email":"client@estateai.vn","code":"123456"}` | `400` | `"Tài khoản đã được xác thực"` | ⬜ |
| OTP-05 | Email không tồn tại | `{"email":"ghost@test.vn","code":"123456"}` | `404` | `"Không tìm thấy người dùng"` | ⬜ |
| OTP-06 | Thiếu email hoặc code | `{"email":"x@y.vn"}` | `400` | `"Vui lòng nhập đủ thông tin"` | ⬜ |

### 2.4 Gửi lại OTP `POST /api/auth/resend-verification`

| ID | Kịch bản | Input Body | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|------------|-------------------|-----------------|--------|
| RESEND-01 | Email chưa xác thực hợp lệ | `{"email":"unverified@estateai.vn"}` | `200` | `"Đã gửi lại mã xác thực"`, email mới được gửi | ⬜ |
| RESEND-02 | Email đã xác thực rồi | `{"email":"client@estateai.vn"}` | `400` | `"Tài khoản đã được xác thực"` | ⬜ |
| RESEND-03 | Email không tồn tại | `{"email":"ghost@test.vn"}` | `404` | `"Không tìm thấy người dùng"` | ⬜ |
| RESEND-04 | Thiếu email | `{}` | `400` | `"Thiếu email"` | ⬜ |

### 2.5 Quên Mật khẩu `POST /api/auth/forgot-password`

| ID | Kịch bản | Input Body | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|------------|-------------------|-----------------|--------|
| PWD-01 | Email tồn tại trong hệ thống | `{"email":"client@estateai.vn"}` | `200` | Thông báo chung, link reset gửi vào email (kiểm tra email thực) | ⬜ |
| PWD-02 | Email **không** tồn tại | `{"email":"ghost@test.vn"}` | `200` | **Vẫn** trả về thông báo chung (không để lộ email tồn tại hay không) | ⬜ |
| PWD-03 | Thiếu email | `{}` | `400` | `"Vui lòng nhập email"` | ⬜ |

### 2.6 Đặt lại Mật khẩu `POST /api/auth/reset-password`

| ID | Kịch bản | Input Body | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|------------|-------------------|-----------------|--------|
| RST-01 | Token hợp lệ còn hạn (< 1 giờ) | `{"token":"<token từ email>","email":"client@estateai.vn","newPassword":"NewPass@123"}` | `200` | `"Đặt lại mật khẩu thành công"` | ⬜ |
| RST-02 | Sau RST-01: Đăng nhập với MK mới | `{"email":"client@estateai.vn","password":"NewPass@123"}` | `200` | Đăng nhập thành công | ⬜ |
| RST-03 | Token đã hết hạn (> 1 giờ) | token cũ | `400` | `"Link khôi phục không hợp lệ hoặc đã hết hạn"` | ⬜ |
| RST-04 | Token sai / giả mạo | `{"token":"fake_token","email":"client@estateai.vn","newPassword":"x"}` | `400` | `"Link khôi phục không hợp lệ"` | ⬜ |
| RST-05 | Thiếu newPassword | `{"token":"xxx","email":"client@estateai.vn"}` | `400` | `"Thông tin không hợp lệ"` | ⬜ |

### 2.7 Quản lý Profile

| ID | Kịch bản | Endpoint & Input | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|-----------------|-------------------|-----------------|--------|
| PRF-01 | Cập nhật tên hiển thị | `PUT /api/auth/profile` `{"id":"<user_id>","name":"Tên Mới"}` | `200` | `user.name = "Tên Mới"` | ⬜ |
| PRF-02 | Đổi mật khẩu | `PUT /api/auth/profile` `{"id":"<user_id>","name":"x","password":"NewPass@123"}` | `200` | Đăng nhập lại với MK mới thành công | ⬜ |
| PRF-03 | Thiếu ID | `PUT /api/auth/profile` `{"name":"x"}` | `400` | `"Thiếu ID hoặc Tên hiển thị"` | ⬜ |
| PRF-04 | Xóa tài khoản chính mình | `DELETE /api/auth/profile` `{"email":"client@estateai.vn"}` | `200` | `"Đã xóa tài khoản vĩnh viễn"`, tài khoản không đăng nhập được | ⬜ |
| PRF-05 | Xóa tài khoản không có email | `DELETE /api/auth/profile` `{}` | `400` | `"Thiếu email để xác thực xóa"` | ⬜ |

---

## 3. Module PROPERTIES – Tin đăng Bất động sản

### 3.1 Lấy danh sách `GET /api/properties`

| ID | Kịch bản | Query Params | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|-------------|-------------------|-----------------|--------|
| PROP-01 | Lấy tất cả tin đã duyệt | (không có param) | `200` | Array, tất cả item có `status:"Approved"` | ⬜ |
| PROP-02 | Response có đủ AI fields | (không có param) | `200` | Mỗi item có `aiScore`, `trustScore`, `scoreCriteria[]`, `scoreSummary`, `scoreSuggestions[]` | ⬜ |
| PROP-03 | Tin sắp xếp theo điểm AI giảm dần | (không có param) | `200` | `arr[0].aiScore >= arr[1].aiScore >= ...` | ⬜ |
| PROP-04 | Lọc tin theo authorId (Broker xem tin của mình) | `?authorId=<sale01_id>` | `200` | Trả về tất cả tin của sale01 (kể cả Pending, Rejected) | ⬜ |
| PROP-05 | Tin Pending không xuất hiện khi không có authorId | (không có param) | `200` | Không có item nào có `status:"Pending"` hoặc `"Rejected"` | ⬜ |

### 3.2 Lấy chi tiết `GET /api/properties/:id`

| ID | Kịch bản | Input | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|-------|-------------------|-----------------|--------|
| PROP-06 | ID tồn tại | `GET /api/properties/<valid_id>` | `200` | Đầy đủ thông tin tin đăng + images[] + aiScore + trustScore + scoreCriteria[] | ⬜ |
| PROP-07 | ID không tồn tại | `GET /api/properties/nonexistent_id` | `404` | `"Không tìm thấy bất động sản"` | ⬜ |

### 3.3 Đăng tin mới `POST /api/properties` — Yêu cầu multipart/form-data

> 💡 **Dùng Postman hoặc frontend form để test, không dùng cURL thuần JSON**

| ID | Kịch bản | Input Form-data | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|----------------|-------------------|-----------------|--------|
| PROP-08 | Đăng tin hợp lệ đầy đủ + 3 ảnh | title, price, location, area, beds, baths, transactionType, propertyType, legalStatus, description, authorId + 3 files ảnh | `201` | `success:true`, `data.status:"Pending"` | ⬜ |
| PROP-09 | Đăng tin không có ảnh | Form không có file | `400` | `"Vui lòng tải lên ít nhất 1 ảnh"` | ⬜ |
| PROP-10 | Admin đăng tin và tự duyệt | Form + `status:"Approved"` trong body | `201` | `data.status:"Approved"`, tin ngay lập tức xuất hiện public | ⬜ |
| PROP-11 | Ảnh vượt 10MB | File > 10MB | `400` | `"File ảnh quá lớn. Vui lòng chọn ảnh dưới 10MB"` | ⬜ |
| PROP-12 | Upload đúng 10 ảnh (tối đa) | 10 files ảnh hợp lệ | `201` | Tạo thành công với 10 ảnh | ⬜ |
| PROP-13 | Đăng tin tối thiểu (chỉ có title + 1 ảnh) | Chỉ title + 1 file ảnh | `201` | Tạo thành công, aiScore thấp | ⬜ |
| PROP-14 | Tin vừa đăng xuất hiện trong tab "Tin của tôi" | Gửi `authorId = sale01_id` | `GET /api/properties?authorId=<sale01_id>` trả về tin mới | ⬜ |

---

## 4. Module AI – Trí tuệ Nhân tạo

### 4.1 Chấm điểm Tin đăng `POST /api/ai/score-listing`

#### 4.1.1 Kiểm tra Validation Input

| ID | Kịch bản | Input | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|-------|-------------------|-----------------|--------|
| AI-01 | Thiếu trường `property` | `{"imageCount":5}` | `400` | `"Dữ liệu tin đăng không hợp lệ"` | ⬜ |
| AI-02 | `property` là mảng thay vì object | `{"property":[],"imageCount":5}` | `400` | `"Dữ liệu tin đăng không hợp lệ"` | ⬜ |
| AI-03 | Mô tả quá ngắn (< 12 ký tự) | property đầy đủ nhưng `description:"Nhà"` | `400` | `"Nhập mô tả ít nhất 12 ký tự trước khi chấm điểm"` | ⬜ |
| AI-04 | `imageCount` âm | `{"property":{...},"imageCount":-1}` | `400` | `"Số lượng ảnh không hợp lệ"` | ⬜ |
| AI-05 | `imageCount` > 10 | `{"property":{...},"imageCount":11}` | `400` | `"Số lượng ảnh không hợp lệ"` | ⬜ |
| AI-06 | `imageCount` là chuỗi | `{"property":{...},"imageCount":"5"}` | `400` | `"Số lượng ảnh không hợp lệ"` | ⬜ |
| AI-07 | `description` > 12000 ký tự | description cực dài | `400` | `"Nội dung vượt quá độ dài cho phép"` | ⬜ |

#### 4.1.2 Kiểm tra Logic Chấm điểm

| ID | Kịch bản | Input | Kết quả kỳ vọng | Status |
|----|----------|-------|-----------------|--------|
| AI-08 | Tin đầy đủ chất lượng cao (dùng dữ liệu mẫu CAO ở mục 1.2) | 5 ảnh + mô tả > 80 từ | `score` 80–100, `success:true`, 5 tiêu chí đầy đủ | ⬜ |
| AI-09 | Tin thiếu nhiều trường (dùng dữ liệu mẫu THẤP) | 0 ảnh, mô tả < 40 từ | `score` < 60, `suggestions[]` nhiều gợi ý | ⬜ |
| AI-10 | `imageCount = 0` → tiêu chí ảnh = 0 điểm | `imageCount:0` | `criteria` item `id:"images"` có `score:0` | ⬜ |
| AI-11 | `imageCount = 3` → tiêu chí ảnh = 6 điểm | `imageCount:3` | `criteria` item `id:"images"` có `score:6` | ⬜ |
| AI-12 | `imageCount = 5` trở lên → tối đa 10 điểm | `imageCount:5` hoặc `imageCount:8` | `criteria` item `id:"images"` có `score:10` | ⬜ |
| AI-13 | Tiêu đề dài hợp lệ (20–80 ký tự) → điểm cao | title 30 ký tự | `criteria id:"title" score >= 12` | ⬜ |
| AI-14 | Tiêu đề quá ngắn (< 10 ký tự) → điểm thấp | title = "Nhà đẹp" | `criteria id:"title" score <= 8` | ⬜ |
| AI-15 | Mô tả ≥ 200 từ → điểm cao | description ≥ 200 từ | `criteria id:"description" score >= 28` | ⬜ |
| AI-16 | Mô tả 40–79 từ → điểm trung bình | description ~60 từ | `criteria id:"description" score == 15` | ⬜ |
| AI-17 | Tổng score = tổng 5 tiêu chí | Bất kỳ input hợp lệ | `score == sum(criteria[*].score)` | ⬜ |
| AI-18 | Fallback Engine hoạt động khi xóa API Key | Tạm xóa `GEMINI_API_KEY` khỏi `.env`, restart server | Vẫn trả về score hợp lệ trong < 200ms, không có lỗi 503 | ⬜ |

### 4.2 AI Viết lại Mô tả `POST /api/ai/rewrite-description`

| ID | Kịch bản | Input Body | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|------------|-------------------|-----------------|--------|
| AIR-01 | Input hợp lệ đầy đủ | `{"description":"Nhà 3PN đẹp gần trung tâm có sổ hồng giá thương lượng","property":{"transactionType":"sale","location":"Quận 7, TP.HCM","price":"5.5 tỷ","area":"90","beds":"3","baths":"2","legalStatus":"Sổ hồng"}}` | `200` | `success:true`, `description` là chuỗi 180–260 từ tiếng Việt | ⬜ |
| AIR-02 | Mô tả < 12 ký tự | `{"description":"Nhà đẹp"}` | `400` | `"Vui lòng nhập mô tả ban đầu trước khi tạo nội dung AI"` | ⬜ |
| AIR-03 | Thiếu trường description hoàn toàn | `{"property":{}}` | `400` | Error | ⬜ |
| AIR-04 | Kiểm tra output không chứa markdown | Input hợp lệ | Output **không** có `**`, `##`, `*`, `_` | ⬜ |
| AIR-05 | Kiểm tra output không có emoji | Input hợp lệ | Output **không** có emoji | ⬜ |
| AIR-06 | Kiểm tra output không bịa thêm pháp lý | Input không có `legalStatus` | Output **không** tự thêm "sổ hồng", "sổ đỏ" | ⬜ |
| AIR-07 | Kiểm tra output không bịa tên dự án | Input chỉ là "nhà cấp 4" | Output **không** thêm tên dự án giả | ⬜ |
| AIR-08 | Output đủ 3-4 đoạn văn | Input hợp lệ | Output có ít nhất 3 đoạn văn riêng biệt | ⬜ |

### 4.3 Phân tích Thị trường `GET /api/ai/market-analysis`

| ID | Kịch bản | Kết quả kỳ vọng | Status |
|----|----------|-----------------|--------|
| AIM-01 | Gọi API thành công | `200 OK`, `success:true`, `data.sampleSize`, `data.averagePriceMillion`, `data.locations[]` | ⬜ |
| AIM-02 | sampleSize khớp DB | Count số tin `status:Approved` trong DB và so sánh | ⬜ |
| AIM-03 | averagePriceMillion đúng | Tính thủ công: trung bình giá các tin Approved → khớp với API | ⬜ |
| AIM-04 | locations[] có đủ thông tin | Mỗi location có: `location`, `listings`, `averagePriceMillion`, `averagePricePerM2` | ⬜ |
| AIM-05 | Locations sắp xếp theo số lượng tin giảm dần | `locations[0].listings >= locations[1].listings` | ⬜ |
| AIM-06 | Tin không có `area` → `averagePricePerM2 = null` | Tin thiếu diện tích | `averagePricePerM2` là `null` hoặc không xuất hiện | ⬜ |

### 4.4 Đề xuất BĐS `GET /api/ai/recommendations`

| ID | Kịch bản | Kết quả kỳ vọng | Status |
|----|----------|-----------------|--------|
| AIR2-01 | Gọi API thành công | `200 OK`, `success:true`, `data.recommendations[]` tối đa 10 items | ⬜ |
| AIR2-02 | Mỗi recommendation có đủ fields | `recommendationScore`, `estimatedMarketPriceMillion`, `priceDifferencePercent`, `reasons[]`, `images[]` | ⬜ |
| AIR2-03 | recommendationScore trong [0, 100] | Mọi item | `0 <= recommendationScore <= 100` | ⬜ |
| AIR2-04 | Danh sách sắp xếp giảm dần theo score | `rec[0].recommendationScore >= rec[1].recommendationScore` | ⬜ |
| AIR2-05 | BĐS giá thấp hơn avg có discount > 0 | Chọn BĐS có `priceDifferencePercent < 0` | `priceDifferencePercent < 0` và `reasons` chứa "Giá thấp hơn mặt bằng tham chiếu" | ⬜ |
| AIR2-06 | BĐS có pháp lý → +5 điểm trong công thức | So sánh 2 BĐS giống nhau, 1 có legalStatus 1 không | BĐS có legalStatus có score cao hơn ~5 điểm | ⬜ |

---

## 5. Module LEADS/CRM – Quản lý Khách hàng Tiềm năng

> **Endpoint gốc:** Quản lý leads trong Admin Dashboard (Tab "Khách hàng tiềm năng") và Broker Dashboard.
> Hiện tại CRM hoạt động qua **giao diện frontend** là chính.

### 5.1 Xem Danh sách Leads (UI)

| ID | Kịch bản | Thực hiện | Kết quả kỳ vọng | Status |
|----|----------|-----------|-----------------|--------|
| CRM-01 | Admin xem toàn bộ leads | Login Admin → Admin Dashboard → Tab "Khách hàng tiềm năng" | Hiển thị danh sách đầy đủ, tất cả nhóm | ⬜ |
| CRM-02 | Sale chỉ thấy leads được giao | Login Sale01 → Broker Dashboard → Tab "CRM Khách hàng" | Chỉ thấy leads có `assignedSale = sale01_id` | ⬜ |
| CRM-03 | Tab hiển thị đúng số lead | Đếm số lead hiển thị vs DB | Count khớp | ⬜ |

### 5.2 Lọc Nhóm Khách hàng (UI)

| ID | Kịch bản | Thực hiện | Kết quả kỳ vọng | Status |
|----|----------|-----------|-----------------|--------|
| CRM-04 | Lọc VIP Buyer | Bấm filter "VIP Mua" | Chỉ hiển thị `type:"vip_buyer"` | ⬜ |
| CRM-05 | Lọc VIP Renter | Bấm filter "VIP Thuê" | `type:"vip_renter"` | ⬜ |
| CRM-06 | Lọc High Visitor | Bấm filter "Tương tác cao" | `type:"high_visitor"` | ⬜ |
| CRM-07 | Lọc Hot Lead | Bấm filter "Khách nóng" | `type:"hot_lead"` | ⬜ |
| CRM-08 | Xem Tất cả | Reset filter | Hiển thị lại tất cả leads | ⬜ |

### 5.3 Tìm kiếm & Sắp xếp (UI)

| ID | Kịch bản | Thực hiện | Kết quả kỳ vọng | Status |
|----|----------|-----------|-----------------|--------|
| CRM-09 | Tìm kiếm theo tên | Nhập tên vào ô search | Kết quả chứa tên (case insensitive) | ⬜ |
| CRM-10 | Tìm kiếm theo SĐT | Nhập số điện thoại | Kết quả khớp SĐT | ⬜ |
| CRM-11 | Tìm kiếm theo email | Nhập email | Kết quả khớp email | ⬜ |
| CRM-12 | Sắp xếp theo AI Score giảm dần | Chọn sort "Điểm AI ↓" | Lead điểm cao nhất lên đầu | ⬜ |
| CRM-13 | Sắp xếp theo số lần mua | Chọn sort "Số lần mua ↓" | Lead mua nhiều nhất lên đầu | ⬜ |
| CRM-14 | Sắp xếp theo lượt xem | Chọn sort "Lượt xem ↓" | Lead xem nhiều nhất lên đầu | ⬜ |

### 5.4 Thêm Mới Lead

| ID | Kịch bản | Input | Kết quả kỳ vọng | Status |
|----|----------|-------|-----------------|--------|
| CRM-15 | Thêm lead VIP Buyer đầy đủ | name, phone, email, type:"vip_buyer", budget:">5 tỷ", preferredType:"apartment", preferredLocation:"Quận 9" | Lead mới xuất hiện trong danh sách, `type:"vip_buyer"` | ⬜ |
| CRM-16 | Thêm lead Hot Lead | type:"hot_lead", status:"hot" | Lead hiện với badge "Nóng" | ⬜ |
| CRM-17 | Thêm lead thiếu tên | (không nhập tên) | Form báo lỗi, không cho submit | ⬜ |
| CRM-18 | Thêm lead thiếu SĐT | (không nhập SĐT) | Form báo lỗi | ⬜ |

### 5.5 Sửa / Cập nhật Lead

| ID | Kịch bản | Input | Kết quả kỳ vọng | Status |
|----|----------|-------|-----------------|--------|
| CRM-19 | Sửa tên lead | Đổi tên → Lưu | Tên mới hiển thị ngay trong danh sách | ⬜ |
| CRM-20 | Cập nhật ghi chú cuộc gọi | Nhập ghi chú vào `notes` | Notes được lưu, hiển thị trong hồ sơ | ⬜ |
| CRM-21 | Đổi trạng thái phễu `hot` → `consulting` | Dropdown status → "Đang tư vấn" | Status cập nhật, AI Score thay đổi | ⬜ |
| CRM-22 | Đổi trạng thái `consulting` → `viewing` | Dropdown → "Hẹn xem nhà" | Score tăng thêm 8 điểm (từ consulting +5 → viewing +8) | ⬜ |
| CRM-23 | Đổi trạng thái → `closed` | Dropdown → "Đã chốt" | Status "Đã chốt hợp đồng" | ⬜ |
| CRM-24 | Phân công Sale phụ trách | Chọn `assignedSale = sale02` | Lead xuất hiện trong danh sách của Sale02, mất khỏi "Chưa giao" | ⬜ |
| CRM-25 | Sửa ngân sách & khu vực | budget, preferredLocation | Thông tin cập nhật đúng | ⬜ |

### 5.6 Xóa Lead

| ID | Kịch bản | Thực hiện | Kết quả kỳ vọng | Status |
|----|----------|-----------|-----------------|--------|
| CRM-26 | Xóa 1 lead | Bấm xóa → Dialog xác nhận → Xác nhận | Lead biến mất khỏi danh sách | ⬜ |
| CRM-27 | Hủy xóa | Bấm xóa → Dialog → Bấm "Hủy" | Lead vẫn còn | ⬜ |
| CRM-28 | Xóa hàng loạt | Tick nhiều lead → Bấm "Xóa hàng loạt" | Tất cả lead được chọn bị xóa | ⬜ |

### 5.7 Kiểm tra Công thức AI Lead Score

> Tạo lead với các thông số bên dưới, sau đó kiểm tra `aiScore` hiển thị trên UI.
> **Công thức:** `LeadScore = min(99, max(40, 50 + P_buy + P_rent + P_vis + B_status + B_type))`

| ID | Kịch bản | Thông số Lead | Tính toán | Score kỳ vọng | Status |
|----|----------|--------------|-----------|---------------|--------|
| CRM-29 | Lead mới không có hoạt động | purchases=0, rentals=0, visits=0, status="nurturing", type="hot_lead" | 50+0+0+0+0+0=50 | **50** | ⬜ |
| CRM-30 | Lead mua 1 BĐS | totalPurchases=1 | P_buy=min(24,1×8)=8 | **50+8=58** | ⬜ |
| CRM-31 | Lead mua 3 BĐS (tối đa) | totalPurchases=3 | P_buy=min(24,3×8)=24 | **50+24=74** | ⬜ |
| CRM-32 | Lead mua 4 BĐS (chạm trần) | totalPurchases=4 | P_buy=min(24,4×8)=24 (giữ ở 24) | **50+24=74** | ⬜ |
| CRM-33 | Lead thuê 2 hợp đồng | totalRentals=2 | P_rent=min(15,2×5)=10 | **50+10=60** | ⬜ |
| CRM-34 | Lead 50 lượt xem | totalVisits=50 | P_vis=min(15,floor(50/10))=5 | **50+5=55** | ⬜ |
| CRM-35 | Status = "hot" | status=hot | B_status=10 | **50+10=60** | ⬜ |
| CRM-36 | Status = "viewing" | status=viewing | B_status=8 | **50+8=58** | ⬜ |
| CRM-37 | Status = "consulting" | status=consulting | B_status=5 | **50+5=55** | ⬜ |
| CRM-38 | Type = "vip_buyer" | type=vip_buyer | B_type=6 | **50+6=56** | ⬜ |
| CRM-39 | Lead VIP tổng hợp tối đa | purchases=3, rentals=3, visits=150, status=hot, type=vip_buyer | 50+24+15+15+10+6=120 → min(99,120) | **99** | ⬜ |
| CRM-40 | Score không bao giờ < 40 | purchases=0, rentals=0, visits=0 | 50 (base) | **50 ≥ 40** ✓ | ⬜ |

### 5.8 Xuất Excel

| ID | Kịch bản | Kết quả kỳ vọng | Status |
|----|----------|-----------------|--------|
| CRM-41 | Bấm nút "Xuất Excel" | Trình duyệt tải về file `.xlsx` | ⬜ |
| CRM-42 | File mở được bằng Excel/Google Sheets | File không bị lỗi format | ⬜ |
| CRM-43 | Cột đầy đủ trong file | Có các cột: STT, Tên, SĐT, Email, Loại KH, Ngân sách, Khu vực, Trạng thái, Điểm AI, Sale phụ trách, Ghi chú | ⬜ |
| CRM-44 | Dữ liệu khớp với màn hình | Số dòng và nội dung khớp với danh sách hiển thị | ⬜ |

---

## 6. Module ADMIN – Quản trị Hệ thống

### 6.1 Dashboard Admin `GET /api/admin/dashboard`

| ID | Kịch bản | Kết quả kỳ vọng | Status |
|----|----------|-----------------|--------|
| ADM-01 | Gọi API thành công | `200 OK`, `success:true`, `data.metrics{totalSales, pendingListings, successfulTransactions}`, `data.users[]` | ⬜ |
| ADM-02 | totalSales đúng | Đếm user có `role:"sale"` trong DB → khớp | ⬜ |
| ADM-03 | pendingListings đúng | Đếm property có `status:"Pending"` → khớp | ⬜ |
| ADM-04 | successfulTransactions đúng | Đếm property có `isSold:true` → khớp | ⬜ |
| ADM-05 | Mỗi user có `_count.properties` | `data.users[0]._count.properties >= 0` | ⬜ |
| ADM-06 | Users sắp xếp theo createdAt tăng dần | User tạo đầu tiên nằm ở index 0 | ⬜ |

### 6.2 Kiểm duyệt Tin đăng

| ID | Kịch bản | Endpoint & Input | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|-----------------|-------------------|-----------------|--------|
| ADM-07 | Lấy danh sách tin Pending | `GET /api/admin/properties/pending` | `200` | Tất cả items có `status:"Pending"`, kèm `author`, `images[]` | ⬜ |
| ADM-08 | Lấy tất cả tin (mọi status) | `GET /api/admin/properties/all` | `200` | Tất cả tin kể cả Pending, Rejected, Approved | ⬜ |
| ADM-09 | Duyệt tin → Approved | `PUT /api/admin/properties/<id>/status` `{"status":"Approved"}` | `200` | `"Tin đăng đã được chuyển sang Approved"`, tin xuất hiện trên trang public | ⬜ |
| ADM-10 | Từ chối tin → Rejected | `PUT /api/admin/properties/<id>/status` `{"status":"Rejected"}` | `200` | `status:"Rejected"`, tin không còn trong danh sách Pending | ⬜ |
| ADM-11 | Status không hợp lệ | `{"status":"Draft"}` | `400` | `"Trạng thái không hợp lệ"` | ⬜ |
| ADM-12 | Chỉnh sửa thông tin tin | `PUT /api/admin/properties/<id>` `{"title":"Tiêu đề mới","price":"4 tỷ"}` | `200` | Thông tin tin cập nhật đúng | ⬜ |
| ADM-13 | Xóa tin đăng đơn lẻ | `DELETE /api/admin/properties/<id>` | `200` | `"Đã xóa tin đăng thành công"`, tin biến mất | ⬜ |
| ADM-14 | Xóa hàng loạt tin | `POST /api/admin/properties/bulk-delete` `{"ids":["id1","id2"]}` | `200` | `"Xóa hàng loạt tin đăng thành công"`, images liên quan cũng bị xóa | ⬜ |
| ADM-15 | Bulk-delete với IDs rỗng | `{"ids":[]}` | `400` | `"Danh sách ID không hợp lệ"` | ⬜ |

#### Import Tin đăng Hàng loạt từ CSV/Excel

| ID | Kịch bản | Input | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|-------|-------------------|-----------------|--------|
| ADM-16 | Import file hợp lệ ≤ 500 dòng | `POST /api/admin/properties/import` `{"rows":[{title,price,location,...}]}` | `201` | `imported:N, skipped:M, message:"Đã import N tin"` | ⬜ |
| ADM-17 | Import > 500 dòng | `rows` có 501 items | `400` | `"Mỗi lần chỉ được import tối đa 500 tin"` | ⬜ |
| ADM-18 | `rows` rỗng | `{"rows":[]}` | `400` | `"Không có dữ liệu để import"` | ⬜ |
| ADM-19 | Dòng thiếu title | Dòng không có `title` | Dòng đó bị skip, `skipped` tăng | ⬜ |
| ADM-20 | Dòng thiếu price | Dòng không có `price` | Dòng đó bị skip | ⬜ |
| ADM-21 | Dòng thiếu location | Dòng không có `location` | Dòng đó bị skip | ⬜ |
| ADM-22 | Import với `status` chỉ định | `{"rows":[{...,"status":"Approved"}]}` | `201` | Tin tạo ra với `status:"Approved"` | ⬜ |
| ADM-23 | Import không có `status` → mặc định Approved | `{"rows":[{title,price,location}]}` | `201` | `status:"Approved"` theo mặc định | ⬜ |

### 6.3 Quản lý Tài khoản

| ID | Kịch bản | Endpoint & Input | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|-----------------|-------------------|-----------------|--------|
| ADM-24 | Tạo tài khoản Sale mới | `POST /api/admin/users` `{"name":"New Sale","email":"newsale@test.vn","password":"Test@12345"}` | `201` | `role:"sale"`, `status:"Active"`, `title:"Chuyên viên Môi giới"` | ⬜ |
| ADM-25 | Tạo tài khoản có title tùy chỉnh | `{"name":"X","email":"x@test.vn","password":"Test@12345","title":"Trưởng phòng kinh doanh"}` | `201` | `title:"Trưởng phòng kinh doanh"` | ⬜ |
| ADM-26 | Tạo tài khoản trùng email | Email đã tồn tại | `400` | `"Email này đã được sử dụng"` | ⬜ |
| ADM-27 | Thiếu name / email / password | Body thiếu trường bắt buộc | `400` | `"Vui lòng điền đủ Tên, Email và Mật khẩu"` | ⬜ |
| ADM-28 | Khóa tài khoản | `PUT /api/admin/users/<id>/status` `{"status":"Locked"}` | `200` | `"Đã đổi trạng thái thành Locked"`, đăng nhập thất bại với 403 | ⬜ |
| ADM-29 | Mở khóa tài khoản | `{"status":"Active"}` | `200` | Tài khoản đăng nhập thành công | ⬜ |
| ADM-30 | Status không hợp lệ | `{"status":"Banned"}` | `400` | `"Trạng thái không hợp lệ"` | ⬜ |
| ADM-31 | Đổi role user → sale | `PUT /api/admin/users/<id>/role` `{"role":"sale"}` | `200` | `role:"sale"`, `title:"Chuyên viên Môi giới"` | ⬜ |
| ADM-32 | Đổi role sale → admin | `{"role":"admin"}` | `200` | `role:"admin"` | ⬜ |
| ADM-33 | Đổi role user → user (giữ nguyên) | `{"role":"user"}` | `200` | `role:"user"`, `title:"Khách hàng"` | ⬜ |
| ADM-34 | Role không hợp lệ | `{"role":"superadmin"}` | `400` | `"Vai trò không hợp lệ"` | ⬜ |
| ADM-35 | Cập nhật tên/email user | `PUT /api/admin/users/<id>` `{"name":"Tên Mới","email":"new@test.vn"}` | `200` | Thông tin cập nhật, trả về user data mới | ⬜ |
| ADM-36 | Cập nhật email trùng user khác | email đã dùng bởi account khác | `400` | `"Email này đã được sử dụng bởi tài khoản khác"` | ⬜ |
| ADM-37 | Thiếu name hoặc email khi cập nhật | `{"name":"X"}` | `400` | `"Vui lòng nhập đầy đủ tên và email"` | ⬜ |
| ADM-38 | Xóa user | `DELETE /api/admin/users/<id>` | `200` | `"Đã xóa tài khoản thành công"` | ⬜ |
| ADM-39 | Xóa user không tồn tại | `DELETE /api/admin/users/nonexistent` | `404` | `"Không tìm thấy người dùng"` | ⬜ |
| ADM-40 | Xóa user có tin đăng → tin không mất | Xóa sale01 có tin đăng | Tin đăng vẫn tồn tại với `authorId:null` | ⬜ |

### 6.4 Cài đặt Hệ thống

| ID | Kịch bản | Endpoint & Input | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|-----------------|-------------------|-----------------|--------|
| ADM-41 | Lấy cài đặt hiện tại | `GET /api/admin/settings` | `200` | `data.{emailNotifications, autoApproveHighPerformingSales, aiPriceAnalysis, maintenanceMode}` | ⬜ |
| ADM-42 | Bật maintenanceMode | `PUT /api/admin/settings` `{"maintenanceMode":true}` | `200` | `data.maintenanceMode:true` | ⬜ |
| ADM-43 | Tắt maintenanceMode | `PUT /api/admin/settings` `{"maintenanceMode":false}` | `200` | `data.maintenanceMode:false` | ⬜ |
| ADM-44 | Cập nhật nhiều setting cùng lúc | `{"emailNotifications":false,"aiPriceAnalysis":true}` | `200` | Cả 2 setting được cập nhật | ⬜ |
| ADM-45 | Setting persistent sau restart | Bật setting → restart server → GET lại | Setting vẫn giữ nguyên (lưu vào DB) | ⬜ |
| ADM-46 | Truyền key không hợp lệ | `{"unknownKey":true}` | `200` | Setting không thay đổi (key không hợp lệ bị bỏ qua) | ⬜ |
| ADM-47 | Truyền value không phải boolean | `{"emailNotifications":"yes"}` | `200` | Setting không thay đổi (value không hợp lệ bị bỏ qua) | ⬜ |

---

## 7. Module CONTACTS – Liên hệ Khách hàng

### 7.1 Gửi Liên hệ từ Khách (Public)

| ID | Kịch bản | Input Body | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|------------|-------------------|-----------------|--------|
| CON-01 | Gửi liên hệ đầy đủ (Guest) | `POST /api/contacts` `{"name":"Nguyễn Văn A","email":"khach@gmail.com","phone":"0901234567","subject":"Hỏi thăm căn hộ Masteri","message":"Tôi muốn xem căn hộ..."}` | `201` | `success:true`, `data.status:"Pending"` | ⬜ |
| CON-02 | Thiếu name | Bỏ trường `name` | `400` | `"Vui lòng điền đầy đủ các thông tin bắt buộc"` | ⬜ |
| CON-03 | Thiếu email | Bỏ trường `email` | `400` | Error | ⬜ |
| CON-04 | Thiếu phone | Bỏ trường `phone` | `400` | Error | ⬜ |
| CON-05 | Thiếu subject | Bỏ trường `subject` | `400` | Error | ⬜ |
| CON-06 | Thiếu message | Bỏ trường `message` | `400` | Error | ⬜ |

### 7.2 Quản lý Liên hệ (Admin)

| ID | Kịch bản | Endpoint & Input | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|-----------------|-------------------|-----------------|--------|
| CON-07 | Xem danh sách liên hệ | `GET /api/admin/contacts` | `200` | Mảng liên hệ sắp xếp mới nhất trước | ⬜ |
| CON-08 | Trả lời liên hệ | `POST /api/admin/contacts/<id>/reply` `{"replyText":"Xin chào, cảm ơn bạn đã liên hệ..."}` | `200` | Email gửi đến khách hàng, `data.status:"Replied"`, `data.replyText` được lưu | ⬜ |
| CON-09 | Trả lời với nội dung rỗng | `{"replyText":""}` | `400` | `"Nội dung phản hồi không được để trống"` | ⬜ |
| CON-10 | Trả lời liên hệ không tồn tại | `POST /api/admin/contacts/nonexistent/reply` | `404` | `"Không tìm thấy yêu cầu liên hệ"` | ⬜ |
| CON-11 | Admin tạo liên hệ thủ công | `POST /api/admin/contacts` `{name, email, phone, subject, message}` | `201` | Liên hệ tạo thành công | ⬜ |
| CON-12 | Admin thiếu trường bắt buộc | Thiếu subject | `400` | `"Vui lòng điền đầy đủ các thông tin bắt buộc"` | ⬜ |
| CON-13 | Cập nhật liên hệ | `PUT /api/admin/contacts/<id>` `{status:"Replied"}` | `200` | Thông tin cập nhật | ⬜ |
| CON-14 | Xóa 1 liên hệ | `DELETE /api/admin/contacts/<id>` | `200` | `"Xóa liên hệ thành công"` | ⬜ |
| CON-15 | Xóa hàng loạt hợp lệ | `POST /api/admin/contacts/bulk-delete` `{"ids":["id1","id2"]}` | `200` | `"Xóa hàng loạt liên hệ thành công"` | ⬜ |
| CON-16 | Xóa hàng loạt IDs rỗng | `{"ids":[]}` | `400` | `"Danh sách ID không hợp lệ"` | ⬜ |
| CON-17 | Xóa hàng loạt không phải mảng | `{"ids":"id1"}` | `400` | Error | ⬜ |

---

## 8. Module NEWS – Tin tức Thị trường

### 8.1 Đọc Tin tức (Public)

| ID | Kịch bản | Endpoint | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|----------|-------------------|-----------------|--------|
| NEWS-01 | Lấy danh sách tin tức | `GET /api/news` | `200` | `success:true`, `data[]` mảng bài viết sắp xếp mới nhất trước | ⬜ |
| NEWS-02 | Lấy chi tiết bài viết | `GET /api/news/<id>` | `200` | `success:true`, `data.{id, title, excerpt, content, image, category, author, featured, status}` | ⬜ |
| NEWS-03 | ID không tồn tại | `GET /api/news/nonexistent` | `404` | `"Không tìm thấy tin tức"` | ⬜ |

### 8.2 Quản lý Tin tức (Admin)

| ID | Kịch bản | Endpoint & Input | HTTP Code kỳ vọng | Response kỳ vọng | Status |
|----|----------|-----------------|-------------------|-----------------|--------|
| NEWS-04 | Tạo bài viết tối thiểu (JSON) | `POST /api/news` `{"title":"Thị trường BĐS Q4/2026","excerpt":"Phân tích xu hướng..."}` | `201` | `success:true`, bài viết tạo với `category:"Thị trường"` mặc định | ⬜ |
| NEWS-05 | Tạo bài viết đầy đủ | title, excerpt, content, category, featured:true | `201` | `featured:true`, `category` như đã truyền | ⬜ |
| NEWS-06 | Tạo bài viết + upload ảnh bìa | multipart/form-data + file imageFile | `201` | `data.image` là chuỗi base64 hoặc URL | ⬜ |
| NEWS-07 | Thiếu title | `{"excerpt":"Tóm tắt..."}` | `400` | `"Vui lòng nhập đủ tiêu đề và tóm tắt"` | ⬜ |
| NEWS-08 | Thiếu excerpt | `{"title":"Tiêu đề"}` | `400` | `"Vui lòng nhập đủ tiêu đề và tóm tắt"` | ⬜ |
| NEWS-09 | Ảnh bìa > 10MB | file > 10MB | `400` | `"Ảnh bìa quá lớn. Vui lòng chọn ảnh dưới 10MB"` | ⬜ |
| NEWS-10 | Cập nhật tiêu đề bài viết | `PUT /api/news/<id>` `{"title":"Tiêu đề cập nhật","excerpt":"xxx","featured":false}` | `200` | `data.title:"Tiêu đề cập nhật"` | ⬜ |
| NEWS-11 | Cập nhật ảnh bìa | `PUT /api/news/<id>` + file imageFile | `200` | `data.image` mới | ⬜ |
| NEWS-12 | Đánh dấu Featured = true | `PUT /api/news/<id>` `{"featured":"true"}` | `200` | `data.featured:true` | ⬜ |
| NEWS-13 | Xóa bài viết | `DELETE /api/news/<id>` | `200` | `"Đã xóa tin tức"` | ⬜ |
| NEWS-14 | Xóa bài viết không tồn tại | `DELETE /api/news/nonexistent` | `500` | Lỗi server (Prisma not found) | ⬜ |
| NEWS-15 | Xóa hàng loạt hợp lệ | `POST /api/news/bulk-delete` `{"ids":["id1","id2"]}` | `200` | `"Đã xóa hàng loạt tin tức thành công"` | ⬜ |
| NEWS-16 | Xóa hàng loạt IDs rỗng | `{"ids":[]}` | `400` | `"Danh sách ID không hợp lệ"` | ⬜ |

---

## 9. Phân quyền RBAC – Kiểm tra Chéo Role

> ⚠️ Kiểm tra kỹ các trường hợp **UI ẩn chức năng** và **API từ chối** khi sai role.

### 9.1 Chức năng chỉ Sale + Admin (Guest & Client bị chặn)

| ID | Chức năng | Test với Role | Hành vi kỳ vọng trên UI | Status |
|----|-----------|--------------|------------------------|--------|
| RBAC-01 | Truy cập trang/menu Đăng tin | **Guest** | Redirect về trang Login | ⬜ |
| RBAC-02 | Truy cập trang Đăng tin | **Client** | Menu "Đăng tin" ẩn hoàn toàn; truy cập URL trực tiếp bị redirect | ⬜ |
| RBAC-03 | Dùng nút AI Rewrite mô tả | **Guest** | Redirect về Login khi bấm | ⬜ |
| RBAC-04 | Truy cập Tab "Tin của tôi" | **Guest** | Redirect về Login | ⬜ |
| RBAC-05 | Truy cập Tab "Tin của tôi" | **Client** | Tab không hiển thị hoặc redirect | ⬜ |
| RBAC-06 | Truy cập Broker CRM | **Client** | Tab CRM không hiển thị | ⬜ |
| RBAC-07 | Truy cập Broker CRM | **Guest** | Redirect về Login | ⬜ |
| RBAC-08 | Xuất Excel CRM | **Client** | Nút không hiển thị | ⬜ |

### 9.2 Chức năng chỉ Admin (Sale & Client bị chặn)

| ID | Chức năng | Test với Role | Hành vi kỳ vọng | Status |
|----|-----------|--------------|-----------------|--------|
| RBAC-09 | Tab Kiểm duyệt tin (Approve/Reject) | **Sale** | Tab ẩn hoặc không có nút duyệt | ⬜ |
| RBAC-10 | Tab Quản lý Tài khoản User | **Sale** | Tab ẩn | ⬜ |
| RBAC-11 | Xem Admin Dashboard | **Sale** | Thấy Broker Dashboard, không thấy Admin Dashboard | ⬜ |
| RBAC-12 | Xem Admin Dashboard | **Client** | Redirect hoặc ẩn hoàn toàn | ⬜ |
| RBAC-13 | Import tin hàng loạt | **Sale** | Nút Import không hiển thị | ⬜ |
| RBAC-14 | Thay đổi role người dùng | **Sale** | Không có quyền | ⬜ |
| RBAC-15 | Xóa người dùng khác | **Sale** | Không có quyền, không thấy nút | ⬜ |
| RBAC-16 | Xem Dashboard thống kê toàn sàn | **Guest** | Redirect về Login | ⬜ |
| RBAC-17 | Quản lý Cài đặt Hệ thống | **Sale** | Tab cài đặt ẩn | ⬜ |
| RBAC-18 | Trả lời liên hệ khách | **Sale** | Không thấy nút Reply | ⬜ |
| RBAC-19 | Quản lý Tin tức (tạo/sửa/xóa) | **Sale** | Tab News Management ẩn | ⬜ |

### 9.3 Chức năng mở cho tất cả (kể cả Guest)

| ID | Chức năng | Kết quả kỳ vọng | Status |
|----|-----------|-----------------|--------|
| RBAC-20 | Xem danh sách tin đăng | Mọi user (kể cả chưa đăng nhập) đều thấy | ⬜ |
| RBAC-21 | Xem điểm AI và trust score trên card | Hiển thị cho tất cả không cần login | ⬜ |
| RBAC-22 | Chat với Trợ lý ảo AI 24/7 | Chatbot widget hiển thị và phản hồi cho mọi user | ⬜ |
| RBAC-23 | Gửi Form liên hệ (Contact page) | Guest gửi được không cần login | ⬜ |
| RBAC-24 | Xem Bản đồ Leaflet | Map hiển thị, ghim và popup hoạt động không cần login | ⬜ |
| RBAC-25 | Xem Trang Chi tiết BĐS | Không cần login | ⬜ |
| RBAC-26 | Xem Trang Tin tức | Không cần login | ⬜ |
| RBAC-27 | Đặt lịch xem nhà (form liên hệ trên tin) | Ai cũng gửi được | ⬜ |

---

## 10. Giao diện & UX Frontend

### 10.1 Trang Danh sách Tin đăng (Listings)

| ID | Mô tả | Thực hiện | Kết quả kỳ vọng | Status |
|----|-------|-----------|-----------------|--------|
| UI-01 | Nhãn "Top Verified" trên tin ≥ 80 điểm | Xem trang danh sách | Tin aiScore ≥ 80 có huy hiệu ✨ / badge riêng biệt | ⬜ |
| UI-02 | Tin điểm cao đứng đầu danh sách | — | Thứ tự đúng theo aiScore giảm dần | ⬜ |
| UI-03 | Bộ lọc "Mua bán / Cho thuê" | Chọn "Cho thuê" | Chỉ tin `transactionType:"rent"` | ⬜ |
| UI-04 | Bộ lọc khoảng giá "2–5 tỷ" | Chọn khoảng giá | Chỉ tin trong phạm vi | ⬜ |
| UI-05 | Bộ lọc loại BĐS "Căn hộ" | Chọn "Căn hộ" | Chỉ tin `propertyType:"apartment"` | ⬜ |
| UI-06 | Bộ lọc theo tỉnh/thành phố | Chọn "TP.HCM" | Chỉ tin vị trí TP.HCM | ⬜ |
| UI-07 | Bộ lọc "Có pháp lý (Sổ hồng/Sổ đỏ)" | Tick checkbox pháp lý | Chỉ tin có `legalStatus` không rỗng | ⬜ |
| UI-08 | Tìm kiếm từ khóa | Nhập "Masteri" vào ô search | Tin có "Masteri" trong title | ⬜ |
| UI-09 | Xóa bộ lọc / Reset | Bấm "Xóa lọc" | Hiển thị lại toàn bộ tin | ⬜ |
| UI-10 | Pagination hoặc infinite scroll | Cuộn xuống cuối trang | Tải thêm tin hoặc hiển thị đúng số trang | ⬜ |

### 10.2 Trang Chi tiết BĐS

| ID | Mô tả | Kết quả kỳ vọng | Status |
|----|-------|-----------------|--------|
| UI-11 | Hiển thị đầy đủ thông tin | title, price, location, area, beds, baths, legalStatus, description, images | ⬜ |
| UI-12 | Gallery ảnh hoạt động | Bấm vào ảnh → phóng to / chuyển ảnh | ⬜ |
| UI-13 | Biểu đồ Radar 5 tiêu chí | Radar chart hiển thị với 5 trục: Tiêu đề, Thông tin, Mô tả, Nhất quán, Ảnh | ⬜ |
| UI-14 | Giá trị Radar khớp điểm API | Giá trị mỗi trục bằng `score/maxScore * 100` của tiêu chí | ⬜ |
| UI-15 | Bản đồ Leaflet ghim đúng vị trí | Map hiển thị, ghim đúng tọa độ (nếu có) | ⬜ |
| UI-16 | Popup bản đồ có thông tin | Bấm vào ghim → Popup hiện tiêu đề, giá, điểm AI | ⬜ |
| UI-17 | Huy hiệu Điểm AI (aiScore) | Badge hiện số điểm đúng | ⬜ |
| UI-18 | Huy hiệu Uy tín (TrustScore) | TrustScore đúng công thức `min(99,max(50,round(AIScore×0.82+Bonuses)))` | ⬜ |
| UI-19 | Form liên hệ / đặt lịch xem nhà | Điền form → gửi → thông báo thành công | ⬜ |

### 10.3 Trợ lý ảo Chatbot AI

| ID | Mô tả | Thực hiện | Kết quả kỳ vọng | Status |
|----|-------|-----------|-----------------|--------|
| UI-20 | Widget xuất hiện trên mọi trang | Truy cập bất kỳ trang | FAB icon ở góc dưới phải màn hình | ⬜ |
| UI-21 | Mở widget | Bấm FAB | Widget mở với animation mượt mà | ⬜ |
| UI-22 | Đóng widget | Bấm nút đóng hoặc bấm FAB lại | Widget đóng | ⬜ |
| UI-23 | Gửi câu hỏi pháp lý | "Thủ tục sang tên sổ đỏ mất bao lâu?" | Phản hồi tiếng Việt liên quan pháp lý BĐS | ⬜ |
| UI-24 | Gửi câu hỏi tài chính | "Vay mua nhà 3 tỷ cần điều kiện gì?" | AI tư vấn về điều kiện vay, lãi suất | ⬜ |
| UI-25 | Gợi ý BĐS theo ngân sách | "Tôi có 2 tỷ nên mua nhà ở đâu?" | AI gợi ý khu vực phù hợp tại TP.HCM | ⬜ |
| UI-26 | Loading state trong khi AI trả lời | Gửi câu hỏi → chờ | Hiển thị trạng thái loading (spinner/dots) | ⬜ |
| UI-27 | Lịch sử chat trong session | Gửi nhiều tin → cuộn lên | Lịch sử chat hiển thị đúng thứ tự | ⬜ |

### 10.4 Luồng Đăng tin Broker

| ID | Mô tả | Thực hiện | Kết quả kỳ vọng | Status |
|----|-------|-----------|-----------------|--------|
| UI-28 | Form đăng tin có đủ trường | Login Sale → Bấm "Đăng tin" | Hiển thị: Tiêu đề, Vị trí, Giá, Diện tích, Loại giao dịch, Loại BĐS, Phòng ngủ, Phòng tắm, Pháp lý, Mô tả, Upload ảnh | ⬜ |
| UI-29 | Preview điểm AI trước khi đăng | Điền form đầy đủ + upload ảnh → Bấm "Kiểm tra chất lượng" | Thanh điểm hiển thị (0–100), breakdown 5 tiêu chí, gợi ý cải thiện | ⬜ |
| UI-30 | Nút AI Tạo mô tả | Điền mô tả thô → Bấm "AI Tạo mô tả" | Loading state → Mô tả được thay thế bằng nội dung AI viết lại | ⬜ |
| UI-31 | Xác nhận đăng tin | Bấm "Đăng tin" | Thông báo thành công, tin chuyển trạng thái Pending | ⬜ |
| UI-32 | Tin mới xuất hiện trong tab "Tin của tôi" | Sau khi đăng → Bấm tab | Tin vừa đăng có `status: Pending` | ⬜ |
| UI-33 | Tin đã được duyệt hiện trên trang public | Admin duyệt tin → Vào trang public | Tin xuất hiện trong danh sách | ⬜ |

### 10.5 Admin Dashboard UI

| ID | Mô tả | Kết quả kỳ vọng | Status |
|----|-------|-----------------|--------|
| UI-34 | Cards thống kê hiển thị đúng | Số liệu tổng Sale, Tin chờ duyệt, Giao dịch thành công khớp DB | ⬜ |
| UI-35 | Tab "Kiểm duyệt Tin" | Danh sách tin Pending, nút Duyệt/Từ chối hoạt động | ⬜ |
| UI-36 | Tab "Quản lý Tài khoản" | Danh sách user với role, status, số tin đăng | ⬜ |
| UI-37 | Tab "Phân tích Thị trường" | Biểu đồ Donut/Pie phân bổ danh mục, biểu đồ xu hướng MoM | ⬜ |
| UI-38 | Tab "Top BĐS Đề xuất" | Danh sách Top 10 BĐS với recommendationScore | ⬜ |
| UI-39 | Tab "Quản lý Tin tức" | Danh sách bài viết, nút Tạo/Sửa/Xóa | ⬜ |
| UI-40 | Tab "Quản lý Liên hệ" | Danh sách liên hệ, nút Trả lời/Xóa | ⬜ |
| UI-41 | Tab "Cài đặt Hệ thống" | 4 toggle switches hoạt động | ⬜ |

---

## 11. Test Kịch bản End-to-End (E2E)

> Các kịch bản mô phỏng luồng thực tế từ đầu đến cuối, kết hợp nhiều module.

### E2E-01: Luồng Môi giới Đăng tin → Admin Duyệt → Khách thấy tin

**Người thực hiện:** Sale01, Admin, Guest

| Bước | Thực hiện | Kết quả kỳ vọng | Status |
|------|-----------|-----------------|--------|
| 1 | Login Sale01 | Dashboard Sale hiển thị | ⬜ |
| 2 | Điền form đăng tin đầy đủ + upload 3 ảnh | Form hợp lệ | ⬜ |
| 3 | Bấm "AI Tạo mô tả" | Mô tả AI viết vào form | ⬜ |
| 4 | Bấm "Kiểm tra chất lượng" | Điểm AI hiển thị (kỳ vọng 70+) | ⬜ |
| 5 | Bấm "Đăng tin" | Tin tạo với status Pending | ⬜ |
| 6 | Xác nhận tin trong Tab "Tin của tôi" | Tin có status Pending | ⬜ |
| 7 | Login Admin → Tab Kiểm duyệt | Tin của Sale01 xuất hiện | ⬜ |
| 8 | Admin bấm "Duyệt" | status chuyển sang Approved | ⬜ |
| 9 | Guest truy cập trang Listings | Tin Sale01 vừa đăng xuất hiện | ⬜ |
| 10 | Guest xem chi tiết tin | Điểm AI, TrustScore, Radar, Bản đồ hiển thị đúng | ⬜ |

### E2E-02: Luồng Khách liên hệ → CRM Lead → Sale chăm sóc

**Người thực hiện:** Guest, Admin/Sale

| Bước | Thực hiện | Kết quả kỳ vọng | Status |
|------|-----------|-----------------|--------|
| 1 | Guest vào trang chi tiết tin | Hiển thị form liên hệ | ⬜ |
| 2 | Guest điền form: tên, SĐT, email, message | Form hợp lệ | ⬜ |
| 3 | Gửi form | `201 Created`, thông báo thành công | ⬜ |
| 4 | Login Admin → Tab "Quản lý Liên hệ" | Liên hệ mới xuất hiện với status Pending | ⬜ |
| 5 | Admin tạo Lead từ thông tin khách (Tab CRM) | Lead mới với type="hot_lead" | ⬜ |
| 6 | Admin phân công lead cho Sale01 | `assignedSale = sale01_id` | ⬜ |
| 7 | Login Sale01 → Tab CRM | Lead mới xuất hiện | ⬜ |
| 8 | Sale01 gọi điện → cập nhật ghi chú + đổi status "viewing" | Status cập nhật, Score tăng | ⬜ |
| 9 | Admin trả lời email liên hệ | Email gửi đến khách, status "Replied" | ⬜ |

### E2E-03: Luồng Đăng ký → Xác thực OTP → Đăng nhập

| Bước | Thực hiện | Kết quả kỳ vọng | Status |
|------|-----------|-----------------|--------|
| 1 | Truy cập trang Đăng ký | Form đăng ký hiển thị | ⬜ |
| 2 | Điền email mới, name, password → Submit | `requireVerification:true`, thông báo kiểm tra email | ⬜ |
| 3 | Kiểm tra hộp thư → Lấy OTP 6 số | OTP nhận được trong vòng 2 phút | ⬜ |
| 4 | Nhập OTP vào form xác thực | `"Xác thực thành công"` | ⬜ |
| 5 | Đăng nhập với email/password vừa đăng ký | `success:true`, `role:"user"` | ⬜ |
| 6 | Kiểm tra chức năng Client | Thấy được tin đăng, dùng chatbot, gửi liên hệ | ⬜ |

### E2E-04: Luồng Admin Quản lý Team Sale

| Bước | Thực hiện | Kết quả kỳ vọng | Status |
|------|-----------|-----------------|--------|
| 1 | Login Admin → Tab Quản lý Tài khoản | Danh sách user hiển thị | ⬜ |
| 2 | Tạo tài khoản Sale mới: `newsale@test.vn` | `201`, role=sale, Active | ⬜ |
| 3 | Login với tài khoản Sale mới (không cần OTP) | Đăng nhập thành công | ⬜ |
| 4 | Sale mới đăng 1 tin | Tin tạo với status Pending | ⬜ |
| 5 | Admin khóa tài khoản Sale mới | status=Locked | ⬜ |
| 6 | Sale mới cố đăng nhập | `403 "Tài khoản đã bị khóa"` | ⬜ |
| 7 | Admin mở khóa | status=Active | ⬜ |
| 8 | Sale mới đăng nhập lại | Thành công | ⬜ |
| 9 | Admin xóa tài khoản Sale mới | `200` | ⬜ |
| 10 | Kiểm tra tin đăng của Sale đã xóa | Tin vẫn tồn tại với `authorId:null` | ⬜ |

---

## 12. Checklist Nhanh Trước Demo

> Chạy qua checklist này trong vòng 15 phút để đảm bảo hệ thống hoạt động trước khi demo/bảo vệ.

### ✅ Backend Server
- [ ] `npm run dev` trong `/backend` → Server chạy trên port **5001**
- [ ] Không có lỗi kết nối DB trong console
- [ ] `GET http://localhost:5001/api/properties` → trả về JSON hợp lệ

### ✅ Frontend
- [ ] `npm run dev` trong `/Web` → Vite chạy trên port **5173**
- [ ] Trang chủ load thành công, không có lỗi console đỏ
- [ ] Danh sách tin đăng hiển thị

### ✅ Các chức năng AI
- [ ] Chatbot widget mở và phản hồi
- [ ] Vào trang Broker Dashboard → Điền form → "Kiểm tra chất lượng AI" trả về điểm
- [ ] "AI Tạo mô tả" hoạt động (hoặc Fallback Engine hoạt động nếu hết quota)

### ✅ Các Role chính
- [ ] Guest: xem tin, xem bản đồ, xem chatbot OK
- [ ] Admin: đăng nhập, vào Dashboard, xem CRM OK
- [ ] Sale: đăng nhập, vào Broker Dashboard, thấy "Tin của tôi" OK

### ✅ Xác thực Email
- [ ] Đăng ký tài khoản mới → nhận OTP trong email < 2 phút

---

## 13. Bảng Tổng kết & Theo dõi Bug

### 13.1 Bảng Tổng kết theo Module

| Module | Tổng TCs | Pass ✅ | Fail ❌ | Partial ⚠️ | Chưa Test ⬜ | Tỷ lệ Pass |
|--------|----------|---------|---------|------------|-------------|-----------|
| AUTH | 29 | | | | 29 | 0% |
| PROPERTIES | 14 | | | | 14 | 0% |
| AI – Score | 18 | | | | 18 | 0% |
| AI – Rewrite | 8 | | | | 8 | 0% |
| AI – Market | 6 | | | | 6 | 0% |
| AI – Recommend | 6 | | | | 6 | 0% |
| CRM | 44 | | | | 44 | 0% |
| ADMIN | 47 | | | | 47 | 0% |
| CONTACTS | 17 | | | | 17 | 0% |
| NEWS | 16 | | | | 16 | 0% |
| RBAC | 27 | | | | 27 | 0% |
| UI/UX | 41 | | | | 41 | 0% |
| E2E | 34 | | | | 34 | 0% |
| **TỔNG** | **307** | **0** | **0** | **0** | **307** | **0%** |

### 13.2 Log Bug

| Bug ID | Ngày phát hiện | Module | Test Case | Mô tả Bug | Bước tái hiện | Mức độ | Trạng thái |
|--------|----------------|--------|-----------|-----------|---------------|--------|------------|
| BUG-001 | — | — | — | *(Chưa có bug)* | — | — | — |

> **Mức độ:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## 14. Lệnh cURL Mẫu & Hướng dẫn Công cụ

### 14.1 Lệnh cURL Mẫu

```bash
# ─── AUTH ──────────────────────────────────────────
# Đăng nhập Admin
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@estateai.vn","password":"Test@12345"}'

# Đăng ký tài khoản mới
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test_new@gmail.com","password":"Test@12345"}'

# Xác thực OTP
curl -X POST http://localhost:5001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test_new@gmail.com","code":"123456"}'

# ─── PROPERTIES ────────────────────────────────────
# Lấy danh sách tin công khai
curl http://localhost:5001/api/properties

# Lấy tin theo authorId
curl "http://localhost:5001/api/properties?authorId=<USER_ID>"

# Lấy chi tiết tin
curl http://localhost:5001/api/properties/<PROPERTY_ID>

# ─── AI ────────────────────────────────────────────
# Chấm điểm tin (CHẤT LƯỢNG CAO)
curl -X POST http://localhost:5001/api/ai/score-listing \
  -H "Content-Type: application/json" \
  -d '{
    "property": {
      "title": "Bán căn hộ 2PN 75m2 Masteri Centre Point có sổ hồng",
      "transactionType": "sale",
      "propertyType": "apartment",
      "location": "Quận 9, TP.HCM",
      "price": "3.5 tỷ",
      "area": "75",
      "beds": "2",
      "baths": "2",
      "legalStatus": "Sổ hồng riêng",
      "description": "Căn hộ Masteri Centre Point tầng cao view công viên, nội thất đầy đủ bao gồm tủ bếp, máy lạnh, máy nước nóng. Pháp lý sổ hồng riêng rõ ràng, thuận tiện vay ngân hàng. Khu căn hộ cao cấp với đầy đủ tiện ích hồ bơi, gym, công viên nội khu. Phù hợp ở thực hoặc đầu tư cho thuê dài hạn."
    },
    "imageCount": 5
  }'

# Chấm điểm tin (CHẤT LƯỢNG THẤP)
curl -X POST http://localhost:5001/api/ai/score-listing \
  -H "Content-Type: application/json" \
  -d '{"property":{"title":"Nhà đẹp","transactionType":"sale","propertyType":"house","location":"HCM","price":"5 ty","area":"","beds":"","baths":"","legalStatus":"","description":"Nhà đẹp cần bán gấp liên hệ ngay"},"imageCount":0}'

# AI Viết lại mô tả
curl -X POST http://localhost:5001/api/ai/rewrite-description \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Nhà 3 phòng ngủ gần chợ có sổ hồng giá thương lượng",
    "property": {
      "transactionType": "sale",
      "propertyType": "house",
      "location": "Quận Bình Thạnh, TP.HCM",
      "price": "4.2 tỷ",
      "area": "60",
      "beds": "3",
      "baths": "2",
      "legalStatus": "Sổ hồng"
    }
  }'

# Phân tích thị trường
curl http://localhost:5001/api/ai/market-analysis

# Top 10 BĐS đề xuất
curl http://localhost:5001/api/ai/recommendations

# ─── ADMIN ─────────────────────────────────────────
# Xem dashboard
curl http://localhost:5001/api/admin/dashboard

# Duyệt tin (Approved)
curl -X PUT http://localhost:5001/api/admin/properties/<PROPERTY_ID>/status \
  -H "Content-Type: application/json" \
  -d '{"status":"Approved"}'

# Từ chối tin (Rejected)
curl -X PUT http://localhost:5001/api/admin/properties/<PROPERTY_ID>/status \
  -H "Content-Type: application/json" \
  -d '{"status":"Rejected"}'

# Khóa tài khoản
curl -X PUT http://localhost:5001/api/admin/users/<USER_ID>/status \
  -H "Content-Type: application/json" \
  -d '{"status":"Locked"}'

# Đổi role
curl -X PUT http://localhost:5001/api/admin/users/<USER_ID>/role \
  -H "Content-Type: application/json" \
  -d '{"role":"sale"}'

# Tạo tài khoản Sale
curl -X POST http://localhost:5001/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Nguyen Van Sale","email":"newsale@test.vn","password":"Test@12345"}'

# Xóa người dùng
curl -X DELETE http://localhost:5001/api/admin/users/<USER_ID>

# ─── CONTACTS ──────────────────────────────────────
# Gửi liên hệ (Public)
curl -X POST http://localhost:5001/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"Nguyen Van A","email":"khach@gmail.com","phone":"0901234567","subject":"Hỏi về căn hộ","message":"Tôi muốn xem căn hộ 2PN tại Quận 9, vui lòng liên hệ lại."}'

# Lấy danh sách liên hệ (Admin)
curl http://localhost:5001/api/admin/contacts

# Trả lời liên hệ
curl -X POST http://localhost:5001/api/admin/contacts/<CONTACT_ID>/reply \
  -H "Content-Type: application/json" \
  -d '{"replyText":"Xin chào, cảm ơn bạn đã liên hệ EstateAI. Chúng tôi sẽ sắp xếp lịch xem nhà trong 24h."}'

# ─── NEWS ──────────────────────────────────────────
# Lấy danh sách tin tức
curl http://localhost:5001/api/news

# Tạo bài viết
curl -X POST http://localhost:5001/api/news \
  -H "Content-Type: application/json" \
  -d '{"title":"Thị trường BĐS TP.HCM Q4/2026","excerpt":"Phân tích xu hướng và cơ hội đầu tư cuối năm","content":"Nội dung chi tiết...","category":"Thị trường","featured":true}'

# Xóa bài viết
curl -X DELETE http://localhost:5001/api/news/<NEWS_ID>
```

### 14.2 Công cụ Hỗ trợ

| Công cụ | URL / Cách dùng | Tốt cho |
|---------|----------------|---------|
| **Swagger UI** | `http://localhost:5001/api-docs` | Test API trực tiếp, xem schema |
| **Postman** | Import từ `http://localhost:5001/api-docs/json` | Test có environment, lưu collection |
| **cURL** | Lệnh terminal ở mục 14.1 | Test nhanh, CI/CD |
| **Trình duyệt** | `http://localhost:5173` | Test UI, RBAC, UX |
| **DB Client** | Prisma Studio: `npx prisma studio` trong `/backend` | Xem/sửa data trực tiếp |

### 14.3 Cài đặt Môi trường Test

```bash
# 1. Khởi động Backend
cd /path/to/real_estate_ai_website/backend
npm install
npm run dev
# Server chạy tại http://localhost:5001

# 2. Khởi động Frontend
cd /path/to/real_estate_ai_website/Web
npm install
npm run dev
# Frontend chạy tại http://localhost:5173

# 3. Xem database
cd /path/to/real_estate_ai_website/backend
npx prisma studio
# Mở tại http://localhost:5555

# 4. Xem logs Server
# Giữ terminal backend mở để quan sát console.log khi test
```

---

*📅 Cập nhật lần cuối: 13/10/2026 | Người soạn: EstateAI Dev Team*
*📊 Tổng: **307 test cases** phủ toàn bộ 13 module & kịch bản E2E*
