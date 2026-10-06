import { useState, useEffect } from 'react';
import { Users, ShieldAlert, Search, Trash2, PlusCircle, Edit, MoreVertical, ShieldCheck } from 'lucide-react';
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
  const [openActionId, setOpenActionId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const handleDocClick = (e) => {
      if (!e.target.closest('.user-action-dropdown-wrapper')) {
        setOpenActionId(null);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-management-page">
      {/* Unified Table Card */}
      <div className="admin-table-card admin-filter-table-card user-list-card">
        {/* Unified Table Header Toolbar */}
        <div className="admin-table-header-toolbar">
          <div className="admin-table-header-left">
            <div className="admin-table-header-icon">
              <Users size={20} />
            </div>
            <div className="admin-table-header-info">
              <div className="admin-table-header-title-row">
                <h2 className="admin-table-header-title">Người dùng hệ thống</h2>
                <span className="admin-table-count-badge">{filteredUsers.length} người dùng</span>
              </div>
              <p className="admin-table-header-subtitle">Quản lý danh sách, vai trò và phân quyền tài khoản</p>
            </div>
          </div>

          <div className="admin-table-header-right admin-table-actions">
            

            <button 
              className="admin-table-btn-primary"
              onClick={() => setShowAddEmployee(true)} 
            >
              <PlusCircle size={15} /> Thêm nhân viên
            </button>
          </div>
        </div>
      <div className="admin-table-filters">
        <div className="admin-table-search-input">
              <Search size={15} color="#667085" />
              <input 
                type="text" 
                aria-label="Tìm kiếm"
              placeholder="Tìm theo tên, email, vai trò..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
              {searchTerm && (
                <button aria-label="Xóa tìm kiếm" onClick={() => setSearchTerm('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#98a2b3', fontSize: '0.8rem', padding: 0 }}>✕</button>
              )}
            </div>
      </div>

        {/* Table Container */}
        <div className="responsive-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="admin-unified-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th style={{ width: '200px' }}>Vai trò / quyền</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Trạng thái</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Tin đăng</th>
                <th style={{ width: '150px' }}>Hiệu suất</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Thao tác</th>
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
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: `hsl(${(user.name.charCodeAt(0)*17)%360},60%,42%)`, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
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
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>
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
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
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
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#0f2a44' }}>
                      {user._count?.properties || 0}
                    </td>

                    {/* Performance */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: 48, height: 5, borderRadius: 3, background: '#f1f5f9' }}>
                          <div style={{ width: user.performance || '0%', height: '100%', background: parseInt(user.performance) > 80 ? '#0f766e' : '#f59e0b', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: parseInt(user.performance) > 80 ? '#0f766e' : '#f59e0b' }}>
                          {user.performance || '-'}
                        </span>
                      </div>
                    </td>

                    {/* Action Dropdown Menu */}
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', position: 'relative' }}>
                      <div className="user-action-dropdown-wrapper" style={{ display: 'inline-block', position: 'relative', textAlign: 'left' }}>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionId(openActionId === user.id ? null : user.id);
                          }}
                          title="Thao tác"
                          aria-label="Thao tác"
                          style={{ 
                            width: 30, 
                            height: 30, 
                            borderRadius: 8, 
                            border: '1px solid #d0d5dd', 
                            background: openActionId === user.id ? '#f1f5f9' : 'white', 
                            color: openActionId === user.id ? '#0f766e' : '#475467',
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            cursor: 'pointer', 
                            transition: 'all 0.15s ease' 
                          }}
                          onMouseEnter={e => { if (openActionId !== user.id) e.currentTarget.style.background = '#f8fafc'; }}
                          onMouseLeave={e => { if (openActionId !== user.id) e.currentTarget.style.background = 'white'; }}
                        >
                          <MoreVertical size={15} />
                        </button>

                        {openActionId === user.id && (
                          <div 
                            style={{ 
                              position: 'absolute',
                              right: 0,
                              ...(idx >= filteredUsers.length - 2 && filteredUsers.length > 3
                                ? { bottom: '100%', marginBottom: 6 }
                                : { top: '100%', marginTop: 6 }),
                              width: 175,
                              background: '#ffffff',
                              border: '1px solid #eaecf0',
                              borderRadius: 10,
                              boxShadow: '0 12px 24px -4px rgba(16, 24, 40, 0.14), 0 4px 6px -2px rgba(16, 24, 40, 0.05)',
                              padding: '4px',
                              zIndex: 100
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionId(null);
                                setEditingUser(user);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: 6,
                                color: '#344054',
                                fontSize: '0.82rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.12s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f2f4f7'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Edit size={14} color="#175cd3" />
                              <span>Sửa thông tin</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionId(null);
                                handleToggleStatus(user);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: 6,
                                color: user.status === 'Active' ? '#b42318' : '#027a48',
                                fontSize: '0.82rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.12s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = user.status === 'Active' ? '#fef3f2' : '#ecfdf5'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              {user.status === 'Active' ? <ShieldAlert size={14} color="#ef4444" /> : <ShieldCheck size={14} color="#059669" />}
                              <span>{user.status === 'Active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</span>
                            </button>

                            <div style={{ height: 1, background: '#f2f4f7', margin: '4px 0' }} />

                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionId(null);
                                handleDeleteUser(user.id, user.email);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: 6,
                                color: '#d92d20',
                                fontSize: '0.82rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.12s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#fef3f2'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Trash2 size={14} color="#d92d20" />
                              <span>Xóa người dùng</span>
                            </button>
                          </div>
                        )}
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
