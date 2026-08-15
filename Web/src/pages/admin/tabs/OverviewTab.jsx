import { useMemo } from 'react';
import { Users, FileText, Home, TrendingUp } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '../../../components/DashboardShared';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="overview-chart-tooltip">
      <span>{label}</span>
      <strong>{payload[0].value} tin đăng</strong>
    </div>
  );
}


export default function OverviewTab({ stats, currentUser, pendingProperties, allProperties, metrics }) {
  const chartData = useMemo(() => {
    const properties = Array.isArray(allProperties) ? allProperties : [];
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: `T${date.getMonth() + 1}`,
        tinDang: 0,
      };
    });

    properties.forEach(property => {
      const createdAt = property.createdAt ? new Date(property.createdAt) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) return;
      const month = months.find(item => item.key === `${createdAt.getFullYear()}-${createdAt.getMonth()}`);
      if (month) month.tinDang += 1;
    });

    const typeNames = {
      apartment: 'Căn hộ', house: 'Nhà phố', villa: 'Biệt thự',
      land: 'Đất nền', shophouse: 'Shophouse',
    };
    const colors = ['#0f766e', '#0f2a44', '#f59e0b', '#0891b2', '#8b5cf6'];
    const counts = properties.reduce((result, property) => {
      const name = typeNames[property.propertyType] || 'Khác';
      result[name] = (result[name] || 0) + 1;
      return result;
    }, {});
    const total = properties.length;
    const types = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], index) => ({
        name,
        count,
        value: total ? Math.round((count / total) * 100) : 0,
        color: colors[index % colors.length],
      }));

    return {
      trend: months,
      types: types.length ? types : [{ name: 'Chưa có dữ liệu', count: 0, value: 0, color: '#cbd5e1' }],
      total,
    };
  }, [allProperties]);

  const propertyTypeData = chartData.types;

  return (
    <>
{/* TAB 0: Tổng quan */}
                        <div className="overview-welcome-banner" style={{ background: 'linear-gradient(120deg, #0f2a44 0%, #0f766e 100%)', borderRadius: 14, padding: '1.5rem 2rem', color: 'white' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.2rem' }}>Chào mừng, {currentUser?.name?.split(' ').pop() || 'Admin'}! 👋</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.875rem' }}>
                  <strong style={{ color: 'white' }}>{pendingProperties.length} tin đăng</strong> chờ phê duyệt · <strong style={{ color: 'white' }}>{metrics.totalSales || 0} nhân viên</strong> đang hoạt động
                </p>
              </div>
              <div className="dashboard-stats-grid overview-stats-grid">
                <StatCard icon={Users} label="Tổng số Sale" value={metrics.totalSales || 0} change="+2 tháng này" color="#0f766e" />
                <StatCard icon={FileText} label="Tin chờ duyệt" value={pendingProperties.length} change={pendingProperties.length === 0 ? 'Xong hết' : 'Cần xử lý'} up={pendingProperties.length === 0} color="#f59e0b" />
                <StatCard icon={Home} label="Tổng tin đăng" value={allProperties.length} change="Tất cả" color="#0f2a44" />
                <StatCard icon={TrendingUp} label="Giao dịch" value={metrics.successfulTransactions || 0} change="+12%" color="#0891b2" />
              </div>
              <div className="dashboard-charts-grid overview-charts-grid">
                <div className="overview-chart-card" style={{ background: 'white', borderRadius: 14, padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div><h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Xu hướng tin đăng</h3><p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>6 tháng gần nhất</p></div>
                    <span style={{ background: '#d8f3ef', color: '#0f766e', padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 }}>+23% ↑</span>
                  </div>
                  <ResponsiveContainer width="100%" height={190}>
                    <AreaChart data={chartData.trend} margin={{ top: 12, right: 10, left: -14, bottom: 0 }}>
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f766e" stopOpacity={0.3}/><stop offset="100%" stopColor="#0f766e" stopOpacity={0.015}/></linearGradient>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0f766e"/><stop offset="100%" stopColor="#19b5a5"/></linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="4 5" stroke="#e9f0f4"/>
                      <XAxis dataKey="month" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} dy={8}/>
                      <YAxis tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} dx={-4}/>
                      <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#7dd3c7', strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="tinDang" name="Tin đăng" stroke="url(#lineGradient)" strokeWidth={3} fill="url(#g1)" dot={{ r: 4, fill: '#fff', stroke: '#0f766e', strokeWidth: 2 }} activeDot={{ r: 7, fill: '#0f766e', stroke: '#d8f3ef', strokeWidth: 5 }} animationDuration={1300} animationEasing="ease-out"/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="overview-chart-card overview-type-card" style={{ background: 'white', borderRadius: 14, padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '0.95rem' }}>Loại BĐS</h3>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={propertyTypeData} cx="50%" cy="50%" innerRadius={47} outerRadius={76} paddingAngle={4} cornerRadius={5} dataKey="value" stroke="none" animationDuration={1200} animationBegin={150}>
                        {propertyTypeData.map((e,i)=><Cell key={i} fill={e.color} className="overview-pie-cell" />)}
                      </Pie>
                      <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="overview-donut-total">{chartData.total}</text>
                      <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="overview-donut-label">Tổng tin đăng</text>
                      <Tooltip formatter={(value, name, item) => item.payload.count ? [`${item.payload.count} tin (${value}%)`, item.payload.name] : ['Chưa có dữ liệu', 'Loại BĐS']} contentStyle={{borderRadius:12,border:'1px solid #e2e8f0',boxShadow:'0 8px 24px rgba(15,42,68,.12)'}}/>
                    </PieChart>
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
