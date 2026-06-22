import { useEffect, useState, useRef, useCallback } from 'react';
import {
  LayoutDashboard, Users, FileText, ShieldCheck, BarChart2, Settings,
  LogOut, User, Check, X, Image as ImageIcon, Bell, Search,
  TrendingUp, TrendingDown, Home, MoreVertical, ShieldAlert,
  PlusCircle, ImagePlus, CheckCircle, AlertCircle, Info, Sparkles, Eye, EyeOff
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ─── Chart Data ───────────────────────────────────────────────────────────────
const revenueData = [
  { month: 'T1', tinDang: 12 }, { month: 'T2', tinDang: 18 },
  { month: 'T3', tinDang: 9 },  { month: 'T4', tinDang: 24 },
  { month: 'T5', tinDang: 31 }, { month: 'T6', tinDang: 28 },
];
const propertyTypeData = [
  { name: 'Căn hộ', value: 45, color: '#0f766e' },
  { name: 'Nhà phố', value: 30, color: '#0f2a44' },
  { name: 'Đất nền', value: 25, color: '#f59e0b' },
];
const activityData = [
  { time: '08h', v: 2 }, { time: '10h', v: 5 },
  { time: '12h', v: 3 }, { time: '14h', v: 8 },
  { time: '16h', v: 6 }, { time: '18h', v: 4 },
];

// ─── Toast System ─────────────────────────────────────────────────────────────
function useToast() {
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

function Toasts({ toasts, remove }) {
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
function StatCard({ icon: Icon, label, value, change, up = true, color = '#0f766e' }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
function SidebarItem({ icon: Icon, label, active, badge, onClick }) {
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
const IS = { border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.6rem 0.875rem', fontSize: '0.875rem', color: '#0f172a', outline: 'none', background: 'white', width: '100%', boxSizing: 'border-box' };

function LabeledField({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}{required && <span style={{ color: '#ef4444' }}> *</span>}</label>
      {children}
    </div>
  );
}

// ─── AddEmployeeModal ─────────────────────────────────────────────────────────
function AddEmployeeModal({ onClose, onSuccess, toast }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', title: 'Chuyên viên Môi giới', performance: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.warning('Thiếu thông tin', 'Vui lòng điền đủ Tên, Email và Mật khẩu.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Tạo tài khoản thành công', `Nhân viên "${form.name}" đã được thêm vào hệ thống.`);
        onSuccess(result.data);
        onClose();
      } else {
        toast.error('Tạo thất bại', result.message);
      }
    } catch {
      toast.error('Lỗi kết nối', 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '2rem', width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'fadeInScale 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>Thêm nhân viên mới</h3>
            <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>Tạo tài khoản Sale để đăng nhập vào hệ thống</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#64748b" /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <LabeledField label="Họ và tên" required>
            <input name="name" value={form.name} onChange={handleChange} placeholder="VD: Nguyễn Văn A" style={IS} />
          </LabeledField>
          <LabeledField label="Email đăng nhập" required>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="VD: nhanvien@estateai.vn" style={IS} />
          </LabeledField>
          <LabeledField label="Mật khẩu" required>
            <div style={{ position: 'relative' }}>
              <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Tối thiểu 6 ký tự" style={{ ...IS, paddingRight: '2.5rem' }} />
              <button onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </LabeledField>
          <LabeledField label="Chức danh">
            <select name="title" value={form.title} onChange={handleChange} style={IS}>
              <option>Chuyên viên Môi giới</option>
              <option>Môi giới Cao cấp</option>
              <option>Trưởng nhóm Sale</option>
              <option>Giám đốc Kinh doanh</option>
            </select>
          </LabeledField>
        </div>

        <div style={{ background: '#eff6ff', borderRadius: 10, padding: '0.75rem 1rem', marginTop: '1.25rem', fontSize: '0.8rem', color: '#1d4ed8' }}>
          💡 Tài khoản sẽ có vai trò <strong>Sale</strong> — có thể đăng nhập và đăng tin bất động sản.
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button onClick={onClose} style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Hủy</button>
          <button onClick={handleSubmit} disabled={loading} style={{ padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Đang tạo...' : '✓ Tạo tài khoản'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EditPropertyModal ────────────────────────────────────────────────────────
function EditPropertyModal({ property, onClose, onSuccess, toast }) {
  const [form, setForm] = useState({
    title: property.title || '',
    price: property.price || '',
    location: property.location || '',
    area: property.area || '',
    beds: property.beds || '',
    baths: property.baths || '',
    transactionType: property.transactionType || 'sale',
    propertyType: property.propertyType || 'apartment',
    legalStatus: property.legalStatus || 'pink-book',
    status: property.status || 'Pending',
    description: property.description || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.location) {
      toast.warning('Thiếu thông tin', 'Tiêu đề, Giá và Vị trí là bắt buộc.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/api/admin/properties/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Thành công', 'Đã cập nhật thông tin bài đăng.');
        onSuccess();
      } else {
        toast.error('Cập nhật thất bại', result.message);
      }
    } catch {
      toast.error('Lỗi kết nối', 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '2rem', width: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'fadeInScale 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>Chỉnh sửa tin đăng</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#64748b" /></button>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <LabeledField label="Tiêu đề tin" required>
            <input name="title" value={form.title} onChange={handleChange} style={IS} />
          </LabeledField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <LabeledField label="Giá" required>
              <input name="price" value={form.price} onChange={handleChange} style={IS} />
            </LabeledField>
            <LabeledField label="Vị trí" required>
              <input name="location" value={form.location} onChange={handleChange} style={IS} />
            </LabeledField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <LabeledField label="Diện tích (m²)">
              <input name="area" type="number" value={form.area} onChange={handleChange} style={IS} />
            </LabeledField>
            <LabeledField label="Phòng ngủ">
              <input name="beds" type="number" value={form.beds} onChange={handleChange} style={IS} />
            </LabeledField>
            <LabeledField label="Phòng tắm">
              <input name="baths" type="number" value={form.baths} onChange={handleChange} style={IS} />
            </LabeledField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <LabeledField label="Giao dịch">
              <select name="transactionType" value={form.transactionType} onChange={handleChange} style={IS}>
                <option value="sale">Bán</option>
                <option value="rent">Cho thuê</option>
              </select>
            </LabeledField>
            <LabeledField label="Loại BĐS">
              <select name="propertyType" value={form.propertyType} onChange={handleChange} style={IS}>
                <option value="apartment">Căn hộ</option>
                <option value="house">Nhà phố</option>
                <option value="land">Đất nền</option>
              </select>
            </LabeledField>
            <LabeledField label="Trạng thái">
              <select name="status" value={form.status} onChange={handleChange} style={IS}>
                <option value="Approved">Đã duyệt</option>
                <option value="Pending">Chờ duyệt</option>
                <option value="Rejected">Từ chối</option>
              </select>
            </LabeledField>
          </div>
          <LabeledField label="Mô tả">
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} style={{ ...IS, resize: 'vertical' }} />
          </LabeledField>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button onClick={onClose} style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Hủy</button>
          <button onClick={handleSubmit} disabled={loading} style={{ padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PostPropertyForm (flat - single page) ────────────────────────────────────
function PostPropertyForm({ currentUser, toast }) {
  const [form, setForm] = useState({
    transactionType: 'sale', propertyType: 'apartment',
    location: '', price: '', area: '', beds: '', baths: '',
    legalStatus: 'pink-book', description: '', title: ''
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error("Lỗi lấy khu vực:", err));
  }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleImages = e => {
    const files = Array.from(e.target.files);
    setImages(p => [...p, ...files]);
    setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
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
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', autoTitle());
      Object.keys(form).forEach(k => {
        if (k !== 'title' && form[k]) fd.append(k, form[k]);
      });
      if (currentUser?.id) fd.append('authorId', currentUser.id);
      fd.append('status', 'Approved'); // Admin tin tự duyệt
      images.forEach(img => fd.append('images', img));

      const res = await fetch('http://localhost:5001/api/properties', { method: 'POST', body: fd });
      const result = await res.json();
      if (result.success) {
        toast.success('Đăng tin thành công!', `Tin "${autoTitle()}" đã được đăng và phê duyệt.`);
        setForm({ transactionType: 'sale', propertyType: 'apartment', location: '', price: '', area: '', beds: '', baths: '', legalStatus: 'pink-book', description: '', title: '' });
        setImages([]); setPreviews([]);
      } else {
        toast.error('Đăng tin thất bại', result.message);
      }
    } catch {
      toast.error('Lỗi kết nối', 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
      {/* Main Form */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #0f2a44, #0f766e)' }}>
          <h3 style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '1rem' }}>📋 Thông tin bất động sản</h3>
          <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>Tin đăng từ Admin sẽ được tự động phê duyệt</p>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Row 1: Loại giao dịch & BĐS */}
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

          {/* Row 2: Tiêu đề */}
          <LabeledField label="Tiêu đề tin đăng">
            <input name="title" value={form.title} onChange={handleChange} placeholder={`Tự động: "${autoTitle()}"`} style={IS} />
          </LabeledField>

          {/* Row 3: Vị trí & Giá */}
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

          {/* Row 4: DT, Phòng ngủ, Phòng tắm */}
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

          {/* Row 5: Pháp lý */}
          <LabeledField label="Pháp lý">
            <select name="legalStatus" value={form.legalStatus} onChange={handleChange} style={IS}>
              <option value="pink-book">Sổ hồng</option>
              <option value="red-book">Sổ đỏ</option>
              <option value="contract">Hợp đồng mua bán</option>
              <option value="unknown">Đang cập nhật</option>
            </select>
          </LabeledField>

          {/* Row 6: Upload ảnh */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Hình ảnh</label>
            <div style={{ position: 'relative', border: '2px dashed #cbd5e1', borderRadius: 10, padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#0f766e'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}
            >
              <input type="file" multiple accept="image/*" onChange={handleImages} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
              <ImagePlus size={28} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>Kéo thả hoặc click để chọn ảnh</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.73rem', color: '#94a3b8' }}>JPG, PNG, WEBP · Tối đa 10 ảnh</p>
            </div>
            {previews.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.75rem' }}>
                {previews.map((url, i) => (
                  <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: i === 0 ? '2px solid #0f766e' : '1px solid #e2e8f0' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={10} /></button>
                    {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(15,118,110,0.85)', color: 'white', fontSize: '0.6rem', fontWeight: 700, textAlign: 'center' }}>Ảnh chính</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Row 7: Mô tả */}
          <LabeledField label="Mô tả chi tiết">
            <textarea name="description" rows={4} value={form.description} onChange={handleChange} placeholder="Mô tả về vị trí, tiện ích, nội thất, tiềm năng đầu tư..." style={{ ...IS, resize: 'vertical', lineHeight: 1.6 }} />
          </LabeledField>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
            <button style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>💾 Lưu nháp</button>
            <button onClick={handleSubmit} disabled={loading} style={{ padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0f766e, #0891b2)', color: 'white', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 8px rgba(15,118,110,0.3)' }}>
              {loading ? '⏳ Đang xử lý...' : <><Sparkles size={15} /> Đăng tin ngay</>}
            </button>
          </div>
        </div>
      </div>

      {/* Score Panel */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.25rem', position: 'sticky', top: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Sparkles size={17} color="#f59e0b" />
          <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>AI Chấm điểm</h4>
        </div>
        {/* Ring */}
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
            [previews.length > 0, `${previews.length} hình ảnh`],
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard({ currentUser, setCurrentPage, setUserRole, setCurrentUser }) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dRes, pRes, aRes] = await Promise.all([
        fetch('http://localhost:5001/api/admin/dashboard'),
        fetch('http://localhost:5001/api/admin/properties/pending'),
        fetch('http://localhost:5001/api/admin/properties/all')
      ]);
      const dr = await dRes.json();
      const pr = await pRes.json();
      const ar = await aRes.json();
      if (dr.success) setData(dr.data);
      if (pr.success) setPendingProperties(pr.data);
      if (ar.success) setAllProperties(ar.data);
    } catch {
      toast.error('Lỗi kết nối', 'Không thể tải dữ liệu từ máy chủ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'Active' ? 'Locked' : 'Active';
    setConfirmModal({ isOpen: true, type: 'user', userId: user.id, userName: user.name, newStatus });
  };

  const handleApproveProperty = (propertyId, action) => {
    setConfirmModal({ isOpen: true, type: 'property', propertyId, action });
  };

  const executeAction = async () => {
    const m = confirmModal;
    setConfirmModal({ isOpen: false });

    if (m.type === 'user') {
      try {
        const res = await fetch(`http://localhost:5001/api/admin/users/${m.userId}/status`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: m.newStatus })
        });
        const r = await res.json();
        if (r.success) {
          setData(p => ({ ...p, users: p.users.map(u => u.id === m.userId ? { ...u, status: m.newStatus } : u) }));
          toast.success('Cập nhật thành công', `Tài khoản "${m.userName}" đã được ${m.newStatus === 'Locked' ? 'khóa' : 'mở khóa'}.`);
        } else { toast.error('Thất bại', r.message); }
      } catch { toast.error('Lỗi kết nối', 'Không thể thực hiện thao tác.'); }
    }

    if (m.type === 'property') {
      try {
        const res = await fetch(`http://localhost:5001/api/admin/properties/${m.propertyId}/status`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: m.action === 'approve' ? 'Approved' : 'Rejected' })
        });
        const r = await res.json();
        if (r.success) {
          setPendingProperties(p => p.filter(x => x.id !== m.propertyId));
          if (m.action === 'approve') { toast.success('Phê duyệt thành công', 'Tin đã được duyệt và hiển thị.'); fetchData(); }
          else { toast.warning('Đã từ chối', 'Tin đăng đã bị từ chối.'); }
        } else { toast.error('Thất bại', r.message); }
      } catch { toast.error('Lỗi kết nối', 'Không thể thực hiện thao tác.'); }
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tin đăng này?")) return;
    try {
      const res = await fetch(`http://localhost:5001/api/admin/properties/${propertyId}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        toast.success("Thành công", "Đã xóa tin đăng.");
        fetchData();
      } else toast.error("Lỗi", result.message);
    } catch {
      toast.error("Lỗi kết nối", "Không thể xóa tin đăng.");
    }
  };

  const filteredUsers = data?.users?.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const statusColor = { Active: '#0f766e', Pending: '#f59e0b', Locked: '#ef4444' };
  const statusBg    = { Active: '#d8f3ef', Pending: '#fef3c7', Locked: '#fee2e2' };
  const statusLabel = { Active: '● Hoạt động', Pending: '● Chờ duyệt', Locked: '● Đã khóa' };

  const navItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', tab: 0 },
    { icon: Users, label: 'Nhân viên Sale', tab: 1 },
    { icon: FileText, label: 'Phê duyệt tin', tab: 2, badge: pendingProperties.length },
    { icon: PlusCircle, label: 'Đăng tin mới', tab: 3 },
    { icon: FileText, label: 'Quản lý tin đăng', tab: 4 },
    { icon: Settings, label: 'Cài đặt', tab: 5 },
  ];

  if (loading && !data) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#0f2a44', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Đang tải dữ liệu hệ thống...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeInScale { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );

  const metrics = data?.metrics || {};

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f1f5f9', fontFamily: 'Plus Jakarta Sans, sans-serif', overflow: 'hidden' }}>
      <style>{`@keyframes fadeInScale { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>
      <Toasts toasts={toast.toasts} remove={toast.remove} />

      {/* SIDEBAR */}
      <aside style={{ width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg, #0f2a44 0%, #1e4066 60%, #0f4c75 100%)' }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #0f766e, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(8,145,178,0.4)' }}>
              <Home size={18} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem' }}>Estate<span style={{ color: '#38bdf8' }}>AI</span></div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.08em' }}>ADMIN PORTAL</div>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
          {navItems.map(item => (
            <SidebarItem key={item.tab} icon={item.icon} label={item.label} active={activeTab === item.tab} badge={item.badge || 0} onClick={() => setActiveTab(item.tab)} />
          ))}
        </nav>
        {/* User */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #0f766e, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><User size={15} color="white" /></div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.name || 'Admin'}</div>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.7rem' }}>Quản trị viên</div>
            </div>
            <button onClick={() => { setUserRole?.(null); setCurrentUser?.(null); setCurrentPage?.('home'); }} title="Đăng xuất"
              style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6, padding: 4 }}
              onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
              onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            ><LogOut size={15} /></button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: 60, background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.75rem', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{navItems.find(n => n.tab === activeTab)?.label}</h2>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 1 }}>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setActiveTab(2)}>
              <Bell size={18} color="#64748b" />
              {pendingProperties.length > 0 && <span style={{ position: 'absolute', top: -5, right: -5, width: 15, height: 15, background: '#ef4444', borderRadius: '50%', fontSize: '0.6rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{pendingProperties.length}</span>}
            </div>
            <div style={{ width: 1, height: 22, background: '#e2e8f0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #0f2a44, #0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={14} color="white" /></div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{currentUser?.name || 'Admin'}</span>
              <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>Admin</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* TAB 0: Tổng quan */}
          {activeTab === 0 && (
            <>
              <div style={{ background: 'linear-gradient(120deg, #0f2a44 0%, #0f766e 100%)', borderRadius: 14, padding: '1.5rem 2rem', color: 'white' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.2rem' }}>Chào mừng, {currentUser?.name?.split(' ').pop() || 'Admin'}! 👋</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.875rem' }}>
                  <strong style={{ color: 'white' }}>{pendingProperties.length} tin đăng</strong> chờ phê duyệt · <strong style={{ color: 'white' }}>{metrics.totalSales || 0} nhân viên</strong> đang hoạt động
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <StatCard icon={Users} label="Tổng số Sale" value={metrics.totalSales || 0} change="+2 tháng này" color="#0f766e" />
                <StatCard icon={FileText} label="Tin chờ duyệt" value={pendingProperties.length} change={pendingProperties.length === 0 ? 'Xong hết' : 'Cần xử lý'} up={pendingProperties.length === 0} color="#f59e0b" />
                <StatCard icon={Home} label="Tổng tin đăng" value={allProperties.length} change="Tất cả" color="#0f2a44" />
                <StatCard icon={TrendingUp} label="Giao dịch" value={metrics.successfulTransactions || 0} change="+12%" color="#0891b2" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
                <div style={{ background: 'white', borderRadius: 14, padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div><h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Xu hướng tin đăng</h3><p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>6 tháng gần nhất</p></div>
                    <span style={{ background: '#d8f3ef', color: '#0f766e', padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 }}>+23% ↑</span>
                  </div>
                  <ResponsiveContainer width="100%" height={190}>
                    <AreaChart data={revenueData}>
                      <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f766e" stopOpacity={0.2}/><stop offset="95%" stopColor="#0f766e" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="month" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{borderRadius:10,border:'none',boxShadow:'0 4px 16px rgba(0,0,0,0.1)'}}/>
                      <Area type="monotone" dataKey="tinDang" name="Tin đăng" stroke="#0f766e" strokeWidth={2.5} fill="url(#g1)"/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: 'white', borderRadius: 14, padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '0.95rem' }}>Loại BĐS</h3>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart><Pie data={propertyTypeData} cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={3} dataKey="value">{propertyTypeData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={v=>`${v}%`} contentStyle={{borderRadius:10,border:'none'}}/></PieChart>
                  </ResponsiveContainer>
                  <div style={{display:'flex',flexDirection:'column',gap:'0.4rem',marginTop:'0.4rem'}}>
                    {propertyTypeData.map(d=>(
                      <div key={d.name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:'0.78rem'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}><div style={{width:9,height:9,borderRadius:3,background:d.color}}/><span style={{color:'#475569'}}>{d.name}</span></div>
                        <span style={{fontWeight:700,color:'#0f172a'}}>{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 1: Nhân viên */}
          {activeTab === 1 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Nhân viên Sale</h2><p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>Quản lý tài khoản và hiệu suất đội ngũ</p></div>
                <button onClick={() => setShowAddEmployee(true)} style={{ background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', border: 'none', borderRadius: 10, padding: '0.6rem 1.1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                  <PlusCircle size={15} /> Thêm nhân viên
                </button>
              </div>
              <div style={{ background: 'white', borderRadius: 10, padding: '0.65rem 1rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Search size={15} color="#94a3b8" />
                <input type="text" placeholder="Tìm theo tên hoặc email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.875rem', background: 'transparent', color: '#0f172a' }} />
              </div>
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ borderBottom: '1px solid #f1f5f9' }}>{['Nhân viên', 'Chức vụ', 'Trạng thái', 'Tin đăng', 'Hiệu suất', 'Thao tác'].map(h=><th key={h} style={{padding:'0.875rem 1.125rem',textAlign:'left',fontSize:'0.73rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.05em',background:'#fafafa'}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filteredUsers.map((user, idx) => (
                      <tr key={user.id} style={{ borderBottom: idx < filteredUsers.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.12s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '0.875rem 1.125rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: `hsl(${(user.name.charCodeAt(0)*17)%360},55%,45%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>{user.name.charAt(0).toUpperCase()}</div>
                            <div><div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{user.name}</div><div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user.email}</div></div>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1.125rem', fontSize: '0.82rem', color: '#475569' }}>{user.title || 'Môi giới'}</td>
                        <td style={{ padding: '0.875rem 1.125rem' }}>
                          <span style={{ background: statusBg[user.status]||'#f1f5f9', color: statusColor[user.status]||'#64748b', padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 }}>{statusLabel[user.status] || user.status}</span>
                        </td>
                        <td style={{ padding: '0.875rem 1.125rem', fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{user._count?.properties || 0}</td>
                        <td style={{ padding: '0.875rem 1.125rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 56, height: 5, borderRadius: 3, background: '#f1f5f9' }}><div style={{ width: user.performance || '0%', height: '100%', background: parseInt(user.performance)>80?'#0f766e':'#f59e0b', borderRadius: 3 }}/></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: parseInt(user.performance)>80?'#0f766e':'#f59e0b' }}>{user.performance||'-'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1.125rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => handleToggleStatus(user)} title={user.status==='Active'?'Khóa':'Mở khóa'} style={{ width:30,height:30,borderRadius:7,border:'1px solid #e2e8f0',background:'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}
                              onMouseOver={e=>e.currentTarget.style.background=user.status==='Active'?'#fee2e2':'#d8f3ef'}
                              onMouseOut={e=>e.currentTarget.style.background='white'}
                            ><ShieldAlert size={13} color={user.status==='Active'?'#ef4444':'#0f766e'}/></button>
                            <button style={{ width:30,height:30,borderRadius:7,border:'1px solid #e2e8f0',background:'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}><MoreVertical size={13} color="#64748b"/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}><Users size={36} style={{ margin:'0 auto 0.5rem',opacity:0.25 }}/><p style={{ margin:0 }}>Không tìm thấy nhân viên nào</p></div>}
              </div>
            </>
          )}

          {/* TAB 2: Phê duyệt */}
          {activeTab === 2 && (
            <>
              <div><h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Phê duyệt tin đăng</h2><p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>{pendingProperties.length > 0 ? `${pendingProperties.length} tin đang chờ xét duyệt` : 'Không có tin nào cần duyệt'}</p></div>
              {pendingProperties.length === 0 ? (
                <div style={{ background: 'white', borderRadius: 14, padding: '3.5rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#d8f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}><ShieldCheck size={28} color="#0f766e"/></div>
                  <h3 style={{ margin: '0 0 0.4rem' }}>Tất cả tin đã được xử lý!</h3>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.875rem' }}>Mọi thứ đã xong, không có gì cần làm ngay lúc này.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {pendingProperties.map(p => (
                    <div key={p.id} style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <div style={{ width: 140, height: 96, borderRadius: 10, overflow: 'hidden', background: '#f1f5f9', flexShrink: 0, position: 'relative' }}>
                        {p.images?.length > 0 ? <img src={`http://localhost:5001${p.images[0]}`} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/> : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:3 }}><ImageIcon size={22} color="#cbd5e1"/><span style={{fontSize:'0.68rem',color:'#cbd5e1'}}>Chưa có ảnh</span></div>}
                        {p.images?.length > 1 && <div style={{ position:'absolute',top:5,right:5,background:'rgba(0,0,0,0.55)',color:'white',borderRadius:5,fontSize:'0.68rem',fontWeight:700,padding:'1px 6px' }}>+{p.images.length-1}</div>}
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
                        <div style={{ fontSize:'0.78rem',color:'#64748b' }}>Đăng bởi: <strong style={{color:'#0f172a'}}>{p.author?.name||'Ẩn danh'}</strong>{p.author?.email && <span style={{color:'#94a3b8'}}> · {p.author.email}</span>}</div>
                      </div>
                      <div style={{ display:'flex',flexDirection:'column',gap:'0.4rem',flexShrink:0 }}>
                        <button onClick={() => handleApproveProperty(p.id, 'approve')} style={{ background:'linear-gradient(135deg,#0f766e,#0891b2)',color:'white',border:'none',borderRadius:9,padding:'0.55rem 1rem',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.82rem',boxShadow:'0 2px 6px rgba(15,118,110,0.3)' }}><Check size={14}/> Phê duyệt</button>
                        <button onClick={() => handleApproveProperty(p.id, 'reject')} style={{ background:'#fef2f2',color:'#ef4444',border:'1px solid #fecaca',borderRadius:9,padding:'0.55rem 1rem',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.82rem' }}><X size={14}/> Từ chối</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 3: Đăng tin */}
          {activeTab === 3 && (
            <>
              <div><h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Đăng tin bất động sản mới</h2><p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>Tin đăng từ Admin sẽ được phê duyệt tự động và hiển thị ngay lập tức.</p></div>
              <PostPropertyForm currentUser={currentUser} toast={toast} />
            </>
          )}
          {/* TAB 4: Quản lý tất cả tin đăng */}
          {activeTab === 4 && (
            <>
              <div><h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Quản lý tất cả tin đăng</h2></div>
              {allProperties.length === 0 ? (
                <div style={{ background:'white',padding:'3rem',textAlign:'center',borderRadius:16,border:'1px solid #e2e8f0',color:'#64748b' }}>Không có tin đăng nào.</div>
              ) : (
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '1rem', fontWeight: 600 }}>Thông tin</th>
                        <th style={{ padding: '1rem', fontWeight: 600 }}>Loại</th>
                        <th style={{ padding: '1rem', fontWeight: 600 }}>Tác giả</th>
                        <th style={{ padding: '1rem', fontWeight: 600 }}>Trạng thái</th>
                        <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allProperties.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
                              <img src={p.images[0] ? `http://localhost:5001${p.images[0]}` : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80'} alt="" style={{ width: 64, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                              <div>
                                <div style={{ fontWeight: 600, color: '#0f2a44', marginBottom: 4 }}>{p.title}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '0.5rem' }}><span>{p.price}</span>•<span>{p.location}</span></div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 500 }}>{p.transactionType === 'sale' ? 'Bán' : 'Thuê'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.propertyType}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 500 }}>{p.author?.name || 'Admin'}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                              background: p.status === 'Approved' ? '#dcfce7' : p.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                              color: p.status === 'Approved' ? '#166534' : p.status === 'Pending' ? '#b45309' : '#991b1b'
                            }}>
                              {p.status === 'Approved' ? 'Đã duyệt' : p.status === 'Pending' ? 'Chờ duyệt' : 'Từ chối'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <button onClick={() => setEditingProperty(p)} style={{ padding: '6px 12px', background: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', marginRight: '8px' }}>Sửa</button>
                            <button onClick={() => handleDeleteProperty(p.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Xóa</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* TAB 5: Cài đặt */}
          {activeTab === 5 && (
            <>
              <div><h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Cài đặt hệ thống</h2></div>
              {[
                { title: 'Thông báo email tự động', desc: 'Gửi email khi có tin đăng mới hoặc cần phê duyệt', on: true },
                { title: 'Phê duyệt tự động (Sale hiệu suất cao)', desc: 'Tự động duyệt tin từ Sale có hiệu suất > 90%', on: false },
                { title: 'AI Copilot phân tích giá', desc: 'Gợi ý giá thị trường hợp lý dựa trên AI', on: true },
                { title: 'Chế độ bảo trì', desc: 'Tạm thời ẩn website khỏi người dùng thông thường', on: false },
              ].map((s, i) => (
                <div key={i} style={{ background:'white',borderRadius:14,border:'1px solid #e2e8f0',padding:'1.1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <div><div style={{ fontWeight:700,color:'#0f172a',fontSize:'0.9rem',marginBottom:3 }}>{s.title}</div><div style={{ fontSize:'0.8rem',color:'#64748b' }}>{s.desc}</div></div>
                  <div style={{ width:46,height:25,borderRadius:13,background:s.on?'#0f766e':'#e2e8f0',position:'relative',cursor:'pointer',flexShrink:0 }}>
                    <div style={{ position:'absolute',top:3,left:s.on?24:3,width:19,height:19,borderRadius:'50%',background:'white',transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}/>
                  </div>
                </div>
              ))}
            </>
          )}

        </main>
      </div>

      {/* Modals */}
      {confirmModal.isOpen && (
        <div style={{ position:'fixed',inset:0,background:'rgba(15,23,42,0.5)',backdropFilter:'blur(3px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9998 }}>
          <div style={{ background:'white',borderRadius:18,padding:'1.75rem',width:400,boxShadow:'0 20px 60px rgba(0,0,0,0.2)',animation:'fadeInScale 0.2s ease' }}>
            <div style={{ width:48,height:48,borderRadius:'50%',background:confirmModal.action==='approve'||confirmModal.newStatus==='Active'?'#d8f3ef':'#fee2e2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 0 1rem' }}>
              {confirmModal.action==='approve'||confirmModal.newStatus==='Active' ? <Check size={22} color="#0f766e"/> : <X size={22} color="#ef4444"/>}
            </div>
            <h3 style={{ margin:'0 0 0.4rem',fontWeight:800,fontSize:'1.1rem' }}>
              {confirmModal.type==='property' ? `Xác nhận ${confirmModal.action==='approve'?'phê duyệt':'từ chối'}?` : `Xác nhận ${confirmModal.newStatus==='Locked'?'khóa':'mở khóa'} tài khoản?`}
            </h3>
            <p style={{ color:'#64748b',marginBottom:'1.5rem',lineHeight:1.6,fontSize:'0.875rem' }}>
              {confirmModal.type==='property' ? `Bạn có chắc muốn ${confirmModal.action==='approve'?'phê duyệt':'từ chối'} tin đăng này?` : `Tài khoản "${confirmModal.userName}" sẽ bị ${confirmModal.newStatus==='Locked'?'khóa, không thể đăng nhập':'mở khóa trở lại'}.`}
            </p>
            <div style={{ display:'flex',justifyContent:'flex-end',gap:'0.75rem' }}>
              <button onClick={() => setConfirmModal({isOpen:false})} style={{ padding:'0.6rem 1.25rem',borderRadius:10,border:'1px solid #e2e8f0',background:'white',color:'#475569',fontWeight:600,cursor:'pointer',fontSize:'0.875rem' }}>Hủy bỏ</button>
              <button onClick={executeAction} style={{ padding:'0.6rem 1.25rem',borderRadius:10,border:'none',background:(confirmModal.action==='approve'||confirmModal.newStatus==='Active')?'linear-gradient(135deg,#0f766e,#0891b2)':'#ef4444',color:'white',fontWeight:600,cursor:'pointer',fontSize:'0.875rem' }}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {showAddEmployee && (
        <AddEmployeeModal
          onClose={() => setShowAddEmployee(false)}
          onSuccess={(newUser) => {
            setData(p => p ? ({ ...p, users: [...p.users, newUser] }) : p);
          }}
          toast={toast}
        />
      )}

      {/* EDIT PROPERTY MODAL */}
      {editingProperty && (
        <EditPropertyModal 
          property={editingProperty}
          onClose={() => setEditingProperty(null)}
          onSuccess={() => { setEditingProperty(null); fetchData(); }}
          toast={toast}
        />
      )}
    </div>
  );
}
