import { useState } from 'react';
import { X, Mail, ShieldAlert } from 'lucide-react';
import { LabeledField, IS } from '../../../components/DashboardShared';
import { apiUrl } from '../../../services/api';

export default function EditUserModal({ user, onClose, onSuccess, toast }) {
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);

  const isEmailChanged = form.email.trim().toLowerCase() !== user.email.trim().toLowerCase();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      toast.warning('Thiếu thông tin', 'Vui lòng điền đủ Tên và Email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`admin/users/${user.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Cập nhật thành công', `Tài khoản "${form.name}" đã được cập nhật.`);
        onSuccess(result.data || { ...user, ...form });
        onClose();
      } else {
        toast.error('Cập nhật thất bại', result.message);
      }
    } catch {
      // Hỗ trợ local mode nếu API fail hoặc đang chạy offline
      toast.warning('Offline Mode', 'Đã lưu thông tin tài khoản tạm thời ở local.');
      onSuccess({ ...user, ...form });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOTP = async () => {
    setSendingOTP(true);
    try {
      const res = await fetch(apiUrl('auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Đã gửi yêu cầu', `Mã OTP/Link thiết lập mật khẩu mới đã được gửi tới email "${form.email}".`);
      } else {
        toast.error('Gửi thất bại', result.message);
      }
    } catch {
      toast.error('Lỗi kết nối', 'Không thể gửi yêu cầu đặt lại mật khẩu.');
    } finally {
      setSendingOTP(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '2rem', width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'fadeInScale 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>Sửa thông tin tài khoản</h3>
            <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>Thay đổi tên hoặc email của thành viên hệ thống</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#64748b" /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <LabeledField label="Họ và tên" required>
            <input name="name" value={form.name} onChange={handleChange} placeholder="VD: Nguyễn Văn A" style={IS} />
          </LabeledField>
          <LabeledField label="Địa chỉ Email mới" required>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="VD: user@estateai.vn" style={IS} />
          </LabeledField>

          {/* Gửi OTP đổi mật khẩu mới */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <Mail size={16} color="#0f766e" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Gửi OTP đổi mật khẩu</span>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
                  {isEmailChanged 
                    ? 'Bạn vừa thay đổi email của tài khoản này. Khuyên dùng gửi OTP để chủ tài khoản thiết lập lại mật khẩu mới.'
                    : 'Gửi yêu cầu thiết lập mật khẩu mới đến email này.'}
                </p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={handleSendResetOTP}
              disabled={sendingOTP}
              style={{
                alignSelf: 'flex-start',
                padding: '0.5rem 1rem',
                borderRadius: 8,
                border: 'none',
                background: '#e0f2fe',
                color: '#0369a1',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: sendingOTP ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              {sendingOTP ? 'Đang gửi...' : '✉ Gửi OTP đặt lại mật khẩu'}
            </button>
          </div>
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
