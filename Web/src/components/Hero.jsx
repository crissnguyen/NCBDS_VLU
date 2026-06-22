import { useState } from 'react';
import { ArrowRight, Search, Sparkles } from 'lucide-react';

export default function Hero({ setCurrentPage }) {
  const [query, setQuery] = useState("");
  
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
              placeholder="VD: căn hộ dưới 3 tỷ gần biển"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => setCurrentPage('search')}>
              <Search size={18} />
              Tìm kiếm
            </button>
          </div>
          
          <div className="hero-actions-landing" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => setCurrentPage('projects')}>
              Khám phá Dự án nổi bật <ArrowRight size={18} style={{ marginLeft: '8px' }}/>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
