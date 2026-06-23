import { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard, Users, FileText, Settings, ShieldCheck,
  LogOut, User, Check, X, Bell, Search, Image as ImageIcon,
  TrendingUp, Home, MoreVertical, ShieldAlert,
  PlusCircle, Eye, EyeOff
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useToast, Toasts, StatCard, SidebarItem, IS, LabeledField, PostPropertyForm } from '../../components/DashboardShared';

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
      const res = await fetch('https://ncbds-vlu.onrender.com/api/admin/users', {
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
      const res = await fetch(`https://ncbds-vlu.onrender.com/api/admin/properties/${property.id}`, {
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
        fetch('https://ncbds-vlu.onrender.com/api/admin/dashboard'),
        fetch('https://ncbds-vlu.onrender.com/api/admin/properties/pending'),
        fetch('https://ncbds-vlu.onrender.com/api/admin/properties/all')
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


  const handleDeleteUser = async (userId, email) => {
    if (email === 'admin@test.vn' || userId === currentUser?.id) {
      toast.error('Không thể xóa tài khoản này!');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này? Các bài đăng của họ sẽ bị gỡ tên tác giả nhưng vẫn tồn tại trên hệ thống.')) {
      try {
        const res = await fetch(`https://ncbds-vlu.onrender.com/api/admin/users/${userId}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
          toast.success(data.message);
          fetchAdminData();
        } else {
          toast.error(data.message || 'Lỗi khi xóa tài khoản');
        }
      } catch (err) {
        console.error(err);
        toast.error('Lỗi kết nối máy chủ');
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {

    try {
      const res = await fetch(`https://ncbds-vlu.onrender.com/api/admin/users/${userId}/role`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const r = await res.json();
      if (r.success) {
        setData(p => ({ ...p, users: p.users.map(u => u.id === userId ? { ...u, role: newRole, title: newRole === 'sale' ? 'Chuyên viên Môi giới' : 'Khách hàng' } : u) }));
        toast.success('Thành công', r.message);
      } else { toast.error('Thất bại', r.message); }
    } catch { toast.error('Lỗi kết nối', 'Không thể đổi vai trò.'); }
  };

  const handleApproveProperty = (propertyId, action) => {
    setConfirmModal({ isOpen: true, type: 'property', propertyId, action });
  };

  const executeAction = async () => {
    const m = confirmModal;
    setConfirmModal({ isOpen: false });

    if (m.type === 'user') {
      try {
        const res = await fetch(`https://ncbds-vlu.onrender.com/api/admin/users/${m.userId}/status`, {
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
        const res = await fetch(`https://ncbds-vlu.onrender.com/api/admin/properties/${m.propertyId}/status`, {
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
      const res = await fetch(`https://ncbds-vlu.onrender.com/api/admin/properties/${propertyId}`, { method: 'DELETE' });
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
    { icon: Users, label: 'Tài khoản', tab: 1 },
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
                <div><h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Người dùng hệ thống</h2><p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>Quản lý danh sách và phân quyền tài khoản</p></div>
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
                  <thead><tr style={{ borderBottom: '1px solid #f1f5f9' }}>{['Người dùng', 'Vai trò / Quyền', 'Trạng thái', 'Tin đăng', 'Hiệu suất', 'Thao tác'].map(h=><th key={h} style={{padding:'0.875rem 1.125rem',textAlign:'left',fontSize:'0.73rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.05em',background:'#fafafa'}}>{h}</th>)}</tr></thead>
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
                        <td style={{ padding: '0.875rem 1.125rem' }}>
                          <select 
                            value={user.role} 
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            style={{ padding: '0.35rem 0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: user.role==='admin'?'#fee2e2':(user.role==='sale'?'#e0f2fe':'#f8fafc'), fontSize: '0.82rem', outline: 'none', cursor: 'pointer', color: user.role==='admin'?'#991b1b':(user.role==='sale'?'#0369a1':'#475569'), fontWeight: 600, width: '130px' }}
                            disabled={user.email === 'admin@test.vn' || user.id === currentUser?.id} // Ngăn admin tự sửa quyền của chính mình hoặc admin gốc
                          >
                            <option value="user">Khách hàng</option>
                            <option value="sale">Môi giới (Sale)</option>
                            <option value="admin">Quản trị viên</option>
                          </select>
                        </td>
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
                            
                            <button onClick={() => handleDeleteUser(user.id, user.email)} title="Xóa tài khoản" style={{ width:30,height:30,borderRadius:7,border:'1px solid #e2e8f0',background:'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}
                              onMouseOver={e=>e.currentTarget.style.background='#fee2e2'}
                              onMouseOut={e=>e.currentTarget.style.background='white'}
                            ><Trash2 size={13} color="#ef4444"/></button>
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
                        {p.images?.length > 0 ? <img src={(p.images[0].startsWith('http') || p.images[0].startsWith('data:image') ? p.images[0] : `https://ncbds-vlu.onrender.com${p.images[0]}`)} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/> : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:3 }}><ImageIcon size={22} color="#cbd5e1"/><span style={{fontSize:'0.68rem',color:'#cbd5e1'}}>Chưa có ảnh</span></div>}
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
              <PostPropertyForm currentUser={currentUser} toast={toast} onSuccess={fetchAdminData} />
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
                              <img src={p.images[0] ? (p.images[0].startsWith('http') || p.images[0].startsWith('data:image') ? p.images[0] : `https://ncbds-vlu.onrender.com${p.images[0]}`) : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80'} alt="" style={{ width: 64, height: 48, borderRadius: 8, objectFit: 'cover' }} />
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
