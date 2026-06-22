import { useState } from 'react';
import { ArrowRight, Building2, Lock, Mail } from 'lucide-react';
import { Field } from '../components/ui';

export default function Login({ setUserRole, setCurrentUser, setCurrentPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
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
        setCurrentPage(data.user.role === 'admin' ? 'admin_dashboard' : 'dashboard');
      } else {
        setError(data.message || 'Đăng nhập thất bại');
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

            <Field label="Mật khẩu">
              <div className="input-with-icon" style={{ borderRadius: '12px' }}>
                <Lock size={19} />
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </Field>


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
                <>Vào dashboard <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
