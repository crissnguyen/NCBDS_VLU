import { useState, useRef, useEffect } from 'react';
import { Building2, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

export default function VerifyAccount({ setCurrentPage, userEmail }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    // Chỉ cho phép nhập số
    if (value && !/^[0-9]+$/.test(value)) return;

    const newCode = [...code];
    // Nếu dán toàn bộ chuỗi 6 số
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split('');
      for (let i = 0; i < pastedCode.length; i++) {
        newCode[i] = pastedCode[i];
      }
      setCode(newCode);
      const nextEmptyIndex = newCode.findIndex(c => c === '');
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Vui lòng nhập đủ mã xác thực 6 số');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('https://ncbds-vlu.onrender.com/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, code: fullCode }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Xác thực thành công! Đang chuyển hướng...');
        setTimeout(() => {
          setCurrentPage('login');
        }, 2000);
      } else {
        setError(data.message || 'Xác thực thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('https://ncbds-vlu.onrender.com/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Mã xác thực mới đã được gửi đến email của bạn.');
      } else {
        setError(data.message || 'Không thể gửi lại mã');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setIsResending(false);
    }
  };

  if (!userEmail) {
    return (
      <div className="login-page">
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h2>Thiếu thông tin Email</h2>
          <button onClick={() => setCurrentPage('login')} className="btn btn-primary" style={{ marginTop: 20 }}>Quay lại đăng nhập</button>
        </div>
      </div>
    );
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-copy">
          <span className="eyebrow">Bảo mật tài khoản</span>
          <h1>Xác minh danh tính.</h1>
          <p>Mã xác thực 6 chữ số đã được gửi đến hộp thư của bạn. Vui lòng kiểm tra và nhập vào ô bên phải.</p>
        </div>
      </section>

      <section className="login-card">
        <div className="login-card-inner">
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div className="brand-icon" style={{ margin: '0 auto 1.5rem', width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={32} />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Nhập mã xác thực</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Đã gửi đến <strong>{userEmail}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength="6" // allow paste
                  value={digit}
                  onChange={e => handleChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  style={{
                    width: '45px',
                    height: '55px',
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    color: 'var(--primary)',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                />
              ))}
            </div>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ color: 'var(--primary)', fontSize: '0.9rem', textAlign: 'center', fontWeight: 500 }}>
                {success}
              </div>
            )}

            <button 
              className="btn btn-primary" 
              type="submit" 
              disabled={isLoading || code.join('').length < 6}
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1rem', marginTop: '10px' }}
            >
              {isLoading ? 'Đang xác thực...' : 'Xác nhận mã'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Chưa nhận được email? <button type="button" onClick={handleResend} disabled={isResending} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>{isResending ? 'Đang gửi...' : 'Gửi lại'}</button>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button type="button" onClick={() => setCurrentPage('login')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}>Quay lại đăng nhập</button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
