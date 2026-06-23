import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { LabeledField, IS } from '../../../components/DashboardShared';

export default function AddEmployeeModal({ onClose, onSuccess, toast }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', title: 'Chuyên viên Môi giới', performance: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.warning('Thiếu thông tin', 'Vui lòng điền đủ Tên, Email và Mật khẩu.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('https://ncbds-vlu.onrender.com/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Tạo tài khoản thành công', `Nhân viên "${form.name}" đã được thêm vào hệ thống.`);
        onSuccess(result.data);
        onClose();
      } else {
        toast.error('Tạo thất bại', result.message);
      }
    } catch {
      toast.error('Lỗi kết nối', 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '2rem', width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'fadeInScale 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>Thêm nhân viên mới</h3>
            <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>Tạo tài khoản Sale để đăng nhập vào hệ thống</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#64748b" /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <LabeledField label="Họ và tên" required>
            <input name="name" value={form.name} onChange={handleChange} placeholder="VD: Nguyễn Văn A" style={IS} />
          </LabeledField>
          <LabeledField label="Email đăng nhập" required>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="VD: nhanvien@estateai.vn" style={IS} />
          </LabeledField>
          <LabeledField label="Mật khẩu" required>
            <div style={{ position: 'relative' }}>
              <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Tối thiểu 6 ký tự" style={{ ...IS, paddingRight: '2.5rem' }} />
              <button onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </LabeledField>
          <LabeledField label="Chức danh">
            <select name="title" value={form.title} onChange={handleChange} style={IS}>
              <option>Chuyên viên Môi giới</option>
              <option>Môi giới Cao cấp</option>
              <option>Trưởng nhóm Sale</option>
              <option>Giám đốc Kinh doanh</option>
            </select>
          </LabeledField>
        </div>

        <div style={{ background: '#eff6ff', borderRadius: 10, padding: '0.75rem 1rem', marginTop: '1.25rem', fontSize: '0.8rem', color: '#1d4ed8' }}>
          💡 Tài khoản sẽ có vai trò <strong>Sale</strong> — có thể đăng nhập và đăng tin bất động sản.
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button onClick={onClose} style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Hủy</button>
          <button onClick={handleSubmit} disabled={loading} style={{ padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Đang tạo...' : '✓ Tạo tài khoản'}
          </button>
        </div>
      </div>
    </div>
  );
}

