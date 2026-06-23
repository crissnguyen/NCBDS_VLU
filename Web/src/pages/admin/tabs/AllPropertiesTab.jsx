import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { mediaUrl } from '../../../services/api';
import { dataService } from '../../../services/data/dataService';

export default function AllPropertiesTab({ allProperties, setEditingProperty, handleDeleteProperty, handleApproveProperty, fetchData, toast }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Clear selection when properties list changes
  useEffect(() => {
    setSelectedIds([]);
  }, [allProperties]);

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === allProperties.length && allProperties.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allProperties.map(p => p.id));
    }
  };

  const executeBulkDelete = async () => {
    try {
      const res = await dataService.bulkDeleteProperties(selectedIds);
      if (res.success) {
        toast.success('Thành công', `Đã xóa thành công ${selectedIds.length} tin đăng.`);
        if (fetchData) fetchData();
      } else {
        toast.error('Thất bại', res.message || 'Không thể xóa hàng loạt tin đăng.');
      }
    } catch (err) {
      toast.error('Lỗi', 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsBulkDeleteOpen(false);
    }
  };

  return (
    <>
      {/* TAB 4: Quản lý tất cả tin đăng */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Quản lý tất cả tin đăng</h2>
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={() => setIsBulkDeleteOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#fee2e2',
              color: '#ef4444',
              border: 'none',
              padding: '0.65rem 1.15rem',
              borderRadius: 10,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fecaca'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
          >
            <Trash2 size={17} /> Xóa hàng loạt ({selectedIds.length})
          </button>
        )}
      </div>

      {allProperties.length === 0 ? (
        <div style={{ background:'white',padding:'3rem',textAlign:'center',borderRadius:16,border:'1px solid #e2e8f0',color:'#64748b' }}>Không có tin đăng nào.</div>
      ) : (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div className="responsive-table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '1rem', width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === allProperties.length && allProperties.length > 0}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer', width: 16, height: 16, verticalAlign: 'middle' }}
                    />
                  </th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Thông tin</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Loại</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Tác giả</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Trạng thái</th>
                  <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {allProperties.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', background: selectedIds.includes(p.id) ? '#f0fdfa' : 'transparent' }}>
                    <td style={{ padding: '1rem', width: '50px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => handleSelectRow(p.id)}
                        style={{ cursor: 'pointer', width: 16, height: 16, verticalAlign: 'middle' }}
                      />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
                        <img src={p.images[0] ? mediaUrl(p.images[0]) : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80'} alt="" style={{ width: 64, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f2a44', marginBottom: 4 }}>{p.title}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '0.5rem' }}><span>{p.price}</span>•<span>{p.location}</span></div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500 }}>{p.transactionType === 'sale' ? 'Bán' : 'Thuê'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.propertyType}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500 }}>{p.author?.name || 'Admin'}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                        background: p.status === 'Approved' ? '#dcfce7' : p.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                        color: p.status === 'Approved' ? '#166534' : p.status === 'Pending' ? '#b45309' : '#991b1b'
                      }}>
                        {p.status === 'Approved' ? 'Đã duyệt' : p.status === 'Pending' ? 'Chờ duyệt' : 'Từ chối'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => setEditingProperty(p)} style={{ padding: '6px 12px', background: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', marginRight: '8px' }}>Sửa</button>
                      <button onClick={() => handleDeleteProperty(p.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
          <div 
            style={{ background: 'white', width: 420, maxWidth: '100%', borderRadius: 20, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'fadeInScale 0.25s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Body */}
            <div style={{ padding: '2rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ background: '#fee2e2', color: '#ef4444', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Trash2 size={28} />
              </div>
              
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Xác nhận xóa hàng loạt</h3>
              
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                Bạn có chắc chắn muốn xóa <strong style={{ color: '#ef4444' }}>{selectedIds.length}</strong> tin đăng đã chọn không? Hành động này không thể hoàn tác và sẽ xóa tất cả ảnh liên quan.
              </p>

              {/* Buttons */}
              <div style={{ display: 'flex', width: '100%', gap: '0.75rem', marginTop: '2rem' }}>
                <button 
                  type="button"
                  onClick={() => setIsBulkDeleteOpen(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, padding: '0.75rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                >
                  Hủy
                </button>
                <button 
                  type="button"
                  onClick={executeBulkDelete}
                  style={{
                    flex: 1,
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    padding: '0.75rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#ef4444'; }}
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
