# TÀI LIỆU NGHIỆP VỤ, KỸ THUẬT VÀ HIỆN TRẠNG HỆ THỐNG ESTATEAI

> **Ngày rà soát:** 15/08/2026  
> **Phiên bản tài liệu:** 1.1  
> **Phạm vi:** rà soát mã nguồn, cấu hình, schema cơ sở dữ liệu và script seed trong repository hiện tại.  
> **Nguyên tắc báo cáo:** phân biệt rõ chức năng đã triển khai, chức năng demo/prototype và chức năng mới dừng ở giao diện/ý tưởng. Những nội dung được đánh dấu “chưa xác minh” không nên trình bày như số liệu production.

## Tóm tắt điều hành

EstateAI là một nền tảng web hỗ trợ đăng tin, tìm kiếm và quản trị bất động sản. Hệ thống đã hình thành khung nghiệp vụ cốt lõi của một cổng thông tin bất động sản: quản lý tài khoản, quản lý tin đăng, kiểm duyệt tin, lưu trữ hình ảnh, tìm kiếm, quản lý tin tức và tiếp nhận yêu cầu liên hệ.

Về AI, phiên bản hiện tại đã tích hợp **Gemini 2.5 Flash** cho trợ lý hội thoại và chức năng viết lại mô tả tin đăng. Hai khái niệm “chấm điểm tin bằng AI” và “phân tích/định giá bất động sản bằng AI” hiện chưa có đủ thành phần để được xem là mô hình AI hoàn chỉnh. Chấm điểm tin mới có các điểm hiển thị và công thức heuristic ở frontend; phân tích giá chưa có route xử lý, API định giá, dataset huấn luyện hoặc mô hình đã train.

Về dữ liệu, mã nguồn chỉ chứng minh được ba nhóm: dữ liệu do người dùng/nhân viên nhập, dữ liệu frontend dùng cho demo và dữ liệu seed backend. Script seed có thể tạo tối đa **95 tin mẫu**, nhưng đây không phải dữ liệu thị trường. Chưa có bằng chứng về crawler, nguồn dữ liệu từ sàn bất động sản bên ngoài hoặc cơ chế nhập 12.000 tin. Số lượng tin production cần được chốt bằng truy vấn trực tiếp trên đúng cơ sở dữ liệu triển khai.

## 1. Tổng quan dự án

EstateAI là nền tảng đăng tin và tìm kiếm bất động sản Việt Nam, hướng tới việc hỗ trợ người mua/người thuê và nhân viên kinh doanh bằng các tính năng dữ liệu và AI. Hệ thống hiện có các nhóm nghiệp vụ chính:

- Người dùng đăng ký, đăng nhập, xác thực email và khôi phục mật khẩu.
- Nhân viên/người dùng tạo, sửa và quản lý tin bất động sản; tin có trạng thái chờ duyệt, đã duyệt hoặc bị từ chối.
- Người dùng tìm kiếm, lọc theo khu vực/khoảng giá/độ tin cậy và xem chi tiết tin.
- Quản trị viên quản lý người dùng, tin đăng, bài viết tin tức và yêu cầu liên hệ.
- AI hỗ trợ hội thoại và viết lại mô tả tin đăng.

Đây là phiên bản ứng dụng web full-stack. Mã nguồn hiện có cả dữ liệu demo ở frontend và dữ liệu seed ở backend; chưa thấy module crawler/import dữ liệu từ các sàn bất động sản bên ngoài.

### 1.1. Mục tiêu nghiệp vụ

1. Tập trung hóa thông tin bất động sản trong một nền tảng thống nhất.
2. Cho phép nhân viên kinh doanh và người dùng tạo, cập nhật và theo dõi tin đăng.
3. Cung cấp cơ chế kiểm duyệt để hạn chế tin chưa đầy đủ hoặc chưa phù hợp được công khai.
4. Hỗ trợ người tìm mua/thuê lọc tin theo nhu cầu và liên hệ với bên đăng tin.
5. Ứng dụng AI vào các tác vụ có tính lặp lại, trước mắt là hội thoại và biên tập nội dung.
6. Tạo nền tảng để phát triển tiếp các mô hình chấm điểm chất lượng tin và ước lượng giá.

### 1.2. Đối tượng sử dụng

| Đối tượng | Nhu cầu chính | Quyền/nghiệp vụ quan sát được |
|---|---|---|
| Người tìm kiếm | Xem, lọc và so sánh bất động sản; gửi yêu cầu tư vấn | Xem danh sách, xem chi tiết, liên hệ |
| Nhân viên sale | Đăng và quản lý nguồn hàng; theo dõi tin của mình | Tạo/sửa tin, tải ảnh, theo dõi trạng thái |
| Quản trị viên | Kiểm soát chất lượng dữ liệu và người dùng | Duyệt/từ chối/xóa tin, quản lý tài khoản, tin tức, liên hệ |
| Hệ thống AI | Hỗ trợ hội thoại và biên tập nội dung | Sinh phản hồi hội thoại, viết lại mô tả theo dữ liệu đầu vào |

## 2. Công nghệ đang sử dụng

### Frontend

- React 19 và React DOM 19.
- Vite 8 cho build và môi trường phát triển.
- JavaScript/JSX, CSS thuần.
- `react-router-dom` không xuất hiện trong package hiện tại; việc chuyển trang đang được tổ chức qua các page/component của ứng dụng.
- `leaflet` và `react-leaflet` cho bản đồ.
- `framer-motion` cho hiệu ứng giao diện.
- `lucide-react` cho bộ biểu tượng.
- `recharts` cho biểu đồ/dashboard.
- `@google/generative-ai` để gọi Gemini ở widget trợ lý AI.

