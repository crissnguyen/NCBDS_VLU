import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Link2, FileText, ImagePlus, Star, Newspaper, MoreVertical, Search } from 'lucide-react';
import { dataService } from '../../../services/data/dataService';
import { API_ORIGIN } from '../../../services/api';

const inputStyle = {
  width: '100%',
  padding: '0.78rem 0.9rem',
  borderRadius: 10,
  border: '1px solid #dbe5ef',
  outline: 'none',
  color: '#0f172a',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  background: 'white'
};

const emptyForm = {
  title: '',
  excerpt: '',
  content: '',
  sourceUrl: '',
  image: '',
  category: 'Thị trường',
  featured: false,
  imageFile: null
};

const compressImage = (file, maxWidth = 1400, quality = 0.82) => new Promise((resolve, reject) => {
  if (!file.type.startsWith('image/')) {
    reject(new Error('File không phải hình ảnh'));
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Không thể nén ảnh'));
          return;
        }
        const outputName = file.name.replace(/\.[^.]+$/, '.jpg');
        resolve(new File([blob], outputName, { type: 'image/jpeg' }));
      }, 'image/jpeg', quality);
    };
    img.onerror = () => reject(new Error('Không thể đọc ảnh'));
    img.src = reader.result;
  };
  reader.onerror = () => reject(new Error('Không thể đọc file'));
  reader.readAsDataURL(file);
});

