import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Hero from '../components/Hero';
import TrustStats from '../components/TrustStats';
import HowItWorks from '../components/HowItWorks';
import PropertyCard from '../components/PropertyCard';
import { SectionHeader } from '../components/ui';
import { mediaUrl } from '../services/api';
import { dataService } from '../services/data/dataService';
import { enrichAndSortProperties } from '../utils/aiScoring';

export default function Home({ setCurrentPage }) {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    dataService.getProperties()
      .then(d => {
        if (active && Array.isArray(d)) {
          const approved = d.filter(p => p.status === 'Approved');
          const sorted = enrichAndSortProperties(approved);
          setFeaturedProperties(sorted.slice(0, 6));
        }
      })
      .catch(() => {
        if (active) setLoadError('Không thể tải tin đăng lúc này. Vui lòng thử lại.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [loadAttempt]);

  const retryLoad = () => {
    setLoading(true);
    setLoadError('');
    setLoadAttempt(attempt => attempt + 1);
  };

  return (
    <main>
      <Hero setCurrentPage={setCurrentPage} />

      <TrustStats />

      <HowItWorks setCurrentPage={setCurrentPage} />

      <section className="landing-section landing-featured">
        <div className="container">
          <SectionHeader
            eyebrow="AI đề xuất"
            title="Tin đáng xem hôm nay"
            action={<button className="view-all-link" onClick={() => setCurrentPage('search')}>Xem tất cả <ArrowRight size={16} style={{ marginLeft: 8 }} /></button>}
          />
          <div className="marquee-wrapper">
            <div className="marquee-track">
              {!loading && !loadError && featuredProperties.length > 0 ? (
                [...featuredProperties, ...featuredProperties, ...featuredProperties].map((property, index) => {
                  const mappedProperty = {
                    ...property,
                    image: property.images && property.images.length > 0
                      ? mediaUrl(property.images[0])
                      : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80',
                    type: property.transactionType === 'sale' ? 'Bán' : 'Cho thuê',
                    intent: property.propertyType === 'apartment' ? 'Căn hộ' : property.propertyType === 'house' ? 'Nhà phố' : 'Đất nền',
                    match: property.aiScore,
                    trust: property.trustScore,
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
                <div role={loadError ? 'alert' : 'status'} style={{ textAlign: 'center', padding: '2rem', color: '#64748b', width: '100%' }}>
                  {loading ? 'Đang tải tin mới...' : loadError || 'Chưa có tin đăng được duyệt.'}
                  {loadError && <button className="btn btn-ghost" onClick={retryLoad}>Thử lại</button>}
                </div>
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