### Backend

- Node.js và Express 5.
- REST API, tài liệu API bằng Swagger (`swagger-jsdoc`, `swagger-ui-express`).
- Prisma 5.21.1 làm ORM.
- PostgreSQL là hệ quản trị cơ sở dữ liệu được khai báo trong `schema.prisma`.
- `bcryptjs` để băm mật khẩu.
- `multer` và `multer-storage-cloudinary` cho upload ảnh; Cloudinary là dịch vụ lưu trữ/ phân phối ảnh được khai báo trong dependencies.
- `nodemailer` cho email xác thực và khôi phục mật khẩu.
- `cors`, `dotenv`, `nodemon` cho CORS, cấu hình môi trường và chạy development.
- Backend cung cấp các nhóm route: `/api/auth`, `/api/properties`, `/api/admin`, `/api/ai`, `/api/news`, `/api/contacts`.

### AI và cấu hình

- Mô hình AI được cấu hình mặc định là **Gemini 2.5 Flash**.
- Backend gọi Gemini REST API qua `generativelanguage.googleapis.com`.
- Frontend `ChatWidget` cũng gọi Gemini trực tiếp bằng SDK/API key frontend.
- API key lấy từ biến môi trường `GEMINI_API_KEY`, `GOOGLE_GEMINI_API_KEY` hoặc `VITE_GEMINI_API_KEY`.

## 3. Hiện trạng ba chức năng AI

| Chức năng | Hiện trạng theo mã nguồn | Kết luận báo cáo |
|---|---|---|
| Chấm điểm tin | Frontend có các trường/giá trị hiển thị như `aiScore`, `trustScore`, `match`; màn hình nhập tin có công thức điểm đơn giản dựa trên số trường đã nhập, số ảnh và độ dài mô tả. Không có route AI, bảng dữ liệu điểm hoặc mô hình ML trong backend. | **Có giao diện/demo và công thức heuristic; chưa phải mô hình AI chấm điểm hoàn chỉnh.** |
| Tạo nội dung | Đã có route `POST /api/ai/rewrite-description`. Route gửi thông tin tin đăng và mô tả gốc đến Gemini 2.5 Flash, yêu cầu tạo lại mô tả tiếng Việt 180–260 từ, không bịa dữ liệu. | **Đã triển khai ở mức tích hợp API và có thể chạy khi cấu hình API key.** Cần kiểm thử quota, lỗi mạng và chất lượng đầu ra trước khi gọi là production hoàn chỉnh. |
| Phân tích giá | Giao diện có nhãn “AI phân tích/Thẩm định giá AI”, nhưng không tìm thấy route xử lý, thuật toán định giá, dataset huấn luyện, pipeline ML hay API định giá bên thứ ba. | **Chưa triển khai chức năng phân tích giá thực tế.** Hiện chưa có bằng chứng hệ thống gọi API định giá sẵn hoặc tự train mô hình. |

### Trả lời trực tiếp câu hỏi “phân tích giá dùng API hay tự train?”

Theo repository hiện tại: **chưa dùng API định giá và cũng chưa tự train mô hình**. Việc Gemini được dùng cho chat và viết nội dung không đồng nghĩa với việc đã có mô hình định giá. Các xử lý giá đang thấy chủ yếu là lưu chuỗi giá, lọc và sắp xếp đơn giản ở frontend.

Nếu phát triển tiếp, có thể chọn một trong hai hướng:

1. **Giai đoạn MVP:** chuẩn hóa dữ liệu giá về giá/m², dùng mô hình thống kê hoặc machine learning đơn giản (ví dụ Gradient Boosting/Random Forest) trên dữ liệu tin đã làm sạch; trả về khoảng giá, không chỉ một con số.
2. **Giai đoạn nâng cao:** bổ sung dữ liệu giao dịch thực tế có nhãn, đặc trưng vị trí/toạ độ, diện tích, loại nhà, pháp lý, tuổi công trình và thời điểm; sau đó đánh giá bằng MAE/RMSE trên tập test theo khu vực và thời gian.

Không nên tuyên bố “AI định giá” cho đến khi có dataset, cách chia train/test, metric và kết quả kiểm thử được lưu lại.

## 4. Nguồn dữ liệu bất động sản và số lượng tin

### Nguồn dữ liệu đã xác định trong mã nguồn

- **Dữ liệu do người dùng/nhân viên nhập:** API tạo tin nhận các trường tiêu đề, giá, vị trí, diện tích, số phòng, pháp lý, mô tả và ảnh.
- **Dữ liệu seed/mẫu:** `backend/prisma/seed.js` tạo dữ liệu dashboard mẫu cho bốn tài khoản sale. Số tin tối đa theo cấu hình seed là **95 tin**: 32 + 18 + 0 + 45. Đây là dữ liệu giả lập, trong đó giá được sinh ngẫu nhiên và vị trí mẫu là Nha Trang, Khánh Hòa.
- **Dữ liệu frontend tĩnh/local:** `Web/src/data/properties.js` và `Web/src/services/data/localStore.js` chứa một tập tin mẫu phục vụ giao diện/offline demo. Đây không phải nguồn dữ liệu thị trường và không nên cộng vào số liệu database.
- **Bài viết:** `backend/seedNews.js` có dữ liệu bài viết mẫu; đây là dữ liệu nội dung, không phải dữ liệu tin bất động sản.

### Những nguồn chưa thấy trong repository

