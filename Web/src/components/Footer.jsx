import { Globe, MessageCircle, Share2, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer-glass">
      <div className="container footer-content">
        <div className="footer-brand">
          <h2 className="logo">Estate<span>AI</span></h2>
          <p>Nền tảng giao dịch bất động sản minh bạch, an toàn được hỗ trợ bởi AI. Tìm nhà đúng giá, thủ tục nhanh gọn và hạn chế rủi ro pháp lý.</p>
          <div className="social-links">
            <a href="#"><Globe size={18} /></a>
            <a href="#"><MessageCircle size={18} /></a>
            <a href="#"><Share2 size={18} /></a>
          </div>
        </div>

        <div className="footer-links">
          <h3>Về chúng tôi</h3>
          <ul>
            <li><a href="#">Giới thiệu EstateAI</a></li>
            <li><a href="#">Tuyển dụng</a></li>
            <li><a href="#">Quy chế hoạt động</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
          </ul>
        </div>

        <div className="footer-links">
          <h3>Dịch vụ</h3>
          <ul>
            <li><a href="#">Tìm nhà thông minh</a></li>
            <li><a href="#">Thẩm định giá AI</a></li>
            <li><a href="#">Bản đồ quy hoạch</a></li>
            <li><a href="#">Gói môi giới Pro</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h3>Thông tin liên hệ</h3>
          <ul>
            <li><MapPin size={18} /> <span>test......</span></li>
            <li><Phone size={18} /> <span>0000000000</span></li>
            <li><Mail size={18} /> <span>[EMAIL_ADDRESS]</span></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2026 EstateAI Vietnam. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Điều khoản</a>
            <a href="#">Bảo mật</a>
            <a href="#">Cookie</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
