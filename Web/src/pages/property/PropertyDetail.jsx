import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Bed, Bath, Maximize, ShieldCheck, Sparkles, Phone, MessageCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { mediaUrl } from '../../services/api';
import { dataService } from '../../services/data/dataService';

export default function PropertyDetail({ id, setCurrentPage }) {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  useEffect(() => {
    // Cuộn lên đầu trang
    window.scrollTo(0, 0);

    dataService.getProperty(id)
      .then(data => {
        setProperty(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi lấy chi tiết:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#0f2a44', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#64748b', fontWeight: 600 }}>Đang tải thông tin...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ color: '#0f2a44' }}>Không tìm thấy bất động sản</h2>
        <button onClick={() => setCurrentPage('home')} style={{ padding: '0.75rem 1.5rem', background: '#0f2a44', color: 'white', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Quay lại trang chủ</button>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 
    ? property.images.map(img => mediaUrl(img))
    : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80'];

  const openLightbox = (idx) => {
    setLightboxIdx(idx);
    setShowLightbox(true);
  };

  const renderImages = () => {
    if (images.length === 1) {
      return <img src={images[0]} alt="cover" onClick={() => openLightbox(0)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />;
    }
    
    if (images.length === 2) {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', height: '100%', width: '100%' }}>
          <img src={images[0]} alt="1" onClick={() => openLightbox(0)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
          <img src={images[1]} alt="2" onClick={() => openLightbox(1)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
        </div>
      );
    }

    if (images.length === 3) {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem', height: '100%', width: '100%' }}>
          <img src={images[0]} alt="1" onClick={() => openLightbox(0)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '0.5rem' }}>
            <img src={images[1]} alt="2" onClick={() => openLightbox(1)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
            <img src={images[2]} alt="3" onClick={() => openLightbox(2)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
          </div>
        </div>
      );
    }

    if (images.length === 4) {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem', height: '100%', width: '100%' }}>
          <img src={images[0]} alt="1" onClick={() => openLightbox(0)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <img src={images[1]} alt="2" onClick={() => openLightbox(1)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
            <img src={images[2]} alt="3" onClick={() => openLightbox(2)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
            <img src={images[3]} alt="4" onClick={() => openLightbox(3)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
          </div>
        </div>
      );
    }

    // 5 or more
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '0.5rem', height: '100%', width: '100%' }}>
        <div style={{ gridColumn: '1 / 2', gridRow: '1 / 3' }}>
          <img src={images[0]} alt="1" onClick={() => openLightbox(0)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
        </div>
        <img src={images[1]} alt="2" onClick={() => openLightbox(1)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
        <img src={images[2]} alt="3" onClick={() => openLightbox(2)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
        <img src={images[3]} alt="4" onClick={() => openLightbox(3)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
        <div style={{ position: 'relative' }}>
          <img src={images[4]} alt="5" onClick={() => openLightbox(4)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
          {images.length > 5 && (
            <div onClick={() => openLightbox(4)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.25rem', cursor: 'pointer' }}>
              +{images.length - 5} ảnh
            </div>
          )}
        </div>
      </div>
    );
  };

  const propertyTypeMap = { apartment: 'Căn hộ', house: 'Nhà phố', land: 'Đất nền' };
  const typeDisplay = propertyTypeMap[property.propertyType] || 'Bất động sản';
  const transDisplay = property.transactionType === 'sale' ? 'Bán' : 'Cho thuê';

  return (
    <main style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Custom Responsive Styles for Property Detail Page */}
      <style>{`
        .detail-banner-container {
          width: 100%; 
          height: 50vh; 
          border-radius: 24px; 
          overflow: hidden; 
          position: relative; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          transition: height 0.3s;
        }
        .detail-banner-content {
          position: absolute; 
          bottom: 2rem; 
          left: 2rem; 
          right: 2rem; 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-end; 
          pointer-events: none;
        }
        .detail-grid-layout {
          display: grid; 
          grid-template-columns: 2.5fr 1fr; 
          gap: 2rem; 
          margin-top: 2rem;
        }
        .detail-header-row {
          display: flex; 
          align-items: flex-start; 
          justify-content: space-between; 
          gap: 2rem;
        }
        .detail-title-h1 {
          margin: 0 0 1rem 0; 
          font-size: 2rem; 
          fontWeight: 800; 
          color: #0f2a44; 
          line-height: 1.3;
          transition: font-size 0.2s;
        }
        .detail-price-text {
          font-size: 2.25rem; 
          font-weight: 800; 
          color: #0f766e; 
          line-height: 1;
        }
        .detail-specs-row {
          display: flex; 
          gap: 2rem; 
          margin-top: 2rem; 
          padding-top: 2rem; 
          border-top: 1px solid #f1f5f9;
        }
        .detail-contact-card {
          position: sticky; 
          top: 7rem; 
          background: white; 
          border-radius: 24px; 
          padding: 2rem; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.08); 
          border: 1px solid #e2e8f0;
        }

        @media (max-width: 991px) {
          .detail-grid-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .detail-contact-card {
            position: static;
            margin-top: 1rem;
          }
        }

        @media (max-width: 768px) {
          .detail-banner-container {
            height: 35vh;
            border-radius: 16px;
          }
          .detail-banner-content {
            bottom: 1rem;
            left: 1rem;
            right: 1rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
          .detail-banner-content > div {
            flex-wrap: wrap;
          }
          .detail-header-row {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .detail-header-row > div:last-child {
            text-align: left !important;
          }
          .detail-title-h1 {
            font-size: 1.45rem;
          }
          .detail-price-text {
            font-size: 1.75rem;
          }
          .detail-specs-row {
            flex-direction: column;
            gap: 1.25rem;
            padding-top: 1.5rem;
            margin-top: 1.5rem;
          }
        }
      `}</style>

      {/* Nút Quay Lại */}
      <div className="container" style={{ paddingTop: '6rem', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setCurrentPage('search')} 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'transparent', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem 0' }}
        >
          <ArrowLeft size={18} /> Quay lại tìm kiếm
        </button>
      </div>

      {/* Ảnh Cover */}
      <div className="container">
        <div className="detail-banner-container">
          {renderImages()}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,42,68,0.8) 0%, transparent 50%)', pointerEvents: 'none' }} />
          <div className="detail-banner-content">
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ background: '#0f766e', color: 'white', padding: '0.4rem 1rem', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700 }}>{transDisplay}</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', padding: '0.4rem 1rem', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.3)' }}>{typeDisplay}</span>
            </div>
            {(property.trustScore || 90) >= 80 && (
              <div style={{ background: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: 12, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
                <ShieldCheck size={18} /> Điểm uy tín: {property.trustScore || 90}/100
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nội dung chi tiết */}
      <div className="container detail-grid-layout">
        {/* Cột trái */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ background: 'white', borderRadius: 24, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
            <div className="detail-header-row">
              <div>
                <h1 className="detail-title-h1">{property.title}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '1rem' }}>
                  <MapPin size={18} color="#0f766e" /> {property.location}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="detail-price-text">{property.price}</div>
                <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>Đã xác minh giá AI</div>
              </div>
            </div>

            <div className="detail-specs-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bed size={20} color="#2563eb" /></div>
                <div><div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Phòng ngủ</div><div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{property.beds || '-'}</div></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bath size={20} color="#16a34a" /></div>
                <div><div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Phòng tắm</div><div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{property.baths || '-'}</div></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Maximize size={20} color="#dc2626" /></div>
                <div><div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Diện tích</div><div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{property.area || '-'} m²</div></div>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 24, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f2a44', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="#0f766e" /> Mô tả chi tiết
            </h2>
            <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
              {property.description}
            </div>
          </div>

        </div>

        {/* Cột phải - Liên hệ */}
        <div>
          <div className="detail-contact-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #0f2a44, #0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.5rem' }}>
                {property.author?.name ? property.author.name[0] : 'S'}
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#0f2a44', fontSize: '1.1rem' }}>{property.author?.name || 'Sale Chuyên Nghiệp'}</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>EstateAI Broker</div>
              </div>
            </div>

            <button style={{ width: '100%', padding: '1rem', background: '#0f2a44', color: 'white', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem', boxShadow: '0 4px 12px rgba(15,42,68,0.2)' }}>
              <Phone size={18} /> Yêu cầu gọi lại
            </button>
            <button style={{ width: '100%', padding: '1rem', background: 'white', color: '#0f766e', borderRadius: 12, border: '2px solid #0f766e', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <MessageCircle size={18} /> Nhắn tin Zalo
            </button>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <ShieldCheck size={20} color="#0f766e" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>Tin đăng đã được kiểm duyệt</strong>
                  Thông tin và giá bán đã được AI phân tích và đối chiếu với dữ liệu thị trường.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Overlay */}
      {showLightbox && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setShowLightbox(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', zIndex: 10 }}>
            <X size={36} />
          </button>

          {images.length > 1 && (
            <button onClick={() => setLightboxIdx(p => (p === 0 ? images.length - 1 : p - 1))} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(8px)' }}>
              <ChevronLeft size={32} />
            </button>
          )}

          <img src={images[lightboxIdx]} alt="Lightbox" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }} />

          {images.length > 1 && (
            <button onClick={() => setLightboxIdx(p => (p === images.length - 1 ? 0 : p + 1))} style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(8px)' }}>
              <ChevronRight size={32} />
            </button>
          )}
          
          <div style={{ position: 'absolute', bottom: '1.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '2px' }}>
            {lightboxIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </main>
  );
}