Chưa thấy crawler, scraper, job đồng bộ, file CSV/JSON dữ liệu lớn, kết nối Batdongsan/Chợ Tốt/nhadat247 hoặc nguồn dữ liệu giao dịch công khai nào. Vì vậy, hiện **chưa có căn cứ để nói dữ liệu được lấy từ các sàn bên ngoài**, cũng chưa có căn cứ để báo cáo “12K+ tin đăng”. Con số “12K+” trên giao diện trang chủ là thông điệp hiển thị, không được chứng minh bởi truy vấn dữ liệu trong mã nguồn.

### Số lượng tin có thể báo cáo

- **Số tin trong seed mẫu:** 95 tin tối đa theo script seed.
- **Số tin frontend demo:** có tập dữ liệu tĩnh nhỏ, dùng cho hiển thị; không dùng làm thống kê chính thức.
- **Số tin thực tế trong PostgreSQL hiện tại:** **chưa xác minh**. Tại thời điểm rà soát, database local `localhost:5432` không phản hồi nên chưa thể chạy `COUNT(*)` trên bảng `Property`.

Để chốt số liệu báo cáo, cần bật đúng PostgreSQL hoặc kết nối đúng database môi trường triển khai rồi chạy:

```sql
SELECT COUNT(*) AS total_properties FROM "Property";
SELECT status, COUNT(*) FROM "Property" GROUP BY status;
SELECT "transactionType", COUNT(*) FROM "Property" GROUP BY "transactionType";
```

Nên ghi rõ thời điểm chụp số liệu, môi trường (local/staging/production), số tin bị xoá, số tin chờ duyệt và cách loại trùng.

## 5. Mô hình dữ liệu nghiệp vụ hiện tại

Bảng `Property` lưu: mã tin, tiêu đề, giá dạng chuỗi, vị trí, số phòng ngủ/tắm, diện tích, mô tả, loại giao dịch, loại bất động sản, pháp lý, ảnh, trạng thái, tình trạng đã bán, người tạo và thời gian tạo/cập nhật. Giá hiện đang lưu dạng text như “2.85 Tỷ” hoặc “9 triệu/tháng”, vì vậy chưa phù hợp trực tiếp cho huấn luyện định giá nếu chưa chuẩn hóa đơn vị.

Các trạng thái nghiệp vụ quan sát được gồm `Pending`, `Approved` và các trạng thái quản trị khác. Tin có thể gắn với người đăng; khi xoá người dùng, quan hệ tin được cấu hình `SetNull`.

## 6. Đánh giá mức độ sẵn sàng để báo cáo/paper

### Có thể khẳng định

- Đây là hệ thống web bất động sản full-stack dùng React/Vite, Express, Prisma và PostgreSQL.
- Có quy trình CRUD tin đăng, duyệt tin, quản lý người dùng, ảnh, tin tức và liên hệ.
- Có tích hợp Gemini 2.5 Flash cho trợ lý hội thoại và viết lại mô tả tin.
- Có dữ liệu seed mẫu tối đa 95 tin; dữ liệu này không phải dữ liệu thị trường thực tế.

### Chưa nên khẳng định

- “Đã có mô hình AI chấm điểm tin” — hiện chỉ thấy heuristic/demo và giá trị hiển thị mẫu.
- “Đã có AI phân tích/định giá bất động sản” — chưa có module thực thi.
- “Tự train mô hình định giá” — chưa có dataset, code train, model artifact hoặc metric.
- “Có 12K+ tin đăng” — chưa có truy vấn database hoặc log import chứng minh.
- “Dữ liệu lấy từ sàn X” — chưa thấy connector/crawler và chưa có thông tin cấp phép dữ liệu.

## 7. Việc cần bổ sung để paper có tính kiểm chứng

1. Chốt nguồn dữ liệu và quyền sử dụng; lưu metadata nguồn, thời điểm thu thập, địa bàn và phương pháp loại trùng.
2. Chuẩn hóa giá thành số, đơn vị tiền tệ, loại giao dịch và giá/m²; tách dữ liệu rao bán khỏi dữ liệu giao dịch thành công.
3. Xây dựng bảng/route lưu điểm tin với tiêu chí minh bạch; tách rõ điểm chất lượng tin, điểm phù hợp và điểm uy tín.
4. Xây dựng pipeline định giá, lưu phiên bản dataset/model, chia train/validation/test theo thời gian hoặc theo khu vực để tránh rò rỉ dữ liệu.
5. Báo cáo MAE, RMSE, MAPE, khoảng tin cậy và các trường hợp mô hình không đủ dữ liệu.
6. Bổ sung kiểm thử tích hợp cho Gemini, giới hạn quota, bảo vệ API key frontend và cơ chế kiểm duyệt nội dung AI trước khi xuất bản.

### 7.1. Tóm tắt hiện trạng

EstateAI hiện là một nền tảng đăng tin bất động sản có tích hợp AI ở mức hỗ trợ hội thoại và tạo nội dung. Trong ba chức năng được hỏi, **tạo nội dung là chức năng đã có backend gọi Gemini**, còn **chấm điểm tin mới ở mức heuristic/demo** và **phân tích giá chưa được triển khai**. Dữ liệu hiện xác định được là dữ liệu người dùng nhập, dữ liệu frontend demo và tối đa 95 tin seed; chưa có bằng chứng về crawler, nguồn sàn bên ngoài hay 12K tin thực tế.

## 8. Luồng nghiệp vụ chi tiết

### 8.1. Luồng tạo và duyệt tin đăng

