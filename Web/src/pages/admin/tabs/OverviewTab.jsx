import { Users, FileText, Home, TrendingUp } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '../../../components/DashboardShared';

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


export default function OverviewTab({ stats, currentUser, pendingProperties, allProperties, metrics }) {

  return (
    <>
{/* TAB 0: Tổng quan */}
                        <div style={{ background: 'linear-gradient(120deg, #0f2a44 0%, #0f766e 100%)', borderRadius: 14, padding: '1.5rem 2rem', color: 'white' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.2rem' }}>Chào mừng, {currentUser?.name?.split(' ').pop() || 'Admin'}! 👋</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.875rem' }}>
                  <strong style={{ color: 'white' }}>{pendingProperties.length} tin đăng</strong> chờ phê duyệt · <strong style={{ color: 'white' }}>{metrics.totalSales || 0} nhân viên</strong> đang hoạt động
                </p>
              </div>
              <div className="dashboard-stats-grid">
                <StatCard icon={Users} label="Tổng số Sale" value={metrics.totalSales || 0} change="+2 tháng này" color="#0f766e" />
                <StatCard icon={FileText} label="Tin chờ duyệt" value={pendingProperties.length} change={pendingProperties.length === 0 ? 'Xong hết' : 'Cần xử lý'} up={pendingProperties.length === 0} color="#f59e0b" />
                <StatCard icon={Home} label="Tổng tin đăng" value={allProperties.length} change="Tất cả" color="#0f2a44" />
                <StatCard icon={TrendingUp} label="Giao dịch" value={metrics.successfulTransactions || 0} change="+12%" color="#0891b2" />
              </div>
              <div className="dashboard-charts-grid">
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
  );
}