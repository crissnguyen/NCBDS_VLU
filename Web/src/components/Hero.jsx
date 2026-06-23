import { useState, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';

const placeholders = [
  "căn hộ dưới 3 tỷ gần biển",
  "nhà mặt tiền kinh doanh",
  "đất nền vùng ven tiềm năng",
  "biệt thự ven sông quận 2",
  "chung cư cao cấp có hồ bơi"
];

export default function Hero({ setCurrentPage }) {
  const [query, setQuery] = useState("");
  const [placeholderText, setPlaceholderText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = placeholders[phraseIndex];
    let typingSpeed = isDeleting ? 40 : 60;
    
    // Nếu đang gõ xong 1 câu, chờ 2s rồi mới xóa
    if (!isDeleting && charIndex === currentPhrase.length) {
      typingSpeed = 2000;
    }
    
    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < currentPhrase.length) {
        // Đang gõ chữ
        setPlaceholderText(currentPhrase.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        // Đang xóa chữ
        setPlaceholderText(currentPhrase.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      } else if (!isDeleting && charIndex === currentPhrase.length) {
        // Chuyển sang chế độ xóa
        setIsDeleting(true);
      } else if (isDeleting && charIndex === 0) {
        // Xóa xong, chuyển sang câu tiếp theo
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % placeholders.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex]);
  
  return (
    <section className="hero-immersive">
      <div className="hero-immersive__bg"></div>
      <div className="hero-immersive__overlay"></div>
      
      <div className="container hero-immersive__content">
        <div className="hero-copy" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: '0 auto' }}>
          <span className="eyebrow-glass">EstateAI Vietnam</span>
          <h1 className="hero-title">Tìm nhà đúng giá bằng AI</h1>
          <p className="hero-subtitle">Gợi ý bất động sản, kiểm tra giá và rủi ro pháp lý trong vài giây.</p>

          <div className="search-glass-pill" style={{ marginTop: '1.5rem' }}>
            <Sparkles className="search-icon" size={21} />
            <input
              type="text"
              placeholder={`VD: ${placeholderText}|`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => setCurrentPage('search')}>
              <Search size={18} />
              Tìm kiếm
            </button>
          </div>
          </div>
      </div>
    </section>
  );
}
