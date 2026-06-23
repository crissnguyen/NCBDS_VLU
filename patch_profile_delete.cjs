const fs = require('fs');

const path = 'Web/src/pages/Profile.jsx';
let content = fs.readFileSync(path, 'utf8');

const deleteFunc = `
  const handleDeleteAccount = async () => {
    if (window.confirm('CẢNH BÁO: Hành động này không thể hoàn tác! Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của mình?')) {
      const secondConfirm = window.prompt('Gõ chữ "XOA" để xác nhận xóa tài khoản:');
      if (secondConfirm === 'XOA') {
        try {
          const res = await fetch(\`\${API_URL}/api/auth/profile\`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email })
          });
          const data = await res.json();
          if (data.success) {
            toast.success('Tài khoản đã được xóa vĩnh viễn!');
            localStorage.removeItem('user');
            setTimeout(() => {
              window.location.href = '/login';
            }, 1000);
          } else {
            toast.error(data.message || 'Lỗi khi xóa tài khoản');
          }
        } catch (err) {
          console.error(err);
          toast.error('Lỗi kết nối máy chủ');
        }
      } else if (secondConfirm !== null) {
        toast.error('Xác nhận không hợp lệ. Đã hủy xóa.');
      }
    }
  };

  if (!currentUser) {
`;

content = content.replace('  if (!currentUser) {', deleteFunc);

const dangerZone = `
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
      </div>
    </div>
`;

content = content.replace('      </div>\n    </div>', dangerZone);

fs.writeFileSync(path, content, 'utf8');
console.log('Patched Profile.jsx');
