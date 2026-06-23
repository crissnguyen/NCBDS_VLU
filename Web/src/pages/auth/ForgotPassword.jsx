import { useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, Mail } from 'lucide-react';
import { Field } from '../../components/ui';
import { apiUrl } from '../../services/api';

export default function ForgotPassword({ setCurrentPage }) {
  const [email, setEmail] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
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
        setSuccess(data.message || 'Yêu cầu khôi phục mật khẩu đã được gửi.');
        setEmail('');
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
          <button 
            type="button"
            style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: '0', marginBottom: '2rem', color: 'var(--text-muted)', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem' }}
            onClick={() => setCurrentPage('login')}
          >
            <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Quay lại đăng nhập
          </button>

          <div style={{ marginBottom: '1.5rem' }}>
            <div className="brand-icon" style={{ marginBottom: '1.5rem', width: '48px', height: '48px', borderRadius: '12px' }}><Building2 size={24} /></div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Quên mật khẩu</h2>
            <p style={{ color: 'var(--text-muted)' }}>Chúng tôi sẽ gửi hướng dẫn khôi phục qua email.</p>
          </div>

          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <Field label="Địa chỉ email đã đăng ký">
              <div className="input-with-icon" style={{ borderRadius: '12px' }}>
                <Mail size={19} />
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </Field>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center', marginTop: '0.5rem' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ color: 'var(--primary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '0.5rem', lineHeight: '1.5' }}>
                {success}
              </div>
            )}

            <button 
              className="btn btn-primary" 
              type="submit" 
              disabled={isLoading}
              style={{ width: '100%', marginTop: '1rem', padding: '1rem', borderRadius: '12px', fontSize: '1rem', boxShadow: '0 8px 24px rgba(15, 118, 110, 0.25)', opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? 'Đang xử lý...' : (
                <>Gửi liên kết khôi phục <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