export default function NewsTab({ toast }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [openActionId, setOpenActionId] = useState(null);

  useEffect(() => {
    const handleDocClick = (e) => {
      if (!e.target.closest('.news-action-dropdown-wrapper')) {
        setOpenActionId(null);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);
  const [editingId, setEditingId] = useState(null);
  const [contentMode, setContentMode] = useState('write');
  const [formData, setFormData] = useState(emptyForm);

  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchNews = async () => {
    try {
      setLoading(true);
      setSelectedIds([]);
      const res = await dataService.getNews();
      if (res.success) setNews(res.data);
    } catch (err) {
      toast.error('Lỗi', 'Không thể tải tin tức');
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = !searchQuery || 
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNews.length && filteredNews.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNews.map(n => n.id));
    }
  };

  const executeBulkDelete = async () => {
    try {
      const res = await dataService.bulkDeleteNews(selectedIds);
      if (res.success) {
        toast.success('Thành công', `Đã xóa ${selectedIds.length} bài viết.`);
        fetchNews();
      } else {
        toast.error('Thất bại', res.message || 'Không thể xóa hàng loạt.');
      }
    } catch (err) {
      toast.error('Lỗi', 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsBulkDeleteOpen(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const imagePreview = formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.image;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.excerpt) {
      toast.error('Lỗi', 'Tiêu đề và tóm tắt không được để trống');
      return;
    }
    if (contentMode === 'link' && !formData.sourceUrl) {
      toast.error('Thiếu URL', 'Vui lòng dán URL bài báo nguồn.');
      return;
    }
    if (contentMode === 'write' && !formData.content.trim()) {
      toast.error('Thiếu nội dung', 'Vui lòng nhập nội dung chi tiết cho bài viết.');
      return;
    }

    try {
      const dataToSend = new FormData();
      dataToSend.append('title', formData.title);
      dataToSend.append('excerpt', formData.excerpt);
      dataToSend.append('content', formData.content || '');
      dataToSend.append('sourceUrl', formData.sourceUrl || '');
      dataToSend.append('category', formData.category);
      dataToSend.append('featured', formData.featured);

      if (formData.imageFile) {
        const compressedCover = await compressImage(formData.imageFile);
        dataToSend.append('imageFile', compressedCover);
      } else {
        dataToSend.append('image', formData.image);
      }

      let res;
      if (editingId) {
        res = await dataService.updateNews(editingId, dataToSend);
      } else {
        res = await dataService.createNews(dataToSend);
      }

      if (res.success) {
        toast.success('Thành công', editingId ? 'Đã cập nhật tin tức' : 'Đã tạo tin tức mới');
        setShowModal(false);
        fetchNews();
      } else {
        toast.error('Thất bại', res.message || 'Không thể lưu bài viết.');
      }
    } catch (err) {
      toast.error('Lỗi', 'Có lỗi xảy ra khi thực hiện yêu cầu.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa tin này?')) return;
    try {
      const res = await dataService.deleteNews(id);
      if (res.success) {
        toast.success('Thành công', 'Đã xóa tin tức');
        fetchNews();
      }
    } catch (err) {
      toast.error('Lỗi', 'Không thể xóa tin tức');
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setContentMode(item.sourceUrl && !item.content ? 'link' : 'write');
      setFormData({
        title: item.title || '',
        excerpt: item.excerpt || '',
        content: item.content || '',
        sourceUrl: item.sourceUrl || '',
        image: item.image || '',
        category: item.category || 'Thị trường',
        featured: !!item.featured,
        imageFile: null
      });
    } else {
      setEditingId(null);
      setContentMode('write');
      setFormData(emptyForm);
    }
    setShowModal(true);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải...</div>;

  return (
    <>
      <div className="admin-table-card admin-filter-table-card news-list-card">
      {/* Unified Table Header Toolbar */}
      <div className="admin-table-header-toolbar">
        <div className="admin-table-header-left">
          <div className="admin-table-header-icon">
            <Newspaper size={20} />
          </div>
          <div className="admin-table-header-info">
            <div className="admin-table-header-title-row">
              <h2 className="admin-table-header-title">Quản lý tin tức</h2>
              <span className="admin-table-count-badge">{filteredNews.length} bài viết</span>
            </div>
            <p className="admin-table-header-subtitle">Tạo và quản lý các bài viết tin tức bất động sản</p>
          </div>
        </div>

        <div className="admin-table-header-right admin-table-actions">
          {selectedIds.length > 0 && (
            <button
              className="admin-table-btn-danger"
              onClick={() => setIsBulkDeleteOpen(true)}
            >
              <Trash2 size={14} /> Xóa ({selectedIds.length})
            </button>
          )}

          <button
            className="admin-table-btn-primary"
            onClick={() => openModal()}
          >
            <Plus size={15} /> Thêm bài viết
          </button>
        </div>
      </div>
      <div className="admin-table-filters">
        <div className="admin-table-search-input">
            <Search size={15} color="#667085" />
            <input 
              type="text" 
              aria-label="Tìm kiếm"
              placeholder="Tìm bài viết, danh mục..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
            {searchQuery && (
              <button aria-label="Xóa tìm kiếm" onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#98a2b3', fontSize: '0.8rem', padding: 0 }}>✕</button>
            )}
          </div>
        <select 
            className="admin-table-select"
            aria-label="Chuyên mục"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tất cả chuyên mục</option>
            <option value="Thị trường">Thị trường</option>
            <option value="Chính sách">Chính sách</option>
            <option value="Quy hoạch">Quy hoạch</option>
            <option value="Dự án">Dự án</option>
          </select>
      </div>

      <div className="responsive-table-wrapper" style={{ overflowX: 'auto' }}>
        <table className="admin-unified-table">
          <thead>
            <tr>
              <th style={{ width: '46px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredNews.length && filteredNews.length > 0}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer', accentColor: '#0f766e', width: 16, height: 16, verticalAlign: 'middle' }}
                />
              </th>
              <th>Bài viết</th>
              <th style={{ width: '150px' }}>Chuyên mục</th>
              <th style={{ width: '130px' }}>Nguồn</th>
              <th style={{ width: '130px' }}>Ngày tạo</th>
              <th style={{ textAlign: 'center', width: '90px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredNews.map(item => (
              <tr key={item.id} style={{ background: selectedIds.includes(item.id) ? '#f0fdfa' : 'transparent' }}>
                <td style={{ textAlign: 'center', width: '46px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => handleSelectRow(item.id)}
                    style={{ cursor: 'pointer', accentColor: '#0f766e', width: 16, height: 16, verticalAlign: 'middle' }}
                  />
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                    <img src={item.image} alt="" style={{ width: 68, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 650, color: '#101828', fontSize: '0.88rem', marginBottom: 2 }}>{item.title}</div>
                      <div style={{ color: '#64748b', fontSize: '0.78rem', maxWidth: 420, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.excerpt}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ background: '#ecfdf5', color: '#027a48', border: '1px solid #a6f4c5', padding: '2px 8px', borderRadius: 999, fontWeight: 600, fontSize: '0.75rem' }}>{item.category}</span>
                </td>
                <td>
                  {item.sourceUrl ? <span style={{ color: '#0f766e', fontWeight: 600, fontSize: '0.8rem' }}>URL nguồn</span> : <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Tự biên soạn</span>}
                  {item.featured && <div style={{ color: '#b54708', fontSize: '0.74rem', marginTop: 3, fontWeight: 700 }}>★ Nổi bật</div>}
                </td>
                <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                <td style={{ textAlign: 'center', whiteSpace: 'nowrap', position: 'relative' }}>
                    <div className="news-action-dropdown-wrapper" style={{ display: 'inline-block', position: 'relative', textAlign: 'left' }}>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionId(openActionId === item.id ? null : item.id);
                        }}
                        title="Thao tác"
                        aria-label="Thao tác"
                        style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: 8, 
                          border: '1px solid #d0d5dd', 
                          background: openActionId === item.id ? '#f1f5f9' : 'white', 
                          color: openActionId === item.id ? '#0f766e' : '#475467',
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          cursor: 'pointer', 
                          transition: 'all 0.15s ease',
                          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)'
                        }}
                        onMouseEnter={e => { if (openActionId !== item.id) e.currentTarget.style.background = '#f8fafc'; }}
                        onMouseLeave={e => { if (openActionId !== item.id) e.currentTarget.style.background = 'white'; }}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openActionId === item.id && (
                        <div 
                          style={{ 
                            position: 'absolute',
                            right: 0,
                            ...(news.indexOf(item) >= news.length - 2 && news.length > 3
                              ? { bottom: '100%', marginBottom: 6 }
                              : { top: '100%', marginTop: 6 }),
                            width: 165,
                            background: '#ffffff',
                            border: '1px solid #eaecf0',
                            borderRadius: 10,
                            boxShadow: '0 12px 24px -4px rgba(16, 24, 40, 0.14), 0 4px 6px -2px rgba(16, 24, 40, 0.05)',
                            padding: '4px',
                            zIndex: 100
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setOpenActionId(null);
                              openModal(item);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              background: 'transparent',
                              border: 'none',
                              borderRadius: 6,
                              color: '#344054',
                              fontSize: '0.82rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'background 0.12s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f2f4f7'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <Edit size={14} color="#175cd3" />
                            <span>Sửa bài viết</span>
                          </button>

                          <div style={{ height: 1, background: '#f2f4f7', margin: '4px 0' }} />

                          <button
                            type="button"
                            onClick={() => {
                              setOpenActionId(null);
                              handleDelete(item.id);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              background: 'transparent',
                              border: 'none',
                              borderRadius: 6,
                              color: '#d92d20',
                              fontSize: '0.82rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'background 0.12s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#fef3f2'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <Trash2 size={14} color="#d92d20" />
                            <span>Xóa bài viết</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredNews.length === 0 && (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#475467', fontSize: '0.875rem' }}>
            <Newspaper size={36} color="#d0d5dd" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 600, color: '#101828' }}>Không tìm thấy bài viết nào</div>
            <div style={{ fontSize: '0.8rem', color: '#667085', marginTop: 2 }}>Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc chuyên mục.</div>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.62)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}>
          <div style={{ background: 'white', width: '940px', maxWidth: '100%', borderRadius: 18, maxHeight: '92vh', overflow: 'hidden', boxShadow: '0 30px 80px rgba(15,23,42,0.24)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #f8fafc, #eef8f7)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#0f766e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Newspaper size={20} /></div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{editingId ? 'Sửa bài viết' : 'Thêm tin tức mới'}</h3>
                  <p style={{ margin: '0.18rem 0 0', color: '#64748b', fontSize: '0.8rem' }}>Khách hàng có thể bấm vào bài viết để xem chi tiết hoặc mở URL nguồn.</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b', width: 34, height: 34, borderRadius: 10 }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="news-form-grid" style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(92vh - 88px)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', padding: '0.32rem', background: '#f1f5f9', borderRadius: 12 }}>
                  {[
                    ['write', FileText, 'Tự viết bài'],
                    ['link', Link2, 'Gắn URL bài báo']
                  ].map(([mode, Icon, label]) => (
                    <button key={mode} type="button" onClick={() => setContentMode(mode)} style={{ border: 'none', borderRadius: 9, padding: '0.72rem', cursor: 'pointer', background: contentMode === mode ? 'white' : 'transparent', color: contentMode === mode ? '#0f766e' : '#64748b', fontWeight: 800, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.45rem', boxShadow: contentMode === mode ? '0 8px 22px rgba(15,42,68,0.08)' : 'none' }}>
                      <Icon size={16} /> {label}
                    </button>
                  ))}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: 700, fontSize: '0.82rem', color: '#475569' }}>Tiêu đề *</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputStyle} placeholder="VD: Những tín hiệu mới của thị trường căn hộ Hà Nội" />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: 700, fontSize: '0.82rem', color: '#475569' }}>Tóm tắt *</label>
                  <textarea value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} style={{ ...inputStyle, minHeight: 86, resize: 'vertical', lineHeight: 1.55 }} placeholder="Tóm tắt ngắn hiển thị trên card tin tức" />
                </div>

                {contentMode === 'link' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: 700, fontSize: '0.82rem', color: '#475569' }}>URL bài báo nguồn *</label>
                    <input type="url" value={formData.sourceUrl} onChange={e => setFormData({ ...formData, sourceUrl: e.target.value })} style={inputStyle} placeholder="https://..." />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: 700, fontSize: '0.82rem', color: '#475569' }}>Nội dung chi tiết {contentMode === 'write' && '*'}</label>
                  <textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} style={{ ...inputStyle, minHeight: 170, resize: 'vertical', lineHeight: 1.65 }} placeholder={contentMode === 'write' ? 'Tự viết nội dung bài báo tại đây...' : 'Có thể thêm nhận định ngắn của EstateAI trước khi khách mở URL nguồn...'} />
                </div>
              </div>

              <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: 700, fontSize: '0.82rem', color: '#475569' }}>Ảnh bìa</label>
                  <div style={{ border: '1px dashed #b6c5d5', borderRadius: 13, overflow: 'hidden', background: '#f8fafc' }}>
                    <div style={{ height: 150, background: imagePreview ? `url("${imagePreview}") center/cover` : 'linear-gradient(135deg, #e2e8f0, #eff6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                      {!imagePreview && <ImagePlus size={30} />}
                    </div>
                    <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (!file) return;
                          if (!file.type.startsWith('image/')) {
                            toast.error('Sai định dạng', 'Vui lòng chọn file hình ảnh.');
                            return;
                          }
                          setFormData({ ...formData, imageFile: file, image: '' });
                        }}
                        style={{ fontSize: '0.78rem' }}
                      />
                      <input type="text" value={formData.image} disabled={!!formData.imageFile} onChange={e => setFormData({ ...formData, image: e.target.value })} style={{ ...inputStyle, fontSize: '0.8rem', padding: '0.62rem 0.7rem', background: formData.imageFile ? '#f1f5f9' : 'white' }} placeholder="Hoặc dán URL ảnh" />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: 700, fontSize: '0.82rem', color: '#475569' }}>Chuyên mục</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={inputStyle}>
                    <option>Thị trường</option>
                    <option>Tiêu điểm Thị trường</option>
                    <option>Thiết kế</option>
                    <option>Quy hoạch</option>
                    <option>Góc tư vấn</option>
                    <option>Pháp lý</option>
                    <option>Đầu tư</option>
                  </select>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontWeight: 800, fontSize: '0.86rem', color: '#0f172a', padding: '0.8rem', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                  <input type="checkbox" checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} style={{ width: 18, height: 18 }} />
                  <Star size={16} color="#f59e0b" /> Bài viết nổi bật
                </label>

                <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.75rem', paddingTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.78rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', fontWeight: 800, cursor: 'pointer' }}>Hủy</button>
                  <button type="submit" style={{ padding: '0.78rem 1rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', fontWeight: 800, cursor: 'pointer', boxShadow: '0 12px 24px rgba(15,118,110,0.18)' }}>Lưu bài viết</button>
                </div>
              </aside>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
          <div 
            style={{ background: 'white', width: 420, maxWidth: '100%', borderRadius: 20, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'fadeInScale 0.25s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Body */}
            <div style={{ padding: '2rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ background: '#fee2e2', color: '#ef4444', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Trash2 size={28} />
              </div>
              
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Xác nhận xóa hàng loạt</h3>
              
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                Bạn có chắc chắn muốn xóa <strong style={{ color: '#ef4444' }}>{selectedIds.length}</strong> bài viết đã chọn không? Hành động này không thể hoàn tác.
              </p>

              {/* Buttons */}
              <div style={{ display: 'flex', width: '100%', gap: '0.75rem', marginTop: '2rem' }}>
                <button 
                  type="button"
                  onClick={() => setIsBulkDeleteOpen(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, padding: '0.75rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                >
                  Hủy
                </button>
                <button 
                  type="button"
                  onClick={executeBulkDelete}
                  style={{
                    flex: 1,
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    padding: '0.75rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#ef4444'; }}
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
