import { useState, useEffect } from 'react';
import { ArrowRight, Building2, Lock } from 'lucide-react';
import { Field } from '../../components/ui';

export default function ResetPassword({ setCurrentPage }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlEmail = params.get('email');
    
    if (urlToken && urlEmail) {
      setToken(urlToken);
      setEmail(urlEmail);
    } else {
      setError('Đường dẫn không hợp lệ hoặc đã thiếu thông tin khôi phục.');
    }
  }, []);

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!token || !email) {
      setError('Không tìm thấy mã xác thực. Vui lòng quay lại email và nhấn lại vào link.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://ncbds-vlu.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email, newPassword: password }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.');
        setTimeout(() => {
          // Xóa pathname để trở về bình thường
          window.history.replaceState({}, document.title, "/");
          setCurrentPage('login');
        }, 2500);
      } else {
        setError(data.message || 'Thao tác thất bại');
      }
    } catch (err) {
      console.error('Reset password error:', err);
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
          <p>Thiết lập một mật khẩu mới mạnh mẽ để bảo vệ tài khoản của bạn.</p>
        </div>
      </section>

      <section className="login-card">
        <div className="login-card-inner">
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="brand-icon" style={{ marginBottom: '1.5rem', width: '48px', height: '48px', borderRadius: '12px' }}><Building2 size={24} /></div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Tạo mật khẩu mới</h2>
            <p style={{ color: 'var(--text-muted)' }}>Mật khẩu mới của bạn cần tối thiểu 6 ký tự.</p>
          </div>

          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <Field label="Mật khẩu mới">
              <div className="input-with-icon" style={{ borderRadius: '12px' }}>
                <Lock size={19} />
                <input
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </Field>

            <Field label="Xác nhận mật khẩu mới">
              <div className="input-with-icon" style={{ borderRadius: '12px' }}>
                <Lock size={19} />
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={6}
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
              disabled={isLoading || !token}
              style={{ width: '100%', marginTop: '1rem', padding: '1rem', borderRadius: '12px', fontSize: '1rem', boxShadow: '0 8px 24px rgba(15, 118, 110, 0.25)', opacity: (isLoading || !token) ? 0.7 : 1 }}
            >
              {isLoading ? 'Đang xử lý...' : (
                <>Lưu mật khẩu mới <ArrowRight size={18} /></>
              )}
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
              <button 
                type="button" 
                style={{ padding: 0, background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 500, cursor: 'pointer' }}
                onClick={() => {
                  window.history.replaceState({}, document.title, "/");
                  setCurrentPage('login');
                }}
              >
                Quay lại trang Đăng nhập
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
