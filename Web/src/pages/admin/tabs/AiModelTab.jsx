import { useCallback, useEffect, useState } from 'react';
import { Activity, BrainCircuit, Database, RefreshCw, Sparkles, Target, TrendingUp } from 'lucide-react';
import { apiUrl } from '../../../services/api';

const formatMillion = value => value ? `${Number(value).toLocaleString('vi-VN')} triệu` : '—';

export default function AiModelTab() {
  const [market, setMarket] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadModelData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [marketResponse, recommendationResponse] = await Promise.all([
        fetch(apiUrl('ai/market-analysis'), { cache: 'no-store' }),
        fetch(apiUrl('ai/recommendations'), { cache: 'no-store' }),
      ]);
      const [marketResult, recommendationResult] = await Promise.all([marketResponse.json(), recommendationResponse.json()]);
      if (!marketResponse.ok || !marketResult.success) throw new Error(marketResult.message || 'Không thể tải dữ liệu mô hình.');
      setMarket(marketResult.data);
      setRecommendations(recommendationResult.success ? recommendationResult.data.recommendations || [] : []);
      setLastUpdated(new Date());
    } catch (err) { setError(err.message || 'Không thể kết nối máy chủ AI.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadModelData(); }, [loadModelData]);

  return <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
      <div><h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Mô hình AI</h2><p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '.82rem' }}>Theo dõi dữ liệu phân tích giá và đề xuất bất động sản.</p></div>
      <button onClick={loadModelData} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '.45rem', border: '1px solid #cbd5e1', borderRadius: 10, background: 'white', color: '#0f2a44', padding: '.65rem .85rem', fontWeight: 700, cursor: loading ? 'wait' : 'pointer' }}><RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Phân tích lại</button>
    </div>
    {error && <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', borderRadius: 10, padding: '.8rem 1rem', marginBottom: '1rem', fontSize: '.85rem' }}>{error}</div>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '.85rem', marginBottom: '1rem' }}>
      {[['Trạng thái', 'Đang hoạt động', Activity, '#0f766e'], ['Dữ liệu phân tích', market?.sampleSize ?? '—', Database, '#2563eb'], ['Giá trung bình', formatMillion(market?.averagePriceMillion), TrendingUp, '#d97706'], ['Đề xuất tốt nhất', recommendations[0] ? `${recommendations[0].recommendationScore}/100` : '—', Target, '#7c3aed']].map(([label, value, Icon, color]) => <div key={label} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem 1.1rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}><div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}16`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={18} color={color} /></div><div><small style={{ display: 'block', color: '#64748b', fontSize: '.72rem' }}>{label}</small><strong style={{ color: '#0f172a', fontSize: '1rem' }}>{loading ? '...' : value}</strong></div></div>)}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(280px,.85fr)', gap: '1rem' }}>
      <section style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.15rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.85rem' }}><BrainCircuit size={19} color="#0f766e" /><h3 style={{ margin: 0, fontSize: '.98rem' }}>Phân tích theo khu vực</h3></div>
        {market?.locations?.length ? market.locations.map(item => <div key={item.location} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '.75rem', alignItems: 'center', padding: '.75rem 0', borderTop: '1px solid #f1f5f9', fontSize: '.82rem' }}><strong style={{ color: '#0f2a44' }}>{item.location}</strong><span style={{ color: '#64748b' }}>{item.listings} tin</span><span style={{ color: '#0f766e', fontWeight: 800 }}>{formatMillion(item.averagePriceMillion)}</span></div>) : <p style={{ color: '#94a3b8', fontSize: '.85rem' }}>Chưa có dữ liệu đã duyệt.</p>}
        <p style={{ color: '#94a3b8', fontSize: '.72rem', lineHeight: 1.5, margin: '.8rem 0 0' }}>{market?.methodology}</p>
      </section>
      <section style={{ background: 'linear-gradient(145deg,#0f2a44,#0f766e)', color: 'white', borderRadius: 14, padding: '1.15rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.85rem' }}><Sparkles size={19} /><h3 style={{ margin: 0, fontSize: '.98rem' }}>Đề xuất nổi bật</h3></div>
        {recommendations.slice(0, 4).map(item => <div key={item.id} style={{ padding: '.7rem 0', borderTop: '1px solid rgba(255,255,255,.16)' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', fontSize: '.82rem' }}><strong>{item.title}</strong><b>{item.recommendationScore}</b></div><small style={{ opacity: .72 }}>{item.price} · {item.location}</small></div>)}
        {!recommendations.length && <p style={{ opacity: .75, fontSize: '.85rem' }}>Chưa đủ dữ liệu để đề xuất.</p>}
      </section>
    </div>
    {lastUpdated && <div style={{ color: '#94a3b8', fontSize: '.72rem', marginTop: '.8rem' }}>Cập nhật lúc {lastUpdated.toLocaleTimeString('vi-VN')}</div>}
    <style>{`@keyframes spin { to { transform: rotate(360deg); } } @media (max-width: 760px) { .dashboard-content > div > div[style*="minmax(0,1.15fr)"] { grid-template-columns: 1fr !important; } }`}</style>
  </div>;
}
