import { useState } from 'react';
import { ArrowRight, ArrowLeft, Building2, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Field } from '../../components/ui';
import { apiUrl } from '../../services/api';

export default function Login({ setUserRole, setCurrentUser, setCurrentPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl('auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUserRole(data.user.role);
        if (setCurrentUser) setCurrentUser(data.user);
        if (data.user.role === 'admin') {
          setCurrentPage('admin_dashboard');
        } else if (data.user.role === 'sale') {
          setCurrentPage('dashboard');
        } else {
          setCurrentPage('home');
        }
      } else {
        if (data.requireVerification) {
          localStorage.setItem('verifyEmail', data.email || email);
          setCurrentPage('verify');
        } else {
          setError(data.message || 'Đăng nhập thất bại');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-copy">
          <span className="eyebrow">EstateAI workspace</span>
          <h1>Không gian làm việc rõ ràng cho môi giới và quản trị.</h1>
          <p>Sale tập trung vào tin đăng, lead và lịch xem nhà. Admin tập trung vào nhân sự, phê duyệt và chất lượng hệ thống.</p>
        </div>
      </section>

      <section className="login-card">
        <div className="login-card-inner">
          <button
            type="button"
            onClick={() => setCurrentPage('home')}
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
              marginBottom: '1.25rem',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
          >
            <ArrowLeft size={16} /> Quay lại trang chủ
          </button>

          <div style={{ marginBottom: '1.5rem' }}>
            <div className="brand-icon" style={{ marginBottom: '1.5rem', width: '48px', height: '48px', borderRadius: '12px' }}><Building2 size={24} /></div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Đăng nhập</h2>
            <p style={{ color: 'var(--text-muted)' }}>Hệ thống sẽ tự động nhận diện vai trò của bạn dựa trên tài khoản.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Field label="Địa chỉ email">
              <div className="input-with-icon" style={{ borderRadius: '12px' }}>
                <Mail size={19} />
                <input
                  type="email"
                  placeholder="Nhập email của bạn (vd: admin@estateai.vn)"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </Field>

            <div style={{ position: 'relative' }}>
              <Field label="Mật khẩu">
                <div className="input-with-icon" style={{ borderRadius: '12px' }}>
                  <Lock size={19} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Field>
              <button 
                type="button" 
                style={{ position: 'absolute', top: 0, right: 0, padding: 0, background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}
                onClick={() => setCurrentPage('forgot_password')}
              >
                Quên mật khẩu?
              </button>
            </div>


            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center', marginTop: '0.5rem' }}>
                {error}
              </div>
            )}

            <button 
              className="btn btn-primary" 
              type="submit" 
              disabled={isLoading}
              style={{ width: '100%', marginTop: '1rem', padding: '1rem', borderRadius: '12px', fontSize: '1rem', boxShadow: '0 8px 24px rgba(15, 118, 110, 0.25)', opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? 'Đang xử lý...' : (
                <>Đăng nhập <ArrowRight size={18} /></>
              )}
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>Chưa có tài khoản?</span>
              <button 
                type="button" 
                style={{ padding: 0, background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setCurrentPage('register')}
              >
                Đăng ký ngay
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
