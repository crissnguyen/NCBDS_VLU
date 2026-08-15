import { useState } from 'react';
import { Check, X, ShieldCheck, Image as ImageIcon, MapPin, Bed, Bath, Maximize, FileText, Info } from 'lucide-react';
import { mediaUrl } from '../../../services/api';

export default function PendingPropertiesTab({ pendingProperties, handleApproveProperty }) {
  const [selectedProperty, setSelectedProperty] = useState(null);

  const getPropertyTypeLabel = (type) => {
    switch (type) {
      case 'apartment': return 'Căn hộ';
      case 'house': return 'Nhà riêng';
      case 'land': return 'Đất nền';
      default: return type || 'Bất động sản';
    }
  };

  const getTransactionTypeLabel = (type) => {
    return type === 'sale' ? 'Bán' : 'Cho thuê';
  };

  return (
    <>
      {/* TAB 2: Phê duyệt */}
      <div>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Phê duyệt tin đăng</h2>
        <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>
          {pendingProperties.length > 0 ? `${pendingProperties.length} tin đang chờ xét duyệt` : 'Không có tin nào cần duyệt'}
        </p>
      </div>

      {pendingProperties.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 14, padding: '3.5rem', textAlign: 'center', border: '1px solid #e2e8f0', marginTop: '1.25rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#d8f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <ShieldCheck size={28} color="#0f766e"/>
          </div>
          <h3 style={{ margin: '0 0 0.4rem' }}>Tất cả tin đã được xử lý!</h3>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.875rem' }}>Mọi thứ đã xong, không có gì cần làm ngay lúc này.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '1.25rem' }}>
          {pendingProperties.map(p => (
            <div key={p.id} className="pending-property-card pending-property-card-v2" style={{
              display: 'grid',
              gridTemplateColumns: '164px minmax(0, 1fr) 132px',
              alignItems: 'center',
              gap: '1.15rem',
              padding: '1rem 1.15rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #fbfefd 100%)',
              borderLeft: '4px solid #f59e0b'
            }}>
              <div style={{ width: 140, height: 96, borderRadius: 10, overflow: 'hidden', background: '#f1f5f9', flexShrink: 0, position: 'relative' }}>
                {p.images?.length > 0 ? (
                  <img src={mediaUrl(p.images[0].url || p.images[0])} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
                ) : (
                  <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:3 }}>
                    <ImageIcon size={22} color="#cbd5e1"/>
                    <span style={{fontSize:'0.68rem',color:'#cbd5e1'}}>Chưa có ảnh</span>
                  </div>
                )}
                {p.images?.length > 1 && (
                  <div style={{ position:'absolute',top:5,right:5,background:'rgba(0,0,0,0.55)',color:'white',borderRadius:5,fontSize:'0.68rem',fontWeight:700,padding:'1px 6px' }}>
                    +{p.images.length-1}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'1rem',marginBottom:'0.3rem' }}>
                  <h3 style={{ margin:0,fontSize:'0.95rem',fontWeight:700,color:'#0f172a' }}>{p.title}</h3>
                  <span style={{ background:'#fef3c7',color:'#d97706',padding:'2px 9px',borderRadius:99,fontSize:'0.7rem',fontWeight:700,flexShrink:0 }}>⏳ Chờ duyệt</span>
                </div>
                <div style={{ fontSize:'1rem',fontWeight:800,color:'#ef4444',marginBottom:'0.4rem' }}>{p.price||'Liên hệ'}</div>
                <div style={{ display:'flex',gap:'0.75rem',fontSize:'0.78rem',color:'#64748b',marginBottom:'0.4rem' }}>
                  {p.location && <span>📍 {p.location}</span>}
                  {p.area && <span>📐 {p.area}m²</span>}
                </div>
                <div style={{ fontSize:'0.78rem',color:'#64748b' }}>
                  Đăng bởi: <strong style={{color:'#0f172a'}}>{p.author?.name||'Ẩn danh'}</strong>
                  {p.author?.email && <span style={{color:'#94a3b8'}}> · {p.author.email}</span>}
                </div>
              </div>
              <div className="pending-property-card-actions">
                <button 
                  onClick={() => setSelectedProperty(p)} 
                  style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 9, padding: '0.55rem 1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                >
                  👁️ Chi tiết
                </button>
                <button 
                  onClick={() => handleApproveProperty(p.id, 'approve')} 
                  style={{ background:'linear-gradient(135deg,#0f766e,#0891b2)',color:'white',border:'none',borderRadius:9,padding:'0.55rem 1rem',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.82rem',boxShadow:'0 2px 6px rgba(15,118,110,0.3)' }}
                >
                  <Check size={14}/> Duyệt
                </button>
                <button 
                  onClick={() => handleApproveProperty(p.id, 'reject')} 
                  style={{ background:'#fef2f2',color:'#ef4444',border:'1px solid #fecaca',borderRadius:9,padding:'0.55rem 1rem',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.82rem' }}
                >
                  <X size={14}/> Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CHI TIẾT TIN ĐĂNG */}
      {selectedProperty && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 9999, 
            background: 'rgba(15, 23, 42, 0.45)', 
            backdropFilter: 'blur(8px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1.25rem',
            animation: 'backdropFadeIn 0.3s ease-out'
          }}
        >
          {/* Custom CSS for Animations and Hovers */}
          <style>{`
            @keyframes backdropFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes modalScaleUp {
              from { opacity: 0; transform: scale(0.96) translateY(12px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .modal-content-card {
              animation: modalScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .thumbnail-item {
              transition: all 0.2s ease;
              cursor: pointer;
              border: 2px solid transparent;
            }
            .thumbnail-item:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .thumbnail-item.active {
              border-color: #0f766e;
              transform: scale(1.02);
            }
            .action-btn-approve {
              background: linear-gradient(135deg, #0f766e, #0d9488);
              transition: all 0.2s ease;
            }
            .action-btn-approve:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(15, 118, 110, 0.35);
              filter: brightness(1.05);
            }
            .action-btn-reject {
              background: #fff5f5;
              color: #e11d48;
              border: 1px solid #fecdd3;
              transition: all 0.2s ease;
            }
            .action-btn-reject:hover {
              background: #ffe4e6;
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(225, 29, 72, 0.15);
            }
            .action-btn-close {
              background: white;
              color: #475569;
              border: 1px solid #e2e8f0;
              transition: all 0.2s ease;
            }
            .action-btn-close:hover {
              background: #f8fafc;
              color: #1e293b;
            }
            .spec-card {
              transition: all 0.2s ease;
            }
            .spec-card:hover {
              transform: translateY(-2px);
              background: white !important;
              box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            }
          `}</style>

          <div 
            className="modal-content-card"
            style={{ 
              background: 'white', 
              borderRadius: 24, 
              width: 720, 
              maxWidth: '100%', 
              maxHeight: '92vh', 
              display: 'flex', 
              flexDirection: 'column', 
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.3)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.75rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} color="#0284c7" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Duyệt Tin Đăng Chi Tiết</h3>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 1 }}>Mã tin: {selectedProperty.id?.substring(0, 8)}...</div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProperty(null)}
                style={{ 
                  background: '#f1f5f9', 
                  border: 'none', 
                  color: '#64748b', 
                  cursor: 'pointer', 
                  padding: 8, 
                  borderRadius: '50%',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Premium Image Gallery Section */}
              <div>
                {selectedProperty.images && selectedProperty.images.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {/* Main Active Image Display */}
                    <div style={{ height: 280, borderRadius: 16, overflow: 'hidden', position: 'relative', background: '#f8fafc', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)' }}>
                      <img 
                        src={mediaUrl(selectedProperty.images[selectedProperty._activeImgIdx || 0]?.url || selectedProperty.images[selectedProperty._activeImgIdx || 0])} 
                        alt="Property Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s ease' }} 
                      />
                      <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600 }}>
                        Ảnh {(selectedProperty._activeImgIdx || 0) + 1} / {selectedProperty.images.length}
                      </div>
                    </div>

                    {/* Horizontal Scroll Thumbnails */}
                    {selectedProperty.images.length > 1 && (
                      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'thin' }}>
                        {selectedProperty.images.map((img, idx) => {
                          const isActive = (selectedProperty._activeImgIdx || 0) === idx;
                          return (
                            <div 
                              key={idx}
                              className={`thumbnail-item ${isActive ? 'active' : ''}`}
                              onClick={() => {
                                setSelectedProperty({
                                  ...selectedProperty,
                                  _activeImgIdx: idx
                                });
                              }}
                              style={{ 
                                width: 72, 
                                height: 50, 
                                borderRadius: 8, 
                                overflow: 'hidden', 
                                flexShrink: 0,
                                background: '#f1f5f9'
                              }}
                            >
                              <img src={mediaUrl(img.url || img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ height: 160, background: '#f8fafc', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, border: '1px dashed #cbd5e1' }}>
                    <ImageIcon size={32} color="#94a3b8" />
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Chưa có hình ảnh nào được tải lên</span>
                  </div>
                )}
              </div>

              {/* Title & Location */}
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span style={{ background: selectedProperty.transactionType === 'sale' ? '#ecfdf5' : '#f0f9ff', color: selectedProperty.transactionType === 'sale' ? '#047857' : '#0369a1', padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>
                    {getTransactionTypeLabel(selectedProperty.transactionType).toUpperCase()}
                  </span>
                  <span style={{ background: '#f5f3ff', color: '#6d28d9', padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700 }}>
                    {getPropertyTypeLabel(selectedProperty.propertyType).toUpperCase()}
                  </span>
                </div>
                <h2 style={{ margin: '0 0 0.6rem 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35 }}>
                  {selectedProperty.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.85rem' }}>
                  <MapPin size={15} color="#0f766e" style={{ flexShrink: 0 }} />
                  <span style={{ fontWeight: 500 }}>{selectedProperty.location}</span>
                </div>
              </div>

              {/* Specifications Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem' }}>
                <div className="spec-card" style={{ background: '#fdf2f8', padding: '0.85rem 0.5rem', borderRadius: 14, textAlign: 'center', border: '1px solid #fce7f3' }}>
                  <div style={{ fontSize: '0.67rem', color: '#db2777', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 4 }}>GIÁ YÊU CẦU</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#be185d' }}>{selectedProperty.price || 'Liên hệ'}</div>
                </div>
                <div className="spec-card" style={{ background: '#f0fdf4', padding: '0.85rem 0.5rem', borderRadius: 14, textAlign: 'center', border: '1px solid #dcfce7' }}>
                  <div style={{ fontSize: '0.67rem', color: '#16a34a', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 4 }}>DIỆN TÍCH</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#15803d' }}>{selectedProperty.area ? `${selectedProperty.area} m²` : '--'}</div>
                </div>
                <div className="spec-card" style={{ background: '#eff6ff', padding: '0.85rem 0.5rem', borderRadius: 14, textAlign: 'center', border: '1px solid #dbeafe' }}>
                  <div style={{ fontSize: '0.67rem', color: '#2563eb', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 4 }}>PHÒNG NGỦ</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1d4ed8' }}>{selectedProperty.beds ? `${selectedProperty.beds} PN` : '--'}</div>
                </div>
                <div className="spec-card" style={{ background: '#fbf7f0', padding: '0.85rem 0.5rem', borderRadius: 14, textAlign: 'center', border: '1px solid #f3e8d2' }}>
                  <div style={{ fontSize: '0.67rem', color: '#b45309', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 4 }}>PHÒNG TẮM</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#92400e' }}>{selectedProperty.baths ? `${selectedProperty.baths} WC` : '--'}</div>
                </div>
              </div>

              {/* Extra Metadata Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: 14, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    <Info size={13} color="#0f766e" /> Pháp lý & Người Đăng
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    Giấy tờ pháp lý: <strong style={{ color: '#0f172a' }}>{selectedProperty.legalStatus || 'Chưa xác định'}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    Tác giả đăng bài: <strong style={{ color: '#0f172a' }}>{selectedProperty.author?.name || 'Ẩn danh'}</strong>
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: 14, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    <ShieldCheck size={13} color="#0f766e" /> Kiểm duyệt thông tin
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    Liên hệ tác giả: <span style={{ color: '#0284c7', fontWeight: 600 }}>{selectedProperty.author?.email || 'N/A'}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    Trạng thái tin đăng: <span style={{ color: '#d97706', fontWeight: 700 }}>Chờ duyệt hệ thống</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  📝 Mô tả chi tiết
                </h4>
                <div style={{ 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 14, 
                  padding: '1.25rem', 
                  fontSize: '0.875rem', 
                  color: '#334155', 
                  lineHeight: 1.7, 
                  whiteSpace: 'pre-wrap', 
                  maxHeight: 180, 
                  overflowY: 'auto',
                  scrollbarWidth: 'thin'
                }}>
                  {selectedProperty.description || 'Không có mô tả chi tiết cho tin đăng này.'}
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.15rem 1.75rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <button 
                className="action-btn-close"
                onClick={() => setSelectedProperty(null)}
                style={{ padding: '0.65rem 1.35rem', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Đóng
              </button>
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="action-btn-reject"
                  onClick={() => {
                    handleApproveProperty(selectedProperty.id, 'reject');
                    setSelectedProperty(null);
                  }} 
                  style={{ borderRadius: 10, padding: '0.65rem 1.35rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
                >
                  <X size={15} /> Từ chối
                </button>
                <button 
                  className="action-btn-approve"
                  onClick={() => {
                    handleApproveProperty(selectedProperty.id, 'approve');
                    setSelectedProperty(null);
                  }} 
                  style={{ color: 'white', border: 'none', borderRadius: 10, padding: '0.65rem 1.35rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
                >
                  <Check size={15} /> Phê duyệt ngay
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </>
  );
}
