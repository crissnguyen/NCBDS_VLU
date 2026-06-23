import { useState } from 'react';
import { UserCircle2, Mail, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { Field } from '../components/ui';

export default function Profile({ currentUser, setCurrentPage, setCurrentUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: currentUser?.name || '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!currentUser) return null;

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Tên không được để trống');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('https://ncbds-vlu.onrender.com/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          name: form.name,
          password: form.password || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('Cập nhật hồ sơ thành công!');
        setCurrentUser(data.user);
        setIsEditing(false);
        setForm(p => ({ ...p, password: '' })); // clear password field
      } else {
        setError(data.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      console.error(err);
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ minHeight: '80vh', paddingBottom: '4rem', paddingTop: '8rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <section style={{ width: '100%', maxWidth: '700px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <span className="eyebrow">Hồ sơ cá nhân</span>
          <h1 style={{ fontSize: '2.5rem', margin: '0' }}>Thông tin tài khoản</h1>
          <p style={{ margin: '0', color: 'var(--text-muted)' }}>Quản lý thông tin và thiết lập tài khoản của bạn trên hệ thống.</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <UserCircle2 size={44} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', fontWeight: 700 }}>{currentUser.name || 'Người dùng mới'}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={16} /> {currentUser.email}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={16} /> Vai trò: <strong style={{ color: 'var(--text-main)' }}>{currentUser.role === 'admin' ? 'Quản trị viên' : (currentUser.role === 'sale' ? 'Môi giới' : 'Khách hàng')}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', fontWeight: 600 }}>Chi tiết thông tin</h3>
            
            {success && <div style={{ color: '#16a34a', background: '#f0fdf4', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #bbf7d0' }}>{success}</div>}
            {error && <div style={{ color: '#dc2626', background: '#fef2f2', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #fecaca' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <Field label="Họ và tên">
                <input 
                  type="text" 
                  name="name"
                  value={isEditing ? form.name : (currentUser.name || '')} 
                  onChange={handleChange}
                  disabled={!isEditing} 
                  style={{ background: isEditing ? 'white' : '#f8fafc', color: '#334155', fontWeight: 500, outline: isEditing ? '1px solid var(--primary)' : 'none' }} 
                />
              </Field>
              <Field label="Địa chỉ Email">
                <input type="email" value={currentUser.email} disabled style={{ background: '#f8fafc', color: '#94a3b8', fontWeight: 500 }} title="Không thể thay đổi email" />
              </Field>
              
              {isEditing ? (
                <Field label="Đổi mật khẩu (Bỏ trống nếu giữ nguyên)">
                  <input 
                    type="password" 
                    name="password"
                    value={form.password} 
                    onChange={handleChange}
                    placeholder="Mật khẩu mới..."
                    style={{ background: 'white', color: '#334155', fontWeight: 500, outline: '1px solid var(--primary)' }} 
                  />
                </Field>
              ) : (
                <>
                  <Field label="Quyền hạn">
                    <input type="text" value={currentUser.role === 'admin' ? 'Quản trị viên' : (currentUser.role === 'sale' ? 'Môi giới' : 'Khách hàng')} disabled style={{ background: '#f8fafc', color: '#334155', fontWeight: 500 }} />
                  </Field>
                  <Field label="Trạng thái tài khoản">
                    <input type="text" value={currentUser.status || 'Đang hoạt động'} disabled style={{ background: '#f8fafc', color: '#166534', fontWeight: 600 }} />
                  </Field>
                </>
              )}
            </div>

            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
              {isEditing ? (
                <>
                  <button className="btn btn-ghost" onClick={() => { setIsEditing(false); setForm({ name: currentUser.name, password: '' }); setError(''); setSuccess(''); }}>Hủy bỏ</button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => setIsEditing(true)} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', fontSize: '0.95rem' }}>
                  Cập nhật thông tin
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
