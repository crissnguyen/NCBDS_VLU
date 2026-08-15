import { useState, useRef, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, ImagePlus, Sparkles } from 'lucide-react';
import { apiUrl } from '../services/api';
import { dataService } from '../services/data/dataService';

// ─── Toast System ─────────────────────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const id = useRef(0);
  const show = (type, title, msg, dur = 4000) => {
    const tid = ++id.current;
    setToasts(p => [...p, { id: tid, type, title, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== tid)), dur);
  };
  return {
    toasts,
    remove: (tid) => setToasts(p => p.filter(t => t.id !== tid)),
    success: (t, m) => show('success', t, m),
    error:   (t, m) => show('error', t, m),
    warning: (t, m) => show('warning', t, m),
    info:    (t, m) => show('info', t, m),
  };
}

export function Toasts({ toasts, remove }) {
  const cfg = {
    success: { bg: '#f0fdf4', border: '#86efac', icon: '#16a34a', Icon: CheckCircle },
    error:   { bg: '#fef2f2', border: '#fca5a5', icon: '#dc2626', Icon: AlertCircle },
    warning: { bg: '#fffbeb', border: '#fcd34d', icon: '#d97706', Icon: AlertCircle },
    info:    { bg: '#eff6ff', border: '#93c5fd', icon: '#2563eb', Icon: Info },
  };
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
      {toasts.map(t => {
        const c = cfg[t.type] || cfg.info;
        return (
          <div key={t.id} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: '0.875rem 1.125rem', display: 'flex', gap: '0.6rem', minWidth: 300, maxWidth: 380, boxShadow: '0 6px 20px rgba(0,0,0,0.1)', pointerEvents: 'all', animation: 'toastSlide 0.25s ease' }}>
            <c.Icon size={18} color={c.icon} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              {t.title && <div style={{ fontWeight: 700, color: c.icon, fontSize: '0.85rem' }}>{t.title}</div>}
              <div style={{ fontSize: '0.8rem', color: c.icon, opacity: 0.8 }}>{t.msg}</div>
            </div>
            <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.icon, opacity: 0.5, padding: 0 }}><X size={14} /></button>
          </div>
        );
      })}
      <style>{`@keyframes toastSlide { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, change, up = true, color = '#0f766e' }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center', boxShadow: '0 10px 24px rgba(0,0,0,0.04)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 3 }}>{label}</div>
      </div>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: up ? '#0f766e' : '#ef4444', background: up ? '#d8f3ef' : '#fee2e2', padding: '3px 8px', borderRadius: 99, flexShrink: 0 }}>
        {up ? '↑' : '↓'} {change}
      </span>
    </div>
  );
}

// ─── SidebarItem ──────────────────────────────────────────────────────────────
export function SidebarItem({ icon: Icon, label, active, badge, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.65rem 1rem', borderRadius: 10, border: 'none',
      background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
      color: active ? 'white' : 'rgba(255,255,255,0.6)',
      fontWeight: active ? 600 : 400, cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem',
    }}
      onMouseOver={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
      onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon size={17} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px' }}>{badge}</span>}
    </button>
  );
}

// ─── InputField helper ────────────────────────────────────────────────────────
export const IS = { border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.6rem 0.875rem', fontSize: '0.875rem', color: '#0f172a', outline: 'none', background: 'white', width: '100%', boxSizing: 'border-box' };

export function LabeledField({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}{required && <span style={{ color: '#ef4444' }}> *</span>}</label>
      {children}
    </div>
  );
}

const compressImage = (file, maxWidth = 1600, quality = 0.82) => new Promise((resolve, reject) => {
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

// ─── PostPropertyForm ─────────────────────────────────────────────────────────
export function PostPropertyForm({ currentUser, toast, onSuccess }) {
  const [form, setForm] = useState({
    transactionType: 'sale', propertyType: 'apartment',
    location: '', price: '', area: '', beds: '', baths: '',
    legalStatus: 'pink-book', description: '', title: ''
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error("Lỗi lấy khu vực:", err));
  }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleImages = e => {
    const files = Array.from(e.target.files || []).filter(file => file.type.startsWith('image/'));
    if (files.length === 0) return;

    setImages(prev => {
      const next = [...prev, ...files].slice(0, 10);
      if (prev.length + files.length > 10) {
        toast.warning('Giới hạn ảnh', 'Bạn chỉ có thể tải tối đa 10 ảnh cho một tin đăng.');
      }
      return next;
    });
    setPreviews(prev => {
      const urls = files.map(f => URL.createObjectURL(f));
      return [...prev, ...urls].slice(0, 10);
    });
    e.target.value = '';
  };

  const removeImage = idx => {
    setImages(p => p.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  const autoTitle = () => {
    const tx = { sale: 'Bán', rent: 'Cho thuê' };
    const pt = { apartment: 'căn hộ', house: 'nhà phố', land: 'đất nền' };
    return form.title || `${tx[form.transactionType]} ${pt[form.propertyType]}${form.location ? ' tại ' + form.location : ''}`;
  };

  const handleSubmit = async () => {
    if (!form.location || !form.price) {
      toast.warning('Thiếu thông tin', 'Cần nhập ít nhất Vị trí và Giá.');
      return;
    }
    if (images.length < 1) {
      toast.warning('Thiếu hình ảnh', 'Vui lòng tải lên ít nhất 1 ảnh để đăng bài.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', autoTitle());
      Object.keys(form).forEach(k => {
        if (k !== 'title' && form[k]) fd.append(k, form[k]);
      });
      if (currentUser?.id) fd.append('authorId', currentUser.id);
      
      if (currentUser?.role === 'admin') {
        fd.append('status', 'Approved');
      } else {
        fd.append('status', 'Pending'); 
      }
      
      
      const compressedImages = await Promise.all(images.map(img => compressImage(img)));
      compressedImages.forEach(img => fd.append('images', img));

      const result = await dataService.createProperty(fd);
      if (result.success) {
        toast.success('Đăng tin thành công!', currentUser?.role === 'admin' ? `Tin "${autoTitle()}" đã được duyệt.` : `Tin "${autoTitle()}" đã được gửi và đang chờ Admin duyệt.`);
        setForm({ transactionType: 'sale', propertyType: 'apartment', location: '', price: '', area: '', beds: '', baths: '', legalStatus: 'pink-book', description: '', title: '' });
        setImages([]); setPreviews([]);
        // Chờ đồng bộ lại dữ liệu cha trước khi kết thúc luồng đăng tin,
        // để danh sách/dashboard cập nhật ngay mà không cần reload trang.
        if (onSuccess) await onSuccess();
      } else {
        toast.error('Đăng tin thất bại', result.message);
      }
    } catch (error) {
      toast.error('Đăng tin thất bại', error.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIDescription = async () => {
    const currentDescription = form.description.trim();
    if (!currentDescription) {
      toast.warning('Cần mô tả gốc', 'Hãy nhập vài ý chính trước, AI sẽ viết lại cho hay hơn.');
      return;
    }
    if (currentDescription.length < 12) {
      toast.warning('Mô tả quá ngắn', 'Vui lòng nhập thêm thông tin về vị trí, tiện ích hoặc tình trạng bất động sản.');
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch(apiUrl('ai/rewrite-description'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: currentDescription,
          property: form,
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'AI chưa thể tạo nội dung lúc này.');
      }

      setForm(prev => ({ ...prev, description: result.description }));
      toast.success('Đã tạo nội dung AI', 'Mô tả đã được viết lại hấp dẫn hơn.');
    } catch (error) {
      toast.error('Tạo nội dung thất bại', error.message || 'Không thể kết nối AI.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="post-property-grid">
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #0f2a44, #0f766e)' }}>
          <h3 style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '1rem' }}>📋 Thông tin bất động sản</h3>
          <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>Điền đầy đủ thông tin để tăng cơ hội tiếp cận khách hàng</p>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <LabeledField label="Loại giao dịch" required>
              <select name="transactionType" value={form.transactionType} onChange={handleChange} style={IS}>
                <option value="sale">Bán</option>
                <option value="rent">Cho thuê</option>
              </select>
            </LabeledField>
            <LabeledField label="Loại bất động sản" required>
              <select name="propertyType" value={form.propertyType} onChange={handleChange} style={IS}>
                <option value="apartment">Căn hộ</option>
                <option value="house">Nhà phố</option>
                <option value="land">Đất nền</option>
              </select>
            </LabeledField>
          </div>

          <LabeledField label="Tiêu đề tin đăng">
            <input name="title" value={form.title} onChange={handleChange} placeholder={`Tự động: "${autoTitle()}"`} style={IS} />
          </LabeledField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <LabeledField label="Vị trí / Khu vực" required>
              <select name="location" value={form.location} onChange={handleChange} style={{ ...IS, appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.8rem center', backgroundSize: '1rem' }}>
                <option value="" disabled>-- Chọn Tỉnh / Thành phố --</option>
                {provinces.map(p => (
                  <option key={p.code} value={p.name}>{p.name}</option>
                ))}
              </select>
            </LabeledField>
            <LabeledField label="Giá" required>
              <input name="price" value={form.price} onChange={handleChange} placeholder="VD: 2.85 Tỷ" style={IS} />
            </LabeledField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <LabeledField label="Diện tích (m²)">
              <input name="area" type="number" value={form.area} onChange={handleChange} placeholder="68" style={IS} />
            </LabeledField>
            <LabeledField label="Số phòng ngủ">
              <input name="beds" type="number" value={form.beds} onChange={handleChange} placeholder="2" style={IS} />
            </LabeledField>
            <LabeledField label="Số phòng tắm">
              <input name="baths" type="number" value={form.baths} onChange={handleChange} placeholder="2" style={IS} />
            </LabeledField>
          </div>

          <LabeledField label="Pháp lý">
            <select name="legalStatus" value={form.legalStatus} onChange={handleChange} style={IS}>
              <option value="pink-book">Sổ hồng</option>
              <option value="red-book">Sổ đỏ</option>
              <option value="contract">Hợp đồng mua bán</option>
              <option value="unknown">Đang cập nhật</option>
            </select>
          </LabeledField>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Hình ảnh</label>
            <div style={{
              position: 'relative',
              minHeight: 118,
              border: images.length >= 1 ? '1px solid rgba(15,118,110,0.42)' : '1px dashed #b6c5d5',
              borderRadius: 12,
              padding: '1rem 1.15rem',
              cursor: 'pointer',
              background: images.length >= 1 ? 'linear-gradient(135deg, #f8fffd 0%, #f6fbfd 100%)' : '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: '0.95rem',
              overflow: 'hidden'
            }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#0f766e'}
              onMouseOut={e => e.currentTarget.style.borderColor = images.length >= 1 ? 'rgba(15,118,110,0.42)' : '#b6c5d5'}
            >
              <input type="file" multiple accept="image/*" onChange={handleImages} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
              <div style={{ width: 52, height: 52, borderRadius: 12, background: 'white', border: '1px solid #dbe7ee', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(15,42,68,0.07)', flexShrink: 0 }}>
                <ImagePlus size={25} color="#0f766e" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#0f172a', fontWeight: 800 }}>Tải ảnh bất động sản</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Tối thiểu 1 ảnh, ảnh đầu tiên là ảnh đại diện</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>JPG, PNG, WEBP · Tối đa 10 ảnh · Mỗi ảnh dưới 10MB</p>
              </div>
              <div style={{ padding: '0.42rem 0.72rem', borderRadius: 9, background: images.length >= 1 ? '#d8f3ef' : '#fff7ed', color: images.length >= 1 ? '#0f766e' : '#c2410c', fontSize: '0.74rem', fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {images.length}/10 · {images.length >= 1 ? 'Có thể đăng' : 'Cần ảnh'}
              </div>
            </div>
            {previews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))', gap: '0.65rem', marginTop: '0.8rem' }}>
                {previews.map((url, i) => (
                  <div key={i} style={{
                    position: 'relative',
                    aspectRatio: '1 / 0.76',
                    borderRadius: 10,
                    overflow: 'hidden',
                    border: i === 0 ? '2px solid #0f766e' : '1px solid #e2e8f0',
                    boxShadow: i === 0 ? '0 10px 24px rgba(15,118,110,0.13)' : 'none',
                    background: '#f8fafc'
                  }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 7, background: 'rgba(7,24,39,0.72)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} /></button>
                    {i === 0 && <div style={{ position: 'absolute', bottom: 6, left: 6, background: 'rgba(15,118,110,0.92)', color: 'white', fontSize: '0.66rem', fontWeight: 800, borderRadius: 7, padding: '0.22rem 0.45rem' }}>Đại diện</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Mô tả chi tiết</label>
              <button
                type="button"
                onClick={handleGenerateAIDescription}
                disabled={aiLoading}
                style={{
                  border: '1px solid rgba(15,118,110,0.24)',
                  background: aiLoading ? '#f1f5f9' : 'linear-gradient(135deg, #ecfdf5, #eff6ff)',
                  color: aiLoading ? '#94a3b8' : '#0f766e',
                  borderRadius: 9,
                  padding: '0.42rem 0.68rem',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: aiLoading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  whiteSpace: 'nowrap',
                  boxShadow: aiLoading ? 'none' : '0 8px 18px rgba(15,118,110,0.08)'
                }}
              >
                <Sparkles size={13} />
                {aiLoading ? 'AI đang viết...' : 'Tạo nội dung AI'}
              </button>
            </div>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Nhập ý chính trước, ví dụ: vị trí, tiện ích, nội thất, pháp lý, điểm mạnh... Sau đó bấm Tạo nội dung AI."
              style={{ ...IS, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
            <button style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>💾 Lưu nháp</button>
            <button onClick={handleSubmit} disabled={loading} style={{ padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0f766e, #0891b2)', color: 'white', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 8px rgba(15,118,110,0.3)' }}>
              {loading ? '⏳ Đang xử lý...' : <><Sparkles size={15} /> Đăng tin</>}
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.25rem', position: 'sticky', top: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Sparkles size={17} color="#f59e0b" />
          <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>AI Chấm điểm</h4>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          {(() => {
            const score = [form.location, form.price, form.area].filter(Boolean).length * 15 + previews.length * 10 + (form.description.length > 50 ? 15 : 0) + 10;
            const pct = Math.min(score, 100);
            return (
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: `conic-gradient(#0f766e 0% ${pct}%, #e2e8f0 ${pct}% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a', lineHeight: 1 }}>{pct}</span>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>/100</span>
                </div>
              </div>
            );
          })()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            [!!form.location, 'Đã nhập vị trí'],
            [!!form.price, 'Đã nhập giá'],
            [previews.length >= 1, `${previews.length} hình ảnh (tối thiểu 1)`],
            [form.description.length > 50, 'Mô tả chi tiết'],
            [!!form.area, 'Đã nhập diện tích'],
          ].map(([ok, txt], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              {ok ? <CheckCircle size={14} color="#0f766e" /> : <AlertCircle size={14} color="#f59e0b" />}
              <span style={{ color: ok ? '#0f766e' : '#64748b' }}>{txt}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem', padding: '0.7rem', background: '#eff6ff', borderRadius: 8, fontSize: '0.76rem', color: '#1d4ed8', lineHeight: 1.5 }}>
          💡 Tin có ảnh đẹp và mô tả chi tiết được tìm kiếm nhiều hơn <strong>3.2×</strong>
        </div>
      </div>
    </div>
  );
}
