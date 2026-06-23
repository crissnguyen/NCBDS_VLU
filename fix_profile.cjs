const fs = require('fs');
const path = 'Web/src/pages/Profile.jsx';
let content = fs.readFileSync(path, 'utf8');

const newFuncs = `
  const handleDeleteAccount = async () => {
    if (window.confirm('CẢNH BÁO: Hành động này không thể hoàn tác! Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của mình?')) {
      const secondConfirm = window.prompt('Gõ chữ "XOA" để xác nhận xóa tài khoản:');
      if (secondConfirm === 'XOA') {
        try {
          const res = await fetch('https://ncbds-vlu.onrender.com/api/auth/profile', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email })
          });
          const data = await res.json();
          if (data.success) {
            alert('Tài khoản đã được xóa vĩnh viễn!');
            localStorage.removeItem('user');
            setTimeout(() => {
              window.location.href = '/login';
            }, 1000);
          } else {
            alert(data.message || 'Lỗi khi xóa tài khoản');
          }
        } catch (err) {
          console.error(err);
          alert('Lỗi kết nối máy chủ');
        }
      } else if (secondConfirm !== null) {
        alert('Xác nhận không hợp lệ. Đã hủy xóa.');
      }
    }
  };

  if (!currentUser) return null;
`;

content = content.replace('  if (!currentUser) return null;', newFuncs);

const dangerZone = `
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

            {/* Vùng nguy hiểm */}
            <div style={{ marginTop: '2.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '2rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#991b1b', fontSize: '1.1rem', fontWeight: 700 }}>Vùng Nguy Hiểm (Danger Zone)</h3>
              <p style={{ color: '#b91c1c', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Khi bạn xóa tài khoản, mọi dữ liệu cá nhân của bạn sẽ bị xóa vĩnh viễn. Hành động này không thể được hoàn tác. Xin vui lòng cân nhắc kỹ lưỡng.
              </p>
              <button 
                onClick={handleDeleteAccount}
                style={{ 
                  background: '#ef4444', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.8rem 1.5rem', 
                  borderRadius: '8px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e=>e.currentTarget.style.background='#dc2626'}
                onMouseOut={e=>e.currentTarget.style.background='#ef4444'}
              >
                <LogOut size={18} />
                Xóa tài khoản vĩnh viễn
              </button>
            </div>
`;

content = content.replace(/<div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>[\s\S]*?<\/button>\s*<\/div>/, dangerZone);

if (!content.includes('LogOut')) {
  content = content.replace('UserCircle2, Mail, Calendar, ShieldCheck, MapPin', 'UserCircle2, Mail, Calendar, ShieldCheck, MapPin, LogOut');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed Profile.jsx');