1. Người dùng hoặc nhân viên sale nhập thông tin cơ bản: tiêu đề, giá, vị trí, diện tích, loại bất động sản, loại giao dịch, số phòng, pháp lý, mô tả và hình ảnh.
2. Hệ thống kiểm tra các trường bắt buộc và giới hạn số lượng ảnh.
3. Tin được lưu vào bảng `Property` với trạng thái mặc định `Pending`.
4. Quản trị viên xem danh sách tin chờ duyệt, kiểm tra nội dung và thực hiện duyệt/từ chối.
5. Tin đã duyệt được hiển thị cho người tìm kiếm; tin bị từ chối cần được chỉnh sửa hoặc xử lý lại theo quy trình quản trị.

### 8.2. Luồng hỗ trợ viết nội dung bằng AI

Người đăng nhập một mô tả gốc có tối thiểu 12 ký tự và chọn chức năng tạo nội dung. Frontend gửi mô tả cùng các trường thông tin của tin đến `POST /api/ai/rewrite-description`. Backend xây dựng prompt tiếng Việt, gọi Gemini 2.5 Flash, nhận kết quả, làm sạch định dạng và trả mô tả mới về frontend. Prompt yêu cầu AI không tự bịa tên dự án, tiện ích, pháp lý hoặc cam kết không có trong dữ liệu đầu vào.

Đây là cơ chế **AI sinh nội dung theo yêu cầu (on-demand generation)**, chưa phải mô hình được huấn luyện riêng trên dữ liệu bất động sản của EstateAI. Chất lượng kết quả phụ thuộc vào dữ liệu đầu vào, prompt, quota và độ ổn định của dịch vụ Gemini.

### 8.3. Luồng tìm kiếm và hiển thị điểm

Frontend thực hiện lọc theo khu vực, khoảng giá, loại giao dịch và một số tiêu chí hiển thị. Các trường `aiScore`, `trustScore` và `match` có thể được dùng để trình bày nhãn “phù hợp” hoặc “tin cậy”, nhưng trong mã nguồn hiện tại nhiều giá trị là dữ liệu mẫu hoặc giá trị mặc định. Vì vậy, các điểm này chưa nên được diễn giải là xác suất, độ chính xác mô hình hay kết quả thẩm định độc lập.

## 9. Phân loại mức độ hoàn thành theo tiêu chí nghiệm thu

| Hạng mục | Tiêu chí để gọi là hoàn thành | Bằng chứng hiện có | Mức độ |
|---|---|---|---|
| CRUD tin đăng | Tạo, đọc, sửa, xóa và lưu database | Route properties/admin và model `Property` | Đã triển khai |
| Kiểm duyệt tin | Có trạng thái và thao tác quản trị | `Pending`, `Approved`, route admin | Đã triển khai |
| Tạo mô tả AI | Gọi được mô hình, xử lý lỗi, trả nội dung | `POST /api/ai/rewrite-description` | Đã tích hợp, cần kiểm thử production |
| Trợ lý hội thoại | Chat với Gemini từ giao diện | `ChatWidget.jsx` | Đã có prototype/tích hợp |
| Chấm điểm chất lượng tin | Có tiêu chí, dữ liệu nhãn, mô hình hoặc công thức được đặc tả | Chỉ có heuristic/frontend và giá trị demo | Chưa hoàn thiện |
| Phân tích giá | Có dữ liệu giá chuẩn hóa, pipeline, model/API và metric | Chưa thấy thành phần thực thi | Chưa triển khai |
| Dữ liệu hàng chục nghìn tin | Có nguồn, log đồng bộ, chống trùng và truy vấn kiểm chứng | Chưa thấy crawler/import; DB local chưa truy cập được | Chưa xác minh |

## 10. Cách trình bày phù hợp trong báo cáo/paper

### Cách diễn đạt nên dùng

> “EstateAI tích hợp mô hình Gemini 2.5 Flash thông qua API để hỗ trợ sinh mô tả tin đăng và trả lời hội thoại. Chức năng này sử dụng prompt có ràng buộc không bổ sung thông tin ngoài dữ liệu đầu vào.”

> “Hệ thống có prototype chấm điểm tin dựa trên mức độ đầy đủ của trường dữ liệu, số lượng hình ảnh và độ dài mô tả. Đây là phương pháp heuristic, chưa phải mô hình machine learning được huấn luyện và đánh giá trên tập dữ liệu gắn nhãn.”

> “Chức năng phân tích giá được xác định là hướng phát triển tiếp theo. Phiên bản được khảo sát chưa tích hợp API định giá và chưa có mô hình tự huấn luyện.”

### Cách diễn đạt cần tránh

- “Hệ thống đã tự động định giá bất động sản bằng AI” khi chưa có model/API và metric.
- “Mô hình chấm điểm đạt X% chính xác” khi chưa có ground truth và thiết kế đánh giá.
- “Hệ thống có 12K+ tin đăng” nếu chưa có truy vấn database hoặc báo cáo import tương ứng.
- “Dữ liệu lấy từ [tên sàn]” nếu chưa có connector, ngày thu thập và quyền sử dụng dữ liệu.

## 11. Kế hoạch hoàn thiện chức năng phân tích giá

Để biến phần phân tích giá thành một đóng góp kỹ thuật có thể bảo vệ, cần triển khai theo các bước:

