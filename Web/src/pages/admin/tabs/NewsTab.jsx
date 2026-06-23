import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Link2, FileText, ImagePlus, Star, Newspaper } from 'lucide-react';
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
  const [editingId, setEditingId] = useState(null);
  const [contentMode, setContentMode] = useState('write');
  const [formData, setFormData] = useState(emptyForm);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await dataService.getNews();
      if (res.success) setNews(res.data);
    } catch (err) {
      toast.error('Lỗi', 'Không thể tải tin tức');
    } finally {
      setLoading(false);
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
    <div style={{ animation: 'fadeInScale 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>Quản lý tin tức</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>Tạo bài viết tự biên soạn hoặc gắn URL bài báo nguồn cho khách hàng đọc chi tiết.</p>
        </div>
        <button
          onClick={() => openModal()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', border: 'none', padding: '0.72rem 1.15rem', borderRadius: 10, fontWeight: 700, cursor: 'pointer', boxShadow: '0 12px 26px rgba(15,118,110,0.18)' }}
        >
          <Plus size={17} /> Thêm bài viết
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div className="responsive-table-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Bài viết', 'Chuyên mục', 'Nguồn', 'Ngày tạo', 'Thao tác'].map(label => (
                  <th key={label} style={{ padding: '0.9rem 1rem', color: '#475569', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {news.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                      <img src={item.image} alt="" style={{ width: 78, height: 54, objectFit: 'cover', borderRadius: 10, border: '1px solid #e2e8f0' }} />
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem', marginBottom: 5 }}>{item.title}</div>
                        <div style={{ color: '#64748b', fontSize: '0.78rem', maxWidth: 420, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.excerpt}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>
                    <span style={{ background: '#e6f7f4', color: '#0f766e', padding: '0.32rem 0.58rem', borderRadius: 999, fontWeight: 700 }}>{item.category}</span>
                  </td>
                  <td style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>
                    {item.sourceUrl ? <span style={{ color: '#0f766e', fontWeight: 700 }}>URL nguồn</span> : <span>Tự viết</span>}
                    {item.featured && <div style={{ color: '#f59e0b', fontSize: '0.76rem', marginTop: 5, fontWeight: 700 }}>Nổi bật</div>}
                  </td>
                  <td style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button onClick={() => openModal(item)} style={{ background: '#eef6ff', border: 'none', padding: 8, borderRadius: 8, color: '#2563eb', cursor: 'pointer', marginRight: 8 }}><Edit size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} style={{ background: '#fee2e2', border: 'none', padding: 8, borderRadius: 8, color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {news.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Chưa có tin tức nào</div>}
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
    </div>
  );
}
