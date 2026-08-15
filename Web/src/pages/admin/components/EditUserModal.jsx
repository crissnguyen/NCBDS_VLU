import { useState } from 'react';
import { X, Mail, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { LabeledField, IS } from '../../../components/DashboardShared';
import { apiUrl } from '../../../services/api';

export default function EditUserModal({ user, onClose, onSuccess, toast }) {
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpStatus, setOtpStatus] = useState(null);

  const isEmailChanged = form.email.trim().toLowerCase() !== user.email.trim().toLowerCase();

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (e.target.name === 'email') setOtpStatus(null);
  };

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
    setOtpStatus(null);
    try {
      const res = await fetch(apiUrl('auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
      const result = await res.json();
      if (result.success) {
        const msg = `Đã gửi OTP/Link đặt lại mật khẩu đến "${form.email}".`;
        setOtpStatus({ type: 'success', message: msg });
        if (toast?.success) toast.success('Đã gửi yêu cầu', msg);
      } else {
        const msg = result.message || 'Gửi yêu cầu OTP thất bại.';
        setOtpStatus({ type: 'error', message: msg });
        if (toast?.error) toast.error('Gửi thất bại', msg);
      }
    } catch {
      const msg = 'Không thể gửi yêu cầu đặt lại mật khẩu do lỗi kết nối.';
      setOtpStatus({ type: 'error', message: msg });
      if (toast?.error) toast.error('Lỗi kết nối', msg);
    } finally {
      setSendingOTP(false);
    }
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 9999, 
        background: 'rgba(15, 23, 42, 0.45)', 
        backdropFilter: 'blur(8px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '1.25rem',
        animation: 'backdropFadeIn 0.3s ease-out'
      }}
    >
      {/* Custom CSS for Edit Modal */}
      <style>{`
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleUp {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .edit-modal-card {
          animation: modalScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .edit-input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 12px !important;
          border: 1px solid #e2e8f0 !important;
          background: #f8fafc;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s ease;
        }
        .edit-input-field:focus {
          border-color: #0f766e !important;
          background: white;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1) !important;
        }
        .otp-box-card {
          border: 1px solid #e0f2fe;
          border-radius: 16px;
          padding: 1.15rem;
          background: #f0f9ff;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          transition: all 0.2s ease;
        }
        .otp-send-btn {
          align-self: flex-start;
          padding: 0.6rem 1.15rem;
          border-radius: 10px;
          border: none;
          background: #0284c7;
          color: white;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 10px rgba(2, 132, 199, 0.15);
        }
        .otp-send-btn:hover:not(:disabled) {
          background: #0369a1;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
        }
        .otp-send-btn:disabled {
          background: #cbd5e1;
          color: #94a3b8;
          box-shadow: none;
          cursor: not-allowed;
        }
        .edit-btn-cancel {
          background: white;
          color: #475569;
          border: 1px solid #e2e8f0;
          padding: 0.65rem 1.35rem;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }
        .edit-btn-cancel:hover {
          background: #f8fafc;
          color: #1e293b;
        }
        .edit-btn-save {
          background: linear-gradient(135deg, #0f766e, #0d9488);
          color: white;
          border: none;
          padding: 0.65rem 1.5rem;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(15, 118, 110, 0.2);
        }
        .edit-btn-save:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(15, 118, 110, 0.35);
          filter: brightness(1.05);
        }
        .edit-btn-save:disabled {
          background: #cbd5e1;
          box-shadow: none;
          cursor: not-allowed;
        }
      `}</style>

      <div 
        className="edit-modal-card"
        style={{ 
          background: 'white', 
          borderRadius: 24, 
          padding: '2rem', 
          width: 480, 
          maxWidth: '100%',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25)', 
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>Sửa thông tin tài khoản</h3>
            <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>Thay đổi tên hoặc email của thành viên hệ thống</p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              width: 32, 
              height: 32, 
              borderRadius: '50%', 
              border: 'none', 
              background: '#f1f5f9', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
          >
            <X size={16} color="#64748b" />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <LabeledField label="Họ và tên" required>
            <input 
              name="name" 
              className="edit-input-field" 
              value={form.name} 
              onChange={handleChange} 
              placeholder="VD: Nguyễn Văn A" 
            />
          </LabeledField>
          
          <LabeledField label="Địa chỉ Email mới" required>
            <input 
              name="email" 
              type="email" 
              className="edit-input-field" 
              value={form.email} 
              onChange={handleChange} 
              placeholder="VD: user@estateai.vn" 
            />
          </LabeledField>

          {/* OTP Reset Section */}
          <div className="otp-box-card">
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={14} color="#0284c7" />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Gửi OTP đổi mật khẩu</span>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
                  {isEmailChanged 
                    ? 'Bạn vừa thay đổi email của tài khoản này. Khuyên dùng gửi OTP để chủ tài khoản thiết lập lại mật khẩu mới.'
                    : 'Gửi yêu cầu thiết lập mật khẩu mới đến email này.'}
                </p>
              </div>
            </div>

            {/* OTP Status Banner Feedback */}
            {otpStatus && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 10,
                fontSize: '0.78rem',
                fontWeight: 600,
                background: otpStatus.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: otpStatus.type === 'success' ? '#15803d' : '#b91c1c',
                border: otpStatus.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fca5a5',
                lineHeight: 1.4
              }}>
                {otpStatus.type === 'success' ? <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> : <AlertCircle size={16} style={{ flexShrink: 0 }} />}
                <span>{otpStatus.message}</span>
              </div>
            )}

            <button 
              className="otp-send-btn"
              type="button" 
              onClick={handleSendResetOTP}
              disabled={sendingOTP}
            >
              {sendingOTP ? '⏳ Đang gửi OTP...' : '✉ Gửi OTP đặt lại mật khẩu'}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
          <button className="edit-btn-cancel" onClick={onClose}>Hủy</button>
          <button 
            className="edit-btn-save" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}