1. **Xác định bài toán:** dự đoán giá bán/giá thuê hoặc giá/m²; không trộn hai loại giao dịch trong cùng một nhãn.
2. **Xây dựng dataset:** mỗi bản ghi phải có giá số, thời điểm, vị trí, diện tích, loại tài sản, số phòng, pháp lý, tình trạng và nguồn dữ liệu.
3. **Làm sạch dữ liệu:** chuẩn hóa đơn vị “tỷ/triệu/tháng”, loại tin trùng, xử lý ngoại lệ, mã hóa khu vực và loại bỏ tin thiếu nhãn.
4. **Chọn baseline:** dùng trung vị giá/m² theo khu vực làm mốc so sánh trước khi thử mô hình ML.
5. **Huấn luyện và đánh giá:** thử Linear Regression/Random Forest/Gradient Boosting; chia tập theo thời gian hoặc khu vực để hạn chế rò rỉ dữ liệu.
6. **Công bố kết quả:** báo cáo MAE, RMSE, MAPE, sai số theo từng khu vực và khoảng dự đoán; nêu rõ giới hạn khi dữ liệu ít hoặc khu vực mới.
7. **Tích hợp sản phẩm:** xây dựng route riêng, lưu phiên bản model, trả về giá ước lượng kèm khoảng giá và cảnh báo “tham khảo”, không coi là chứng thư thẩm định.

## 12. Kết luận sử dụng cho hội đồng/báo cáo

EstateAI đã hoàn thành phần nền tảng web và tích hợp AI sinh nội dung ở mức có thể trình diễn. Đóng góp hiện tại phù hợp để mô tả là **ứng dụng AI tạo sinh vào quy trình đăng tin bất động sản**, không nên mô tả là hệ thống định giá AI hoàn chỉnh. Chấm điểm tin đang ở giai đoạn prototype dựa trên heuristic; phân tích giá là hạng mục phát triển tiếp theo.

Số liệu dữ liệu phải được công bố theo môi trường và thời điểm truy vấn. Với bằng chứng hiện tại, con số an toàn có thể nêu là **95 tin mẫu được cấu hình trong script seed**, đồng thời ghi chú rằng **số tin production chưa xác minh**. Khi có quyền truy cập database triển khai, cần cập nhật lại mục 4 bằng số liệu `COUNT(*)` và bảng phân bố trạng thái trước khi phát hành bản paper cuối cùng.

## 13. Sự cố môi trường local hiện tại

### 13.1. Hiện trạng đã kiểm tra

Tại thời điểm rà soát, các chức năng phụ thuộc backend chưa thể chạy đầy đủ trên local. Kết quả kiểm tra cụ thể:

| Thành phần | Cấu hình/địa chỉ | Kết quả |
|---|---|---|
| Backend Express | `http://localhost:5001` | Chưa có process lắng nghe; gọi `/health` không kết nối được |
| PostgreSQL | `localhost:5432` | Prisma trả lỗi `P1001: Can't reach database server` |
| Database được cấu hình | `real_estate_ai` | Được khai báo trong `backend/.env`, nhưng chưa xác nhận database đang tồn tại và truy cập được |
| Prisma | Schema PostgreSQL | Không thể `db pull`/truy vấn do database chưa kết nối |
| Frontend | Chế độ API | Sẽ không lấy được tin, tài khoản, tin tức và dữ liệu quản trị nếu backend chưa chạy |
| Frontend | Dữ liệu local/demo | Có thể hiển thị một phần giao diện và dữ liệu mẫu, nhưng không đại diện cho dữ liệu database |

### 13.2. Nguyên nhân kỹ thuật có khả năng cao

Nguyên nhân trực tiếp là PostgreSQL chưa sẵn sàng hoặc không thể truy cập từ ứng dụng tại `localhost:5432`. Cấu hình hiện tại có dạng:

```text
postgresql://postgres:<mật khẩu>@localhost:5432/real_estate_ai
```

Ngoài ra, backend chưa được khởi động thành công nên cổng `5001` chưa phục vụ API. Việc thấy cổng 5432 có listener không đủ để kết luận PostgreSQL hoạt động; cần xác nhận container/service thực sự đang chạy, database `real_estate_ai` đã được tạo, user/mật khẩu đúng và cổng được publish chính xác.

### 13.3. Checklist khôi phục local

Thực hiện theo thứ tự sau trên máy phát triển:

1. Kiểm tra Docker Desktop hoặc PostgreSQL service đã khởi động.
2. Xác nhận container PostgreSQL đang chạy và publish cổng `5432`.
3. Kiểm tra database `real_estate_ai`, user `postgres` và mật khẩu trong `backend/.env`.
4. Từ thư mục `backend`, chạy migration/generate Prisma theo quy trình của dự án:

```bash
npm install
npx prisma generate
npx prisma migrate status
```

5. Nếu database mới hoàn toàn, áp dụng migration/schema theo quy ước môi trường của nhóm; chỉ chạy seed sau khi đã xác nhận đúng database đích.
6. Khởi động backend:

```bash
npm run dev
```

7. Kiểm tra API:

```bash
curl http://localhost:5001/health
```

8. Khởi động frontend và kiểm tra `VITE_API_BASE_URL` trỏ về backend đúng địa chỉ, thường là `http://localhost:5001`.

### 13.4. Tiêu chí xác nhận đã khắc phục

Môi trường local chỉ được xem là hoạt động khi đồng thời đạt các điều kiện:

- `curl http://localhost:5001/health` trả về JSON có `success: true`.
- Prisma thực hiện được truy vấn bảng `Property`, `User` và `News`.
- Frontend gọi được `/api/properties` mà không gặp lỗi CORS hoặc `ERR_CONNECTION_REFUSED`.
- Có thể đăng nhập, tạo một tin thử nghiệm, tải ảnh, xem tin và thực hiện thao tác duyệt bằng tài khoản quản trị.
- Log backend không còn lỗi kết nối database hoặc lỗi migration.

