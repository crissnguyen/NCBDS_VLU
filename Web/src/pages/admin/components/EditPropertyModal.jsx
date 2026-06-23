import { useState } from 'react';
import { X } from 'lucide-react';
import { LabeledField, IS } from '../../../components/DashboardShared';

export default function EditPropertyModal({ property, onClose, onSuccess, toast }) {
  const [form, setForm] = useState({
    title: property.title || '',
    price: property.price || '',
    location: property.location || '',
    area: property.area || '',
    beds: property.beds || '',
    baths: property.baths || '',
    transactionType: property.transactionType || 'sale',
    propertyType: property.propertyType || 'apartment',
    legalStatus: property.legalStatus || 'pink-book',
    status: property.status || 'Pending',
    description: property.description || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.price || !form.location) {
      toast.warning('Thiếu thông tin', 'Tiêu đề, Giá và Vị trí là bắt buộc.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://ncbds-vlu.onrender.com/api/admin/properties/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Thành công', 'Đã cập nhật thông tin bài đăng.');
        onSuccess();
      } else {
        toast.error('Cập nhật thất bại', result.message);
      }
    } catch {
      toast.error('Lỗi kết nối', 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '2rem', width: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'fadeInScale 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>Chỉnh sửa tin đăng</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#64748b" /></button>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <LabeledField label="Tiêu đề tin" required>
            <input name="title" value={form.title} onChange={handleChange} style={IS} />
          </LabeledField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <LabeledField label="Giá" required>
              <input name="price" value={form.price} onChange={handleChange} style={IS} />
            </LabeledField>
            <LabeledField label="Vị trí" required>
              <input name="location" value={form.location} onChange={handleChange} style={IS} />
            </LabeledField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <LabeledField label="Diện tích (m²)">
              <input name="area" type="number" value={form.area} onChange={handleChange} style={IS} />
            </LabeledField>
            <LabeledField label="Phòng ngủ">
              <input name="beds" type="number" value={form.beds} onChange={handleChange} style={IS} />
            </LabeledField>
            <LabeledField label="Phòng tắm">
              <input name="baths" type="number" value={form.baths} onChange={handleChange} style={IS} />
            </LabeledField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <LabeledField label="Giao dịch">
              <select name="transactionType" value={form.transactionType} onChange={handleChange} style={IS}>
                <option value="sale">Bán</option>
                <option value="rent">Cho thuê</option>
              </select>
            </LabeledField>
            <LabeledField label="Loại BĐS">
              <select name="propertyType" value={form.propertyType} onChange={handleChange} style={IS}>
                <option value="apartment">Căn hộ</option>
                <option value="house">Nhà phố</option>
                <option value="land">Đất nền</option>
              </select>
            </LabeledField>
            <LabeledField label="Trạng thái">
              <select name="status" value={form.status} onChange={handleChange} style={IS}>
                <option value="Approved">Đã duyệt</option>
                <option value="Pending">Chờ duyệt</option>
                <option value="Rejected">Từ chối</option>
              </select>
            </LabeledField>
          </div>
          <LabeledField label="Mô tả">
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} style={{ ...IS, resize: 'vertical' }} />
          </LabeledField>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button onClick={onClose} style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Hủy</button>
          <button onClick={handleSubmit} disabled={loading} style={{ padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}

