import { mediaUrl } from '../../../services/api';

export default function AllPropertiesTab({ allProperties, setEditingProperty, handleDeleteProperty, handleApproveProperty }) {
  return (
    <>
{/* TAB 4: Quản lý tất cả tin đăng */}
                        <div><h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Quản lý tất cả tin đăng</h2></div>
              {allProperties.length === 0 ? (
                <div style={{ background:'white',padding:'3rem',textAlign:'center',borderRadius:16,border:'1px solid #e2e8f0',color:'#64748b' }}>Không có tin đăng nào.</div>
              ) : (
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div className="responsive-table-wrapper">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '1rem', fontWeight: 600 }}>Thông tin</th>
                        <th style={{ padding: '1rem', fontWeight: 600 }}>Loại</th>
                        <th style={{ padding: '1rem', fontWeight: 600 }}>Tác giả</th>
                        <th style={{ padding: '1rem', fontWeight: 600 }}>Trạng thái</th>
                        <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allProperties.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
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
            

          
    </>
  );
}
