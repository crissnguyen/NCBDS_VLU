import { useEffect, useState } from 'react';
import { Check, Mail, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import { apiUrl } from '../../../services/api';

const items = [
  { key: 'emailNotifications', title: 'Thông báo email tự động', desc: 'Gửi email khi có tin đăng mới hoặc cần phê duyệt', icon: Mail },
  { key: 'autoApproveHighPerformingSales', title: 'Phê duyệt tự động (Sale hiệu suất cao)', desc: 'Tự động duyệt tin từ Sale có hiệu suất > 90%', icon: ShieldCheck },
  { key: 'aiPriceAnalysis', title: 'AI Copilot phân tích giá', desc: 'Gợi ý giá thị trường hợp lý dựa trên AI', icon: Sparkles },
  { key: 'maintenanceMode', title: 'Chế độ bảo trì', desc: 'Tạm thời ẩn website khỏi người dùng thông thường', icon: Wrench },
];

export default function SettingsTab() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch(apiUrl('admin/settings'), { cache: 'no-store' })
      .then(res => res.json())
      .then(result => { if (active && result.success) setSettings(result.data); else if (active) setError(result.message || 'Không thể tải cài đặt.'); })
      .catch(() => { if (active) setError('Không thể kết nối máy chủ.'); });
    return () => { active = false; };
  }, []);

  const toggle = async key => {
    if (!settings || saving) return;
    const next = !settings[key];
    setSaving(key); setError(''); setSettings(current => ({ ...current, [key]: next }));
    try {
      const res = await fetch(apiUrl('admin/settings'), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [key]: next }) });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Không thể lưu cài đặt.');
      setSettings(result.data);
    } catch (err) {
      setSettings(current => ({ ...current, [key]: !next }));
      setError(err.message || 'Không thể lưu cài đặt.');
    } finally { setSaving(''); }
  };

  return <div>
    <div style={{ marginBottom: '1.1rem' }}><h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Cài đặt hệ thống</h2><p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>Các thay đổi được lưu trực tiếp trên máy chủ.</p></div>
    {error && <div style={{ background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
    {items.map(({ key, title, desc, icon: Icon }) => {
      const enabled = Boolean(settings?.[key]);
      return <div key={key} style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '1.1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', opacity: settings ? 1 : 0.65 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}><div style={{ width: 38, height: 38, borderRadius: 10, background: enabled ? '#e6fffb' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={18} color={enabled ? '#0f766e' : '#64748b'} /></div><div><div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: 3 }}>{title}</div><div style={{ fontSize: '0.8rem', color: '#64748b' }}>{desc}</div></div></div>
        <button type="button" aria-label={`${enabled ? 'Tắt' : 'Bật'} ${title}`} disabled={!settings || Boolean(saving)} onClick={() => toggle(key)} style={{ width: 50, height: 28, border: 0, borderRadius: 15, background: enabled ? '#0f766e' : '#e2e8f0', position: 'relative', cursor: settings && !saving ? 'pointer' : 'wait', flexShrink: 0, transition: 'background 0.2s' }}><span style={{ position: 'absolute', top: 3, left: enabled ? 25 : 3, width: 22, height: 22, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{enabled && <Check size={13} color="#0f766e" />}</span></button>
      </div>;
    })}
  </div>;
}
