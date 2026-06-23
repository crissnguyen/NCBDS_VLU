import { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard, Users, FileText, Settings, ShieldCheck,
  LogOut, User, Check, X, Bell, Search, Image as ImageIcon,
  TrendingUp, Home, MoreVertical, ShieldAlert,
  PlusCircle, Eye, EyeOff, Trash2
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useToast, Toasts, StatCard, SidebarItem, IS, LabeledField, PostPropertyForm } from '../../components/DashboardShared';

import AddEmployeeModal from './components/AddEmployeeModal';
import EditPropertyModal from './components/EditPropertyModal';
import OverviewTab from './tabs/OverviewTab';
import UserManagementTab from './tabs/UserManagementTab';
import PendingPropertiesTab from './tabs/PendingPropertiesTab';
import PostPropertyTab from './tabs/PostPropertyTab';
import AllPropertiesTab from './tabs/AllPropertiesTab';
import SettingsTab from './tabs/SettingsTab';

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

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard({ currentUser, setCurrentPage, setUserRole, setCurrentUser }) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const users = data?.users || [];
  const metrics = data?.metrics || {};
  const stats = data?.stats || {};
  const [activeTab, setActiveTab] = useState(0);
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
          fetchData();
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

          
          {activeTab === 0 && <OverviewTab stats={stats} revenueData={revenueData} propertyTypeData={propertyTypeData} currentUser={currentUser} pendingProperties={pendingProperties} allProperties={allProperties} metrics={metrics} />}
          {activeTab === 1 && <UserManagementTab users={users} currentUser={currentUser} handleRoleChange={handleRoleChange} handleToggleStatus={handleToggleStatus} handleDeleteUser={handleDeleteUser} setShowAddEmployee={setShowAddEmployee} />}
          {activeTab === 2 && <PendingPropertiesTab pendingProperties={pendingProperties} handleApproveProperty={handleApproveProperty} />}
          {activeTab === 3 && <PostPropertyTab currentUser={currentUser} toast={toast} fetchData={fetchData} />}
          {activeTab === 4 && <AllPropertiesTab allProperties={allProperties} setEditingProperty={setEditingProperty} handleDeleteProperty={handleDeleteProperty} handleApproveProperty={handleApproveProperty} />}
          {activeTab === 5 && <SettingsTab />}
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
