import { useState, useEffect } from 'react';
import { Award, Calendar, Eye, Sparkles, Users } from 'lucide-react';
import { MetricCard, SidebarNav } from '../components/ui';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/api/properties')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Chỉ lấy 5 tin mới nhất
          setProperties(data.slice(0, 5));
        }
      })
      .catch(err => console.error(err));
  }, []);

  const metrics = [
    { label: 'Lượt xem tin', value: '12.480', change: '+18% tuần này', icon: Eye, tone: 'blue' },
    { label: 'Lead mới', value: '86', change: '23 lead chất lượng cao', icon: Users, tone: 'green' },
    { label: 'Lịch xem nhà', value: '14', change: '5 lịch cuối tuần', icon: Calendar, tone: 'orange' },
    { label: 'Điểm uy tín', value: '94/100', change: 'Đã xác minh', icon: Award, tone: 'green' },
  ];

  return (
    <main className="app-layout">
      <SidebarNav
        title="Broker Pro"
        items={['Tổng quan', 'Tin đăng', 'Lead khách hàng', 'Lịch xem nhà', 'Broker Copilot', 'Hiệu quả tin', 'Gói dịch vụ']}
      />

      <section className="dashboard-main">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Dashboard</span>
            <h1>Tổng quan môi giới</h1>
            <p>Quản lý hiệu quả tin đăng, lead và lịch xem nhà trong cùng một nơi.</p>
          </div>
          <button className="btn btn-primary">Đăng tin mới</button>
        </div>

        <div className="metric-grid">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        <div className="dashboard-grid">
          <section className="table-panel">
            <div className="table-panel__header">
              <h3>Tin đăng đang hoạt động ({properties.length})</h3>
              <button className="btn btn-ghost">Xem tất cả</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Tin</th>
                  <th>Khu vực</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {properties.length > 0 ? (
                  properties.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.title}</td>
                      <td>{p.location}</td>
                      <td style={{ fontWeight: 600, color: '#0f766e' }}>{p.price}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: 20, 
                          fontSize: '0.75rem', 
                          fontWeight: 700,
                          background: p.status === 'Approved' ? '#dcfce7' : (p.status === 'Pending' ? '#fef08a' : '#fee2e2'),
                          color: p.status === 'Approved' ? '#166534' : (p.status === 'Pending' ? '#854d0e' : '#991b1b')
                        }}>
                          {p.status === 'Approved' ? 'Đã duyệt' : (p.status === 'Pending' ? 'Chờ duyệt' : 'Từ chối')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Chưa có tin đăng nào.</td></tr>
                )}
              </tbody>
            </table>
          </section>

          <aside className="side-panel">
            <span className="eyebrow"><Sparkles size={14} /> Broker Copilot</span>
            <h3 style={{ marginBottom: '0.75rem' }}>AI gợi ý tối ưu hôm nay</h3>
            <p style={{ marginBottom: '1rem' }}>Tin “Nhà phố Phước Hải” có lượt xem cao nhưng ít liên hệ. Nên bổ sung ảnh mặt tiền, giảm tiêu đề quảng cáo và thêm thông tin pháp lý.</p>
            <button className="btn btn-primary" style={{ width: '100%' }}>Tối ưu bằng AI</button>
          </aside>
        </div>
      </section>
    </main>
  );
}
