import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';

export default function NewsTab({ toast }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', excerpt: '', content: '', image: '', category: 'Thị trường', featured: false, imageFile: null
  });

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://ncbds-vlu.onrender.com/api/news');
      const data = await res.json();
      if (data.success) {
        setNews(data.data);
      }
    } catch (err) {
      toast.error('Lỗi', 'Không thể tải tin tức');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.excerpt) {
      toast.error('Lỗi', 'Tiêu đề và Tóm tắt không được để trống');
      return;
    }

    try {
      const url = editingId ? `https://ncbds-vlu.onrender.com/api/news/${editingId}` : 'https://ncbds-vlu.onrender.com/api/news';
      const method = editingId ? 'PUT' : 'POST';

      const dataToSend = new FormData();
      dataToSend.append('title', formData.title);
      dataToSend.append('excerpt', formData.excerpt);
      dataToSend.append('content', formData.content || '');
      dataToSend.append('category', formData.category);
      dataToSend.append('featured', formData.featured);
      
      if (formData.imageFile) {
        dataToSend.append('imageFile', formData.imageFile);
      } else {
        dataToSend.append('image', formData.image);
      }

      const res = await fetch(url, {
        method,
        body: dataToSend
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Thành công', editingId ? 'Đã cập nhật tin tức' : 'Đã tạo tin tức mới');
        setShowModal(false);
        fetchNews();
      } else {
        toast.error('Thất bại', data.message);
      }
    } catch (err) {
      toast.error('Lỗi', 'Lỗi kết nối máy chủ');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa tin này?')) return;
    try {
      const res = await fetch(`https://ncbds-vlu.onrender.com/api/news/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
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
      setFormData({
        title: item.title,
        excerpt: item.excerpt,
        content: item.content || '',
        image: item.image || '',
        category: item.category,
        featured: item.featured
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '', excerpt: '', content: '', image: '', category: 'Thị trường', featured: false, imageFile: null
      });
    }
    setShowModal(true);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải...</div>;

  return (
    <div style={{ animation: 'fadeInScale 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>Quản lý Tin tức</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Thêm, sửa, xóa các bài viết trên trang tin tức.</p>
        </div>
        <button 
          onClick={() => openModal()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={18} /> Thêm bài viết
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>Ảnh</th>
              <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>Tiêu đề</th>
              <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>Chuyên mục</th>
              <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>Ngày tạo</th>
              <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600, textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {news.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem' }}>
                  <img src={item.image} alt="News" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem', marginBottom: 4 }}>{item.title}</div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{item.featured ? <span style={{ color: '#0f766e', fontWeight: 600 }}>Nổi bật</span> : 'Thường'}</div>
                </td>
                <td style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>{item.category}</td>
                <td style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => openModal(item)} style={{ background: '#f1f5f9', border: 'none', padding: '6px', borderRadius: 6, color: '#3b82f6', cursor: 'pointer', marginRight: 8 }}><Edit size={16} /></button>
                  <button onClick={() => handleDelete(item.id)} style={{ background: '#fee2e2', border: 'none', padding: '6px', borderRadius: 6, color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {news.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Chưa có tin tức nào</div>}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', width: '600px', maxWidth: '90%', borderRadius: '20px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{editingId ? 'Sửa tin tức' : 'Thêm tin tức mới'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>Tiêu đề *</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} 
                  placeholder="Nhập tiêu đề tin tức"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>Tóm tắt *</label>
                <textarea 
                  value={formData.excerpt} 
                  onChange={e => setFormData({...formData, excerpt: e.target.value})} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '80px' }} 
                  placeholder="Đoạn tóm tắt ngắn"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>Chuyên mục</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  >
                    <option>Thị trường</option>
                    <option>Tiêu điểm Thị trường</option>
                    <option>Thiết kế</option>
                    <option>Quy hoạch</option>
                    <option>Góc tư vấn</option>
                    <option>Pháp lý</option>
                    <option>Đầu tư</option>
                  </select>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.featured} 
                      onChange={e => setFormData({...formData, featured: e.target.checked})} 
                      style={{ width: 18, height: 18 }}
                    />
                    Bài viết Nổi bật
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>Ảnh bìa (Tải lên hoặc dán URL)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setFormData({...formData, imageFile: e.target.files[0], image: ''})} 
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} 
                  />
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>hoặc</span>
                  <input 
                    type="text" 
                    value={formData.image} 
                    disabled={!!formData.imageFile}
                    onChange={e => setFormData({...formData, image: e.target.value})} 
                    style={{ flex: 2, padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: formData.imageFile ? '#f1f5f9' : 'white' }} 
                    placeholder="https://..."
                  />
                </div>
                {formData.imageFile && <div style={{ fontSize: '0.8rem', color: '#0f766e', marginTop: '0.4rem' }}>Đã chọn file: {formData.imageFile.name}</div>}
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
