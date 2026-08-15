import { useState } from 'react';
import { ArrowRight, ArrowLeft, Building2, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { Field } from '../../components/ui';
import { apiUrl } from '../../services/api';

export default function Register({ setCurrentPage }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(apiUrl('auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.requireVerification) {
          setSuccess('Đăng ký thành công! Đang chuyển hướng đến trang xác thực...');
          localStorage.setItem('verifyEmail', data.email || email);
          setTimeout(() => {
            setCurrentPage('verify');
          }, 1500);
        } else {
          setSuccess('Đăng ký thành công! Đang chuyển hướng...');
          setTimeout(() => {
            setCurrentPage('login');
          }, 1500);
        }
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-copy">
          <span className="eyebrow">Trở thành thành viên</span>
          <h1>Tham gia cộng đồng EstateAI.</h1>
          <p>Tìm kiếm, lưu trữ và theo dõi các bất động sản phù hợp nhất với nhu cầu của bạn nhờ sự hỗ trợ của AI.</p>
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
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Đăng ký</h2>
            <p style={{ color: 'var(--text-muted)' }}>Tạo tài khoản mới để trải nghiệm đầy đủ tính năng.</p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <Field label="Họ và tên">
              <div className="input-with-icon" style={{ borderRadius: '12px' }}>
                <User size={19} />
                <input
                  type="text"
                  placeholder="Nhập họ và tên"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
            </Field>

            <Field label="Địa chỉ email">
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

            <Field label="Mật khẩu">
              <div className="input-with-icon" style={{ borderRadius: '12px' }}>
                <Lock size={19} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
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

            <Field label="Xác nhận mật khẩu">
              <div className="input-with-icon" style={{ borderRadius: '12px' }}>
                <Lock size={19} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle-btn"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center', marginTop: '0.5rem' }}>
                {error}
              </div>
            )}
            
            {success && (
              <div style={{ color: 'var(--primary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '0.5rem' }}>
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
                <>Đăng ký <ArrowRight size={18} /></>
              )}
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>Đã có tài khoản?</span>
              <button 
                type="button" 
                style={{ padding: 0, background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setCurrentPage('login')}
              >
                Đăng nhập
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