### 13.5. Ảnh hưởng đến việc đánh giá dự án

Sự cố local hiện tại **không chứng minh các chức năng nghiệp vụ bị sai**; nó cho thấy môi trường chạy chưa sẵn sàng, cụ thể là tầng database và process backend chưa kết nối. Tuy nhiên, cho đến khi khôi phục được môi trường và chạy kiểm thử end-to-end, chỉ nên ghi trạng thái là “đã có mã nguồn/tích hợp nhưng chưa xác minh runtime local”. Đặc biệt, chưa nên chốt số lượng tin thực tế hoặc khẳng định các chức năng AI chạy ổn định trên local.

## 14. Sự cố đăng nhập tài khoản Prisma

### 14.1. Luồng đăng nhập hiện tại

Frontend gửi `POST /api/auth/login` với `email` và `password`. Backend thực hiện lần lượt:

1. Chuẩn hóa email bằng cách bỏ khoảng trắng và chuyển về chữ thường.
2. Tìm tài khoản trong bảng `User` bằng Prisma, không phân biệt hoa thường.
3. Kiểm tra `isVerified`; nếu bằng `false`, backend trả mã HTTP `403` và yêu cầu xác thực email.
4. So sánh mật khẩu nhập vào với mật khẩu đã băm trong cột `password` bằng `bcrypt.compare`.
5. Trả thông tin người dùng đã loại bỏ mật khẩu nếu xác thực thành công.

Do đó, để một tài khoản Prisma đăng nhập được, cần đồng thời thỏa mãn bốn điều kiện: backend đang chạy, database truy cập được, email tồn tại, `isVerified = true` và mật khẩu được lưu dưới dạng bcrypt hash tương ứng.

### 14.2. Nguyên nhân tài khoản thật chưa đăng nhập được

Trong tình trạng hiện tại, nguyên nhân ưu tiên là **backend/database chưa hoạt động**, không phải do email hoặc mật khẩu. Khi backend chưa lắng nghe tại `localhost:5001`, frontend sẽ rơi vào lỗi “Không thể kết nối đến máy chủ”. Nếu backend chạy nhưng PostgreSQL chưa kết nối, route login sẽ bắt lỗi Prisma và trả `500 Lỗi máy chủ`.

Sau khi khôi phục database, cần kiểm tra tiếp các trường hợp sau:

| Trường hợp | Kết quả dự kiến |
|---|---|
| Không tìm thấy email | `401 Sai email hoặc mật khẩu` |
| `isVerified = false` | `403 Tài khoản chưa được xác thực email` |
| Mật khẩu lưu plaintext hoặc hash không phải bcrypt | `401 Sai email hoặc mật khẩu` |
| Tài khoản có `status = Locked` | Hiện route login chưa kiểm tra trạng thái này; cần bổ sung quy tắc từ chối đăng nhập |
| Tài khoản hợp lệ, đã xác thực, mật khẩu đúng | Đăng nhập thành công |

### 14.3. Lưu ý về script seed hiện tại

Phiên bản `backend/prisma/seed.js` đang có trong workspace đã được mở rộng để tạo/cập nhật năm tài khoản mẫu, gồm tài khoản quản trị `admin@estateai.vn` và bốn tài khoản sale. Script đặt `isVerified: true` và mật khẩu mẫu dùng chung là `sale123` cho các tài khoản seed.

Tuy nhiên, script này **chưa được xem là đã chạy thành công** vì PostgreSQL hiện chưa kết nối được. Ngoài ra, script có thao tác xóa toàn bộ `PropertyImage` và `Property` trước khi tạo lại dữ liệu mẫu; chỉ được chạy trên database local/test đã xác nhận, không chạy tùy tiện trên production.

### 14.4. Cách kiểm tra sau khi database hoạt động

Sau khi PostgreSQL và backend đã chạy, kiểm tra tài khoản bằng truy vấn chỉ đọc hoặc Prisma Studio:

```sql
SELECT email, role, status, "isVerified", LEFT(password, 4) AS password_prefix
FROM "User"
ORDER BY email;
```

Không ghi mật khẩu thật vào log hoặc tài liệu. Với tài khoản seed, cần xác nhận `password_prefix` bắt đầu bằng `$2` hoặc `$2b`, thể hiện mật khẩu được băm bằng bcrypt.

Sau đó kiểm tra API:

```bash
curl -i -X POST http://localhost:5001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@estateai.vn","password":"sale123"}'
```

Kết quả thành công phải có `success: true`, `user.role: "admin"` và không trả trường `password`. Nếu vẫn lỗi, cần đối chiếu mã HTTP với bảng ở mục 14.2 thay vì chỉ đổi mật khẩu nhiều lần.

### 14.5. Quy tắc nghiệp vụ cần bổ sung

Backend nên kiểm tra trạng thái tài khoản trước khi cho đăng nhập:

- `Active`: cho phép đăng nhập nếu email đã xác thực và mật khẩu đúng.
- `Pending`: từ chối hoặc yêu cầu hoàn tất bước kích hoạt theo chính sách dự án.
- `Locked`: từ chối đăng nhập và hiển thị thông báo liên hệ quản trị viên.

Quy tắc này hiện chưa được thực thi đầy đủ trong `POST /api/auth/login`; trường `status` mới chủ yếu được sử dụng ở giao diện quản trị. Đây là một hạng mục cần sửa trước khi nghiệm thu chính thức chức năng phân quyền và đăng nhập.

