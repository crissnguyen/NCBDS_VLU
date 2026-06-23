import { useEffect, useState } from 'react';
import { ArrowRight, Bot, Search, ShieldCheck } from 'lucide-react';
import Hero from '../components/Hero';
import PropertyCard from '../components/PropertyCard';
import { SectionHeader } from '../components/ui';

export default function Home({ setCurrentPage }) {
  const [featuredProperties, setFeaturedProperties] = useState([]);

  useEffect(() => {
    fetch('https://ncbds-vlu.onrender.com/api/properties')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          // Lấy 6 tin mới nhất đã duyệt
          const approved = d.filter(p => p.status === 'Approved');
          setFeaturedProperties(approved.slice(0, 6));
        }
      })
      .catch(e => console.log(e));
  }, []);

  const features = [
    { icon: Search, title: 'Nhập nhu cầu', desc: 'Nói ngân sách, khu vực, mục tiêu.' },
    { icon: Bot, title: 'AI phân tích', desc: 'So giá, vị trí, pháp lý, độ phù hợp.' },
    { icon: ShieldCheck, title: 'Chọn an toàn', desc: 'Ưu tiên tin đáng tin và ít rủi ro.' },
  ];

  return (
    <main>
      <Hero setCurrentPage={setCurrentPage} />

      <section className="landing-trust-strip">
        <div className="container">
          <span>12K+ tin đăng</span>
          <span>98% AI match</span>
          <span>24/7 tư vấn</span>
          <span>Nha Trang focus</span>
        </div>
      </section>

      <section className="landing-section landing-process">
        <div className="container">
          <div className="landing-process__header">
            <span className="eyebrow">Cách hoạt động</span>
            <h2>Tìm nhanh hơn chọn chắc hơn.</h2>
            <p>Một luồng 3 bước gọn từ nhu cầu đến quyết định.</p>
          </div>
          <div className="landing-steps">
            {features.map((feature, index) => (
              <article
                className="landing-step-card"
                key={feature.title}
                style={{ '--animation-order': index }}
              >
                <span className="step-number">0{index + 1}</span>
                <div className="bento-card__icon"><feature.icon size={24} /></div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-featured">
        <div className="container">
          <SectionHeader
            eyebrow="AI đề xuất"
            title="Tin đáng xem hôm nay"
            action={<button className="btn btn-ghost" onClick={() => setCurrentPage('search')}>Xem tất cả <ArrowRight size={16} style={{ marginLeft: 8 }} /></button>}
          />
          <div className="marquee-wrapper">
            <div className="marquee-track">
              {featuredProperties.length > 0 ? (
                [...featuredProperties, ...featuredProperties, ...featuredProperties].map((property, index) => {
                  const mappedProperty = {
                    ...property,
                    image: property.images && property.images.length > 0
                      ? `https://ncbds-vlu.onrender.com${property.images[0]}`
                      : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80',
                    type: property.transactionType === 'sale' ? 'Bán' : 'Cho thuê',
                    intent: property.propertyType === 'apartment' ? 'Căn hộ' : property.propertyType === 'house' ? 'Nhà phố' : 'Đất nền'
                  };
                  return (
                    <div className="marquee-item" key={`${property.id}-${index}`}>
                      <PropertyCard
                        {...mappedProperty}
                        images={property.images}
                        onClick={() => setCurrentPage(`property_detail_${property.id}`)}
                      />
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', width: '100%' }}>Đang tải tin mới...</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        {/* The CTA was removed and replaced by the global Footer */}
      </section>
    </main>
  );
}
