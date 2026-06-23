import { useState } from 'react';
import { Users, ShieldAlert, MoreVertical, Search, Trash2, PlusCircle, Edit } from 'lucide-react';
import { useToast } from '../../../components/DashboardShared';
import EditUserModal from '../components/EditUserModal';

const statusBg = { Active: '#dcfce7', Locked: '#fee2e2' };
const statusColor = { Active: '#166534', Locked: '#991b1b' };
const statusLabel = { Active: 'Hoạt động', Locked: 'Đã khóa' };

export default function UserManagementTab({ users, currentUser, handleRoleChange, handleToggleStatus, handleDeleteUser, setShowAddEmployee, fetchData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const toast = useToast();

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
{/* TAB 1: Nhân viên */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Người dùng hệ thống</h2><p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>Quản lý danh sách và phân quyền tài khoản</p></div>
                <button onClick={() => setShowAddEmployee(true)} style={{ background: 'linear-gradient(135deg, #0f2a44, #0f766e)', color: 'white', border: 'none', borderRadius: 10, padding: '0.6rem 1.1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                  <PlusCircle size={15} /> Thêm nhân viên
                </button>
              </div>
              <div style={{ background: 'white', borderRadius: 10, padding: '0.65rem 1rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Search size={15} color="#94a3b8" />
                <input type="text" placeholder="Tìm theo tên hoặc email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.875rem', background: 'transparent', color: '#0f172a' }} />
              </div>
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div className="responsive-table-wrapper">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ borderBottom: '1px solid #f1f5f9' }}>{['Người dùng', 'Vai trò / Quyền', 'Trạng thái', 'Tin đăng', 'Hiệu suất', 'Thao tác'].map(h=><th key={h} style={{padding:'0.875rem 1.125rem',textAlign:'left',fontSize:'0.73rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.05em',background:'#fafafa'}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filteredUsers.map((user, idx) => (
                      <tr key={user.id} style={{ borderBottom: idx < filteredUsers.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.12s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '0.875rem 1.125rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: `hsl(${(user.name.charCodeAt(0)*17)%360},55%,45%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>{user.name.charAt(0).toUpperCase()}</div>
                            <div><div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{user.name}</div><div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user.email}</div></div>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1.125rem' }}>
                          <select 
                            value={user.role} 
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            style={{ padding: '0.35rem 0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: user.role==='admin'?'#fee2e2':(user.role==='sale'?'#e0f2fe':'#f8fafc'), fontSize: '0.82rem', outline: 'none', cursor: 'pointer', color: user.role==='admin'?'#991b1b':(user.role==='sale'?'#0369a1':'#475569'), fontWeight: 600, width: '130px' }}
                            disabled={user.email === 'admin@test.vn' || user.id === currentUser?.id} // Ngăn admin tự sửa quyền của chính mình hoặc admin gốc
                          >
                            <option value="user">Khách hàng</option>
                            <option value="sale">Môi giới (Sale)</option>
                            <option value="admin">Quản trị viên</option>
                          </select>
                        </td>
                        <td style={{ padding: '0.875rem 1.125rem' }}>
                          <span style={{ background: statusBg[user.status]||'#f1f5f9', color: statusColor[user.status]||'#64748b', padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 }}>{statusLabel[user.status] || user.status}</span>
                        </td>
                        <td style={{ padding: '0.875rem 1.125rem', fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{user._count?.properties || 0}</td>
                        <td style={{ padding: '0.875rem 1.125rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 56, height: 5, borderRadius: 3, background: '#f1f5f9' }}><div style={{ width: user.performance || '0%', height: '100%', background: parseInt(user.performance)>80?'#0f766e':'#f59e0b', borderRadius: 3 }}/></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: parseInt(user.performance)>80?'#0f766e':'#f59e0b' }}>{user.performance||'-'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1.125rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => handleToggleStatus(user)} title={user.status==='Active'?'Khóa':'Mở khóa'} style={{ width:30,height:30,borderRadius:7,border:'1px solid #e2e8f0',background:'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}
                              onMouseOver={e=>e.currentTarget.style.background=user.status==='Active'?'#fee2e2':'#d8f3ef'}
                              onMouseOut={e=>e.currentTarget.style.background='white'}
                            ><ShieldAlert size={13} color={user.status==='Active'?'#ef4444':'#0f766e'}/></button>
                            
                             <button onClick={() => setEditingUser(user)} title="Sửa thông tin" style={{ width:30,height:30,borderRadius:7,border:'1px solid #e2e8f0',background:'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}
                              onMouseOver={e=>e.currentTarget.style.background='#eef6ff'}
                              onMouseOut={e=>e.currentTarget.style.background='white'}
                            ><Edit size={13} color="#2563eb"/></button>

                            <button onClick={() => handleDeleteUser(user.id, user.email)} title="Xóa tài khoản" style={{ width:30,height:30,borderRadius:7,border:'1px solid #e2e8f0',background:'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}
                              onMouseOver={e=>e.currentTarget.style.background='#fee2e2'}
                              onMouseOut={e=>e.currentTarget.style.background='white'}
                            ><Trash2 size={13} color="#ef4444"/></button>
                            <button style={{ width:30,height:30,borderRadius:7,border:'1px solid #e2e8f0',background:'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}><MoreVertical size={13} color="#64748b"/></button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}><Users size={36} style={{ margin:'0 auto 0.5rem',opacity:0.25 }}/><p style={{ margin:0 }}>Không tìm thấy nhân viên nào</p></div>}
              </div>
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            if (fetchData) fetchData();
          }}
          toast={toast}
        />
      )}
    </>
  );
}