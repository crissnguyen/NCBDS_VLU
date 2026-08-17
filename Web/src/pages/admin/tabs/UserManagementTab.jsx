import { useState } from 'react';
import { Users, ShieldAlert, Search, Trash2, PlusCircle, Edit } from 'lucide-react';
import { useToast } from '../../../components/DashboardShared';
import EditUserModal from '../components/EditUserModal';

const statusBg = { Active: '#ecfdf5', Locked: '#fef2f2' };
const statusColor = { Active: '#047857', Locked: '#b91c1c' };
const statusLabel = { Active: 'Hoạt động', Locked: 'Đã khóa' };

const roleConfig = {
  admin: {
    bg: '#fff1f2',
    color: '#be123c',
    dotColor: '#e11d48',
    borderColor: '#fecdd3',
    label: 'Quản trị viên'
  },
  sale: {
    bg: '#eff6ff',
    color: '#1d4ed8',
    dotColor: '#2563eb',
    borderColor: '#bfdbfe',
    label: 'Môi giới (Sale)'
  },
  user: {
    bg: '#f8fafc',
    color: '#475569',
    dotColor: '#64748b',
    borderColor: '#e2e8f0',
    label: 'Khách hàng'
  }
};

export default function UserManagementTab({ users, currentUser, handleRoleChange, handleToggleStatus, handleDeleteUser, setShowAddEmployee, fetchData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const toast = useToast();

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-management-page" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Top Header & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f2a44' }}>Người dùng hệ thống</h2>
          <p style={{ margin: '0.15rem 0 0', color: '#64748b', fontSize: '0.78rem' }}>Quản lý danh sách, vai trò và phân quyền tài khoản</p>
        </div>
        
        <button 
          onClick={() => setShowAddEmployee(true)} 
          style={{ 
            background: 'linear-gradient(135deg, #0f2a44, #0f766e)', 
            color: 'white', 
            border: 'none', 
            borderRadius: 8, 
            padding: '0.45rem 0.95rem', 
            fontWeight: 700, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            fontSize: '0.8rem',
            boxShadow: '0 2px 8px rgba(15, 118, 110, 0.2)',
            transition: 'all 0.15s ease'
          }}
        >
          <PlusCircle size={14} /> Thêm nhân viên
        </button>
      </div>

      {/* Compact Search Bar */}
      <div style={{ background: 'white', borderRadius: 8, padding: '0.45rem 0.85rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Search size={14} color="#94a3b8" />
        <input 
          type="text" 
          placeholder="Tìm theo tên, email hoặc vai trò..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.8rem', background: 'transparent', color: '#0f172a' }} 
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.75rem' }}>✕</button>
        )}
      </div>

      {/* Ultra Compact Table Card */}
      <div className="user-management-card" style={{ background: 'white', borderRadius: 12, border: '1px solid #eaecf0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)' }}>
        <div className="responsive-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="user-management-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eaecf0', background: '#f8fafc' }}>
                {['Người dùng', 'Vai trò / Quyền', 'Trạng thái', 'Tin đăng', 'Hiệu suất', 'Thao tác'].map(h => (
                  <th key={h} style={{ padding: '0.65rem 0.85rem', fontSize: '0.72rem', fontWeight: 700, color: '#475467', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => {
                const role = roleConfig[user.role] || roleConfig.user;
                const isDisabledRole = user.email === 'admin@test.vn' || user.id === currentUser?.id;

                return (
                  <tr 
                    key={user.id} 
                    style={{ 
                      borderBottom: idx < filteredUsers.length - 1 ? '1px solid #f1f5f9' : 'none', 
                      transition: 'background 0.15s ease' 
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* User Info */}
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: `hsl(${(user.name.charCodeAt(0)*17)%360},60%,42%)`, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justify: 'center', 
                          color: 'white', 
                          fontWeight: 700, 
                          fontSize: '0.8rem', 
                          flexShrink: 0 
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f2a44' }}>{user.name}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Sleek Pill Badge Role Select */}
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                        {/* Dot indicator */}
                        <span style={{
                          position: 'absolute',
                          left: '9px',
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: role.dotColor,
                          pointerEvents: 'none',
                          zIndex: 2
                        }} />
                        
                        <select 
                          value={user.role} 
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={isDisabledRole}
                          style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 22px 3px 21px', 
                            borderRadius: '16px', 
                            border: `1px solid ${role.borderColor}`, 
                            background: role.bg, 
                            color: role.color, 
                            fontSize: '0.74rem', 
                            fontWeight: 700, 
                            outline: 'none', 
                            cursor: isDisabledRole ? 'not-allowed' : 'pointer',
                            opacity: isDisabledRole ? 0.75 : 1,
                            transition: 'all 0.15s ease',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23${role.color.replace('#','')}' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.5rem center'
                          }}
                        >
                          <option value="user" style={{ background: 'white', color: '#334155', fontWeight: 500 }}>Khách hàng</option>
                          <option value="sale" style={{ background: 'white', color: '#0369a1', fontWeight: 600 }}>Môi giới (Sale)</option>
                          <option value="admin" style={{ background: 'white', color: '#991b1b', fontWeight: 700 }}>Quản trị viên</option>
                        </select>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span style={{ 
                        background: statusBg[user.status] || '#f1f5f9', 
                        color: statusColor[user.status] || '#64748b', 
                        padding: '3px 9px', 
                        borderRadius: 12, 
                        fontSize: '0.72rem', 
                        fontWeight: 700 
                      }}>
                        {statusLabel[user.status] || user.status}
                      </span>
                    </td>

                    {/* Property Count */}
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, fontSize: '0.82rem', color: '#0f2a44' }}>
                      {user._count?.properties || 0}
                    </td>

                    {/* Performance */}
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: 48, height: 5, borderRadius: 3, background: '#f1f5f9' }}>
                          <div style={{ width: user.performance || '0%', height: '100%', background: parseInt(user.performance) > 80 ? '#0f766e' : '#f59e0b', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: parseInt(user.performance) > 80 ? '#0f766e' : '#f59e0b' }}>
                          {user.performance || '-'}
                        </span>
                      </div>
                    </td>

                    {/* Small Action Buttons */}
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button 
                          onClick={() => handleToggleStatus(user)} 
                          title={user.status === 'Active' ? 'Khóa tài khoản' : 'Mở khóa'} 
                          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}
                          onMouseOver={e => e.currentTarget.style.background = user.status === 'Active' ? '#fee2e2' : '#dcfce7'}
                          onMouseOut={e => e.currentTarget.style.background = 'white'}
                        >
                          <ShieldAlert size={13} color={user.status === 'Active' ? '#ef4444' : '#0f766e'} />
                        </button>
                        
                        <button 
                          onClick={() => setEditingUser(user)} 
                          title="Sửa thông tin" 
                          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}
                          onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
                          onMouseOut={e => e.currentTarget.style.background = 'white'}
                        >
                          <Edit size={13} color="#2563eb" />
                        </button>

                        <button 
                          onClick={() => handleDeleteUser(user.id, user.email)} 
                          title="Xóa tài khoản" 
                          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}
                          onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                          onMouseOut={e => e.currentTarget.style.background = 'white'}
                        >
                          <Trash2 size={13} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div style={{ padding: '2.5rem 1.25rem', textAlign: 'center', color: '#94a3b8' }}>
            <Users size={32} style={{ margin: '0 auto 0.4rem', opacity: 0.25 }} />
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.82rem' }}>Không tìm thấy nhân viên nào</p>
          </div>
        )}
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
    </div>
  );
}
