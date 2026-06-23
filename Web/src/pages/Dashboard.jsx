import { useEffect, useState } from 'react';
import { LayoutDashboard, FileText, PlusCircle, LogOut, User, Home, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { useToast, Toasts, StatCard, SidebarItem, PostPropertyForm } from '../components/DashboardShared';

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard({ currentUser, setCurrentPage, setUserRole, setCurrentUser }) {
  const toast = useToast();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://ncbds-vlu.onrender.com/api/properties?authorId=${currentUser?.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProperties(data);
      }
    } catch {
      toast.error('Lỗi kết nối', 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, [currentUser?.id]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', tab: 0 },
    { icon: PlusCircle, label: 'Đăng tin mới', tab: 1 },
    { icon: FileText, label: 'Quản lý tin đăng', tab: 2 },
  ];

  if (loading && properties.length === 0) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#0f2a44', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Đang tải dữ liệu hệ thống...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeInScale { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );

  const statusColor = { Approved: '#166534', Pending: '#854d0e', Rejected: '#991b1b' };
  const statusBg    = { Approved: '#dcfce7', Pending: '#fef08a', Rejected: '#fee2e2' };
  const statusLabel = { Approved: 'Đã duyệt', Pending: 'Chờ duyệt', Rejected: 'Từ chối' };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f1f5f9', fontFamily: 'Plus Jakarta Sans, sans-serif', overflow: 'hidden' }}>
      <style>{`@keyframes fadeInScale { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>
      <Toasts toasts={toast.toasts} remove={toast.remove} />

      {/* SIDEBAR */}
      <aside style={{ width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg, #0f2a44 0%, #1e4066 60%, #0f4c75 100%)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', cursor: 'pointer' }} onClick={() => setCurrentPage('home')}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #0f766e, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(8,145,178,0.4)' }}>
              <Home size={18} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem' }}>Estate<span style={{ color: '#38bdf8' }}>AI</span></div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.08em' }}>BROKER PRO</div>
            </div>
          </div>
        </div>
        <nav style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
          {navItems.map(item => (
            <SidebarItem key={item.tab} icon={item.icon} label={item.label} active={activeTab === item.tab} onClick={() => setActiveTab(item.tab)} />
          ))}
        </nav>
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #0f766e, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><User size={15} color="white" /></div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.name || 'Môi giới'}</div>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.7rem' }}>Sale</div>
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
        <header style={{ height: 60, background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.75rem', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{navItems.find(n => n.tab === activeTab)?.label}</h2>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 1 }}>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #0f2a44, #0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={14} color="white" /></div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{currentUser?.name || 'Môi giới'}</span>
              <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>Sale</span>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* TAB 0: Tổng quan */}
          {activeTab === 0 && (
            <>
              <div style={{ background: 'linear-gradient(120deg, #0f2a44 0%, #0f766e 100%)', borderRadius: 14, padding: '1.5rem 2rem', color: 'white' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.2rem' }}>Chào mừng, {currentUser?.name?.split(' ').pop() || 'Môi giới'}! 👋</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.875rem' }}>
                  Bạn đang có <strong style={{ color: 'white' }}>{properties.length} tin đăng</strong> trên hệ thống.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <StatCard icon={FileText} label="Tổng tin đăng" value={properties.length} change="Tất cả" color="#0f766e" />
                <StatCard icon={TrendingUp} label="Lượt xem" value="1,248" change="+12% tuần này" color="#0891b2" />
                <StatCard icon={Users} label="Lead Khách hàng" value="86" change="+5 hôm nay" color="#f59e0b" />
                <StatCard icon={CheckCircle} label="Điểm Uy tín" value="95" change="Tuyệt vời" color="#16a34a" />
              </div>
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Tin đăng gần đây</h3>
                  <button onClick={() => setActiveTab(2)} style={{ background: 'none', border: 'none', color: '#0f766e', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Xem tất cả</button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ borderBottom: '1px solid #f1f5f9' }}>{['Tin đăng', 'Khu vực', 'Giá', 'Trạng thái'].map(h=><th key={h} style={{padding:'0.875rem 1.125rem',textAlign:'left',fontSize:'0.73rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.05em',background:'#fafafa'}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {properties.slice(0, 5).map((p, idx) => (
                      <tr key={p.id} style={{ borderBottom: idx < 4 ? '1px solid #f8fafc' : 'none' }}>
                        <td style={{ padding: '0.875rem 1.125rem', fontWeight: 600, color: '#0f172a' }}>{p.title}</td>
                        <td style={{ padding: '0.875rem 1.125rem', color: '#64748b', fontSize: '0.85rem' }}>{p.location}</td>
                        <td style={{ padding: '0.875rem 1.125rem', fontWeight: 700, color: '#0f766e' }}>{p.price}</td>
                        <td style={{ padding: '0.875rem 1.125rem' }}>
                          <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: statusBg[p.status], color: statusColor[p.status] }}>
                            {statusLabel[p.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {properties.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Chưa có tin đăng nào.</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* TAB 1: Đăng tin */}
          {activeTab === 1 && (
            <PostPropertyForm currentUser={currentUser} toast={toast} onSuccess={() => { fetchProperties(); setActiveTab(2); }} />
          )}

          {/* TAB 2: Quản lý tin đăng */}
          {activeTab === 2 && (
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Tất cả tin đăng của bạn</h3>
                <button onClick={() => setActiveTab(1)} style={{ background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                  <PlusCircle size={14} /> Thêm tin mới
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '1px solid #f1f5f9' }}>{['Mã tin', 'Tiêu đề', 'Khu vực', 'Mức giá', 'Trạng thái'].map(h=><th key={h} style={{padding:'0.875rem 1.125rem',textAlign:'left',fontSize:'0.73rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.05em',background:'#fafafa'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {properties.map((p, idx) => (
                    <tr key={p.id} style={{ borderBottom: idx < properties.length - 1 ? '1px solid #f8fafc' : 'none' }} onMouseOver={e => e.currentTarget.style.background = '#fafafa'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '0.875rem 1.125rem', fontSize: '0.8rem', color: '#94a3b8' }}>#{p.id.substring(0,6).toUpperCase()}</td>
                      <td style={{ padding: '0.875rem 1.125rem', fontWeight: 600, color: '#0f172a' }}>{p.title}</td>
                      <td style={{ padding: '0.875rem 1.125rem', color: '#64748b', fontSize: '0.85rem' }}>{p.location}</td>
                      <td style={{ padding: '0.875rem 1.125rem', fontWeight: 700, color: '#0f766e' }}>{p.price}</td>
                      <td style={{ padding: '0.875rem 1.125rem' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: statusBg[p.status], color: statusColor[p.status] }}>
                          {statusLabel[p.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {properties.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Bạn chưa có tin đăng nào. Hãy tạo tin mới!</td></tr>}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