## 15. Kiểm tra chức năng gửi email xác thực

### 15.1. Kết quả kiểm tra hiện tại

Tại thời điểm rà soát, chức năng gửi email xác thực **chưa được xác nhận là hoạt động ổn định**:

| Hạng mục | Kết quả |
|---|---|
| Cú pháp module mail và route xác thực | Đạt, không có lỗi cú pháp |
| Biến SMTP trong `.env` | Có cấu hình `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |
| SMTP/Nodemailer | Có code tạo transporter và `verify()`, nhưng không được gọi trong hàm gửi thực tế |
| Cơ chế gửi thực tế | Gọi Google Apps Script Web App cố định qua `fetch()` |
| Kết nối endpoint gửi mail | Domain truy cập được, nhưng POST bị redirect rồi trả trang “Không tìm thấy trang” từ Google |
| Gửi email thật | Chưa thực hiện vì chưa có địa chỉ người nhận được chỉ định |

### 15.2. Phát hiện kỹ thuật

Hàm `sendMail()` hiện gửi request đến một URL Google Apps Script cố định và truyền payload gồm `to`, `subject`, `htmlBody` cùng secret. Vì vậy, cấu hình Gmail/SMTP trong `backend/.env` **không quyết định việc gửi email hiện tại**. Phần Nodemailer hiện chưa phải đường gửi chính.

Do đó, việc `.env` có đủ biến SMTP không đồng nghĩa email xác thực sẽ gửi được. Muốn nghiệm thu phải kiểm tra endpoint Google Apps Script, DNS/network, secret, quyền thực thi và khả năng gửi Gmail của Apps Script.

### 15.2.1. Kết quả kiểm tra endpoint thực tế

Endpoint hiện được hard-code trong `backend/services/mail/index.js`. Kiểm tra HTTP cho thấy:

- Request `HEAD` nhận `HTTP 403`, đây có thể là hành vi bình thường vì Web App không thiết kế cho phương thức HEAD.
- Request `POST` không có payload người nhận nhận redirect `HTTP 302` sang `script.googleusercontent.com`.
- Khi theo redirect, Google trả trang lỗi tiếng Việt với nội dung “Không tìm thấy trang” và “Vui lòng kiểm tra địa chỉ và thử lại”.
- Payload kiểm tra không có trường `to`, nên không có email thật nào được gửi trong lần kiểm tra này.

Kết luận kỹ thuật: **endpoint deployment hiện tại không trả về JSON hợp lệ của Apps Script và chưa đủ điều kiện để `sendMail()` hoạt động**. Khả năng cao Web App đã bị xóa, đổi deployment, hết quyền truy cập hoặc URL trong mã nguồn không còn là URL triển khai hiện hành. Đây là lỗi cấu hình/deployment bên ngoài backend, không phải lỗi tạo OTP.

Để khắc phục, cần mở Google Apps Script quản lý endpoint, tạo hoặc triển khai lại Web App với quyền truy cập phù hợp, lấy URL `/exec` mới, cập nhật vào biến môi trường thay vì hard-code, rồi kiểm tra response JSON dạng `{ "success": true }` bằng một email test được cấp phép.

### 15.3. Ảnh hưởng đến luồng đăng ký

Luồng đăng ký tạo người dùng với `isVerified = false`, lưu mã OTP đã băm và thời hạn OTP vào database, sau đó mới gọi `sendMail()`. Nếu gửi mail thất bại, tài khoản có thể đã được tạo nhưng người dùng không nhận được OTP. Khi đăng ký lại cùng email, hệ thống sẽ tạo và gửi lại OTP trong nhánh tài khoản chưa xác thực.

Production nên bổ sung trạng thái gửi mail, thời điểm gửi cuối, số lần gửi lại và giới hạn resend. Không nên trả chi tiết lỗi nội bộ của dịch vụ mail cho người dùng cuối.

### 15.4. Tiêu chí nghiệm thu end-to-end

Chỉ kết luận chức năng ổn định sau khi kiểm tra bằng một email test được cấp phép:

1. Đăng ký email test mới và xác nhận API trả `requireVerification: true`.
2. Kiểm tra email đến đúng hộp thư, không chỉ kiểm tra HTTP 200.
3. Nhập OTP còn hạn và xác nhận `isVerified` chuyển thành `true`.
4. Đăng nhập bằng tài khoản vừa xác thực.
5. Kiểm tra OTP sai, OTP hết hạn, gửi lại OTP và đăng ký lại cùng email.
6. Kiểm tra endpoint mail lỗi: response không được làm lộ secret hoặc thông tin SMTP.

### 15.5. Kết luận báo cáo

Hiện nên ghi: **“Luồng tạo OTP và xác thực email đã được xây dựng; khả năng gửi email thực tế chưa được nghiệm thu end-to-end do endpoint gửi mail bên ngoài chưa kiểm tra thành công.”** Không nên ghi “chức năng gửi mail đã hoạt động ổn định” cho đến khi hoàn thành kiểm thử nhận email thực tế.

## 16. Mô hình phân tích giá và đề xuất bất động sản

### 16.1. Phạm vi đã triển khai

Hệ thống đã bổ sung lớp phân tích AI cho cả trang quản trị và giao diện người dùng. Mục tiêu của lớp này là cung cấp giá tham chiếu, phân tích theo khu vực và xếp hạng các tin đăng phù hợp nhất.

Đây là phiên bản MVP dựa trên phương pháp so sánh dữ liệu, **chưa phải mô hình machine learning dự báo giá đã được huấn luyện bằng dữ liệu lịch sử**. Vì vậy, kết quả hiện tại có giá trị hỗ trợ tham khảo, không được diễn giải là cam kết giá thị trường tương lai.

### 16.2. Nguồn dữ liệu đầu vào

Dữ liệu được lấy từ bảng `Property` trong PostgreSQL, chỉ sử dụng các tin đã được duyệt:

```text
status = "Approved"
```

Các trường được sử dụng gồm:

| Trường | Vai trò |
|---|---|
| `price` | Giá niêm yết dùng để quy đổi về triệu đồng |
| `location` | Nhóm và so sánh theo khu vực |
| `area` | Tính giá tham chiếu trên mỗi m² |
| `propertyType` | Phân biệt căn hộ, nhà phố, đất nền... |
| `transactionType` | Phân biệt mua bán và cho thuê |
| `legalStatus` | Tăng mức độ tin cậy khi xếp hạng |
| `createdAt` | Thời điểm tin được tạo, dùng cho phân tích thời gian về sau |

Nguồn dữ liệu hiện gồm:

- Dữ liệu mẫu được tạo trong `backend/prisma/seed.js`.
- Tin do người dùng hoặc nhân viên đăng và được duyệt.
- Tin được quản trị viên import từ file Excel `.xlsx`.

Hiện hệ thống **chưa kết nối trực tiếp** với Batdongsan.com.vn, Chợ Tốt, sàn giao dịch hoặc cơ sở dữ liệu giao dịch nhà nước. Dữ liệu seed chỉ phục vụ kiểm thử tính năng, không được xem là dữ liệu thị trường thực tế.

### 16.3. Cách tính phân tích hiện tại

Backend chuẩn hóa chuỗi giá như `2.5 tỷ`, `3 tỷ` hoặc `12 triệu/tháng` về đơn vị triệu đồng. Sau đó hệ thống:

1. Lọc các tin có giá hợp lệ.
2. Tính giá trung bình của tập tin được duyệt.
3. Nhóm tin theo khu vực.
4. Tính giá trung bình và giá/m² của từng khu vực nếu có diện tích.
5. So sánh giá từng tin với mặt bằng tham chiếu.
6. Xếp hạng tin dựa trên giá, độ tin cậy và thông tin pháp lý.

Điểm đề xuất MVP được tính từ các yếu tố:

```text
Giá thấp hơn mặt bằng tham chiếu
Độ tin cậy của tin đăng
Có thông tin pháp lý
Có diện tích để so sánh
```

Kết quả đề xuất gồm `recommendationScore`, giá tham chiếu, phần trăm chênh lệch và lý do đề xuất.

### 16.4. API và giao diện sử dụng

Các API hiện có:

```text
GET /api/ai/market-analysis
GET /api/ai/recommendations
```

Trang quản trị có tab **Mô hình AI**, hiển thị:

- Trạng thái phân tích.
- Số lượng tin được sử dụng.
- Giá trung bình tham chiếu.
- Phân tích theo khu vực.
- BĐS có điểm đề xuất cao nhất.
- Nút `Phân tích lại` để lấy dữ liệu mới nhất.

Trang người dùng hiển thị tóm tắt giá trung bình, số lượng mẫu phân tích và điểm đề xuất nổi bật trong trang tìm kiếm BĐS.

### 16.5. Trạng thái mô hình khi báo cáo

| Hạng mục | Trạng thái |
|---|---|
| Đọc dữ liệu tin đã duyệt | Đã triển khai |
| Phân tích giá trung bình | Đã triển khai |
| Phân tích giá/m² | Đã triển khai khi có diện tích |
| Xếp hạng BĐS đề xuất | Đã triển khai ở mức MVP |
| Hiển thị trên Admin | Đã triển khai |
| Hiển thị trên UI người dùng | Đã triển khai |
| Dự báo giá theo thời gian | Chưa triển khai đầy đủ |
| Huấn luyện machine learning | Chưa triển khai |
| Đánh giá MAE/RMSE/R² | Chưa có |
| Tự động học từ file dữ liệu người dùng | Chưa hoàn tất |

### 16.6. Dữ liệu cần có để huấn luyện mô hình thực tế

Để chuyển từ mô hình tham chiếu sang mô hình dự báo, cần bổ sung dataset lịch sử có tối thiểu các cột:

```text
date
location
propertyType
transactionType
price
area
beds
baths
legalStatus
```

Nên có tối thiểu 500–1.000 bản ghi và dữ liệu trải dài ít nhất 12 tháng. Với paper có độ tin cậy tốt hơn, nên có 5.000 bản ghi trở lên, nhiều khu vực và nhiều loại BĐS.

Pipeline dự kiến:

```text
Upload XLSX
  → Kiểm tra dữ liệu
  → Loại bản ghi trùng/lỗi
  → Chuẩn hóa giá và diện tích
  → Lưu dataset lịch sử
  → Chia train/validation/test
  → Huấn luyện mô hình
  → Đánh giá MAE, RMSE, R²
  → Lưu phiên bản model
  → Phục vụ dự báo qua API
```

### 16.7. Kết luận nghiệp vụ

Hiện tại có thể mô tả trong báo cáo rằng hệ thống đã triển khai **module phân tích giá tham chiếu và đề xuất BĐS dựa trên các tin đã duyệt trong PostgreSQL**. Chưa nên ghi rằng hệ thống đã dự báo biến động giá bằng mô hình machine learning hoặc đã tự động huấn luyện từ dữ liệu người dùng, vì hai phần này cần dataset lịch sử và pipeline huấn luyện thực tế trước khi nghiệm thu.
