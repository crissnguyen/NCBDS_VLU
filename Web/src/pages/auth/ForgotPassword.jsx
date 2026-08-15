import { useState } from 'react';
import { ArrowLeft, Building2, Mail, CheckCircle2, RefreshCw } from 'lucide-react';
import { Field } from '../../components/ui';
import { apiUrl } from '../../services/api';

export default function ForgotPassword({ setCurrentPage }) {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl('auth/forgot-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmittedEmail(email);
        setIsSubmitted(true);
      } else {
        setError(data.message || 'Yêu cầu thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-copy">
          <span className="eyebrow">Bảo mật tài khoản</span>
          <h1>Khôi phục quyền truy cập.</h1>
          <p>Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu an toàn.</p>
        </div>
      </section>

      <section className="login-card">
        <div className="login-card-inner">
          {/* Back Button */}
          <button 
            type="button"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              background: '#f1f5f9', 
              color: '#334155', 
              border: 'none', 
              padding: '0.45rem 0.9rem', 
              borderRadius: '20px', 
              fontSize: '0.85rem', 
              fontWeight: 600, 
              cursor: 'pointer', 
              marginBottom: '1.5rem',
              transition: 'all 0.15s ease' 
            }}
            onClick={() => setCurrentPage('login')}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
          >
            <ArrowLeft size={16} /> Quay lại đăng nhập
          </button>

          {isSubmitted ? (
            /* Dedicated Success Mail Sent Notification UI */
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ 
                width: 72, 
                height: 72, 
                borderRadius: '50%', 
                background: '#ccfbf1', 
                color: '#0f766e', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1.25rem',
                boxShadow: '0 8px 24px rgba(15, 118, 110, 0.15)'
              }}>
                <CheckCircle2 size={40} />
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f2a44', marginBottom: '0.5rem' }}>
                Đã gửi email khôi phục!
              </h2>

              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                Chúng tôi đã gửi liên kết đặt lại mật khẩu đến địa chỉ email:
              </p>

              <div style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                padding: '0.85rem 1.25rem', 
                borderRadius: 12, 
                color: '#0f766e', 
                fontWeight: 700, 
                fontSize: '1rem',
                wordBreak: 'break-all',
                marginBottom: '1.5rem'
              }}>
                {submittedEmail}
              </div>

              <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.5', marginBottom: '2rem' }}>
                Vui lòng kiểm tra hộp thư của bạn (bao gồm cả thư mục <strong>Spam / Thư rác</strong> nếu không thấy trong Hộp thư đến).
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={() => setCurrentPage('login')}
                  className="btn btn-primary"
                  style={{ 
                    width: '100%', 
                    padding: '0.9rem', 
                    borderRadius: '12px', 
                    fontSize: '0.95rem', 
                    fontWeight: 700,
                    boxShadow: '0 8px 24px rgba(15, 118, 110, 0.25)',
                    cursor: 'pointer'
                  }}
                >
                  Quay lại Đăng nhập ngay
                </button>

                <button
                  onClick={() => setIsSubmitted(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem'
                  }}
                >
                  <RefreshCw size={14} /> Thử lại với địa chỉ email khác
                </button>
              </div>
            </div>
          ) : (
            /* Forgot Password Form */
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="brand-icon" style={{ marginBottom: '1.25rem', width: '48px', height: '48px', borderRadius: '12px' }}>
                  <Building2 size={24} />
                </div>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800, color: '#0f2a44' }}>Quên mật khẩu</h2>
                <p style={{ color: 'var(--text-muted)' }}>Chúng tôi sẽ gửi hướng dẫn khôi phục qua email.</p>
              </div>

              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                <Field label="Địa chỉ email đã đăng ký">
                  <div className="input-with-icon" style={{ borderRadius: '12px' }}>
                    <Mail size={19} />
                    <input
                      type="email"
                      placeholder="Nhập email của bạn (vd: email@domain.com)"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                </Field>

                {error && (
                  <div style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.6rem 0.85rem', borderRadius: 8, fontSize: '0.85rem', textAlign: 'center' }}>
                    {error}
                  </div>
                )}

                <button 
                  className="btn btn-primary" 
                  type="submit" 
                  disabled={isLoading}
                  style={{ width: '100%', marginTop: '0.5rem', padding: '0.9rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, boxShadow: '0 8px 24px rgba(15, 118, 110, 0.25)', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
