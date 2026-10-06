import { useState, useEffect } from 'react';
import { Check, X, ShieldCheck, Image as ImageIcon, MapPin, Bed, Bath, Maximize, FileText, Info, Eye, MoreHorizontal, ChevronDown, Clock } from 'lucide-react';
import { mediaUrl } from '../../../services/api';

export default function PendingPropertiesTab({ pendingProperties, handleApproveProperty }) {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [openActionId, setOpenActionId] = useState(null);

  useEffect(() => {
    const closeOutside = event => {
      if (!event.target.closest('.approval-actions')) setOpenActionId(null);
    };
    const closeOnEscape = event => {
      if (event.key === 'Escape') {
        setOpenActionId(null);
        document.querySelector('.approval-actions-trigger[aria-expanded="true"]')?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

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
      <section className="approval-panel">
        <header className="approval-heading">
          <div className="approval-heading-icon"><ShieldCheck size={22} /></div>
          <div>
            <div className="approval-heading-title">
              <h2>Phê duyệt tin đăng</h2>
              <span>{pendingProperties.length} tin</span>
            </div>
            <p>Kiểm tra nội dung và xét duyệt tin trước khi hiển thị</p>
          </div>
        </header>
        {pendingProperties.length === 0 ? (
          <div className="approval-empty">
            <ShieldCheck size={36} />
            <h3>Tất cả tin đã được xử lý!</h3>
            <p>Không có tin đăng nào đang chờ xét duyệt.</p>
          </div>
        ) : (
          <div className="approval-list">
            {pendingProperties.map(p => (
              <article key={p.id} className={`approval-item${openActionId === p.id ? ' is-open' : ''}`}>
                <div className="approval-photo">
                  {p.images?.length > 0 ? (
                    <img src={mediaUrl(p.images[0].url || p.images[0])} alt={p.title} />
                  ) : <ImageIcon size={24} />}
                  {p.images?.length > 1 && <span>+{p.images.length - 1}</span>}
                </div>
                <div className="approval-info">
                  <h3>{p.title}</h3>
                  <div className="approval-meta">
                    <strong>{p.price || 'Liên hệ'}</strong>
                    {p.location && <span><MapPin size={13} />{p.location}</span>}
                    {p.area && <span><Maximize size={13} />{p.area} m²</span>}
                  </div>
                  <div className="approval-author">
                    <span className="approval-avatar">{(p.author?.name || 'A').charAt(0).toUpperCase()}</span>
                    <span>{p.author?.name || 'Ẩn danh'}</span>
                    {p.author?.email && <span className="approval-email">{p.author.email}</span>}
                  </div>
                </div>
                <span className="approval-status"><Clock size={13} />Chờ duyệt</span>
                <div className="approval-actions" onBlur={event => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setOpenActionId(null);
                }}>
                  <button className="approval-actions-trigger" aria-label={`Thao tác với ${p.title}`}
                    aria-expanded={openActionId === p.id} aria-controls={`approval-actions-${p.id}`}
                    onClick={() => setOpenActionId(openActionId === p.id ? null : p.id)}>
                    <MoreHorizontal size={17} /><span>Thao tác</span><ChevronDown size={13} />
                  </button>
                  {openActionId === p.id && (
                    <div id={`approval-actions-${p.id}`} className="approval-dropdown">
                      <button onClick={() => { setOpenActionId(null); setSelectedProperty(p); }}>
                        <Eye size={16} />Xem chi tiết
                      </button>
                      <button className="approval-accept" onClick={() => {
                        setOpenActionId(null); handleApproveProperty(p.id, 'approve');
                      }}><Check size={16} />Duyệt tin đăng</button>
                      <div className="approval-dropdown-divider" />
                      <button className="approval-reject" onClick={() => {
                        setOpenActionId(null); handleApproveProperty(p.id, 'reject');
                      }}><X size={16} />Từ chối tin đăng</button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                    <Info size={13} color="#0f766e" /> Pháp lý & người đăng
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    Giấy tờ pháp lý: <strong style={{ color: '#0f172a' }}>{selectedProperty.legalStatus || 'Chưa xác định'}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    Tác giả đăng bài: <strong style={{ color: '#0f172a' }}>{selectedProperty.author?.name || 'Ẩn danh'}</strong>
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: 14, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
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
