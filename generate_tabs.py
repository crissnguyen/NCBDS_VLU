import os

os.makedirs('Web/src/pages/admin/tabs', exist_ok=True)
os.makedirs('Web/src/pages/admin/components', exist_ok=True)

with open('admin_backup.jsx', 'r') as f:
    code = f.read()

# Helper to extract a block using start and end strings
def extract_block(start_str, end_str):
    start = code.find(start_str)
    if start == -1: return ""
    end = code.find(end_str, start)
    if end == -1: return ""
    return code[start:end]

# 1. Modals
modal_emp = extract_block('function AddEmployeeModal', '// ───')
with open('Web/src/pages/admin/components/AddEmployeeModal.jsx', 'w') as f:
    f.write('''import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { LabeledField, IS } from '../../../components/DashboardShared';

export default ''' + modal_emp)

modal_edit = extract_block('function EditPropertyModal', '// ─── Main')
with open('Web/src/pages/admin/components/EditPropertyModal.jsx', 'w') as f:
    f.write('''import { useState } from 'react';
import { X } from 'lucide-react';
import { LabeledField, IS } from '../../../components/DashboardShared';

export default ''' + modal_edit)

# 2. Tabs
tab0 = extract_block('{/* TAB 0: Tổng quan */}', '{/* TAB 1: Nhân viên */}')
tab0 = tab0.replace('{activeTab === 0 && (\\n            <>\\n', '').replace('{activeTab === 0 && (\n            <>\n', '')
tab0 = tab0.replace('</>\n          )}', '')
with open('Web/src/pages/admin/tabs/OverviewTab.jsx', 'w') as f:
    f.write('''import { Activity, Building2, Users, CheckCircle, FileText, Home, TrendingUp } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '../../../components/DashboardShared';

export default function OverviewTab({ stats, revenueData, propertyTypeData, currentUser, pendingProperties, allProperties }) {
  const metrics = [
    { title: 'Tổng Doanh Thu', value: '4.2 Tỷ', sub: '+12% so với tháng trước', color: '#0f766e', icon: <TrendingUp size={20} color="#0f766e" /> },
    { title: 'Tin Đăng Mới', value: pendingProperties?.length || 0, sub: 'Cần phê duyệt', color: '#f59e0b', icon: <FileText size={20} color="#f59e0b" /> },
    { title: 'Tổng Tài Sản', value: allProperties?.length || 0, sub: 'Đang hiển thị', color: '#3b82f6', icon: <Home size={20} color="#3b82f6" /> },
    { title: 'Người Dùng', value: stats?.users || 0, sub: '+5 user mới tuần này', color: '#8b5cf6', icon: <Users size={20} color="#8b5cf6" /> },
  ];

  return (
    <>
''' + tab0 + '''
    </>
  );
}''')

tab1 = extract_block('{/* TAB 1: Nhân viên */}', '{/* TAB 2: Phê duyệt */}')
tab1 = tab1.replace('{activeTab === 1 && (\n            <>\n', '')
tab1 = tab1.replace('</>\n          )}', '')
with open('Web/src/pages/admin/tabs/UserManagementTab.jsx', 'w') as f:
    f.write('''import { useState } from 'react';
import { Users, ShieldAlert, MoreVertical, Search, Trash2, PlusCircle } from 'lucide-react';

const statusBg = { Active: '#dcfce7', Locked: '#fee2e2' };
const statusColor = { Active: '#166534', Locked: '#991b1b' };
const statusLabel = { Active: 'Hoạt động', Locked: 'Đã khóa' };

export default function UserManagementTab({ users, currentUser, handleRoleChange, handleToggleStatus, handleDeleteUser, setShowAddEmployee }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
''' + tab1 + '''
    </>
  );
}''')

tab2 = extract_block('{/* TAB 2: Phê duyệt */}', '{/* TAB 3: Đăng tin */}')
tab2 = tab2.replace('{activeTab === 2 && (\n            <>\n', '')
tab2 = tab2.replace('</>\n          )}', '')
with open('Web/src/pages/admin/tabs/PendingPropertiesTab.jsx', 'w') as f:
    f.write('''import { Check, X, ShieldCheck, Image as ImageIcon } from 'lucide-react';

export default function PendingPropertiesTab({ pendingProperties, handleApproveProperty }) {
  return (
    <>
''' + tab2 + '''
    </>
  );
}''')

tab3 = extract_block('{/* TAB 3: Đăng tin */}', '{/* TAB 4: Quản lý tất cả tin đăng */}')
tab3 = tab3.replace('{activeTab === 3 && (\n            <>\n', '')
tab3 = tab3.replace('</>\n          )}', '')
with open('Web/src/pages/admin/tabs/PostPropertyTab.jsx', 'w') as f:
    f.write('''import { PostPropertyForm } from '../../../components/DashboardShared';

export default function PostPropertyTab({ currentUser, toast, fetchData }) {
  return (
    <>
''' + tab3.replace('onSuccess={fetchAdminData}', 'onSuccess={fetchData}') + '''
    </>
  );
}''')

tab4 = extract_block('{/* TAB 4: Quản lý tất cả tin đăng */}', '{/* TAB 5: Cài đặt */}')
tab4 = tab4.replace('{activeTab === 4 && (\n            <>\n', '')
tab4 = tab4.replace('</>\n          )}', '')
with open('Web/src/pages/admin/tabs/AllPropertiesTab.jsx', 'w') as f:
    f.write('''import { Image as ImageIcon, Trash2, X, Check } from 'lucide-react';

export default function AllPropertiesTab({ allProperties, setEditingProperty, handleDeleteProperty, handleApproveProperty }) {
  return (
    <>
''' + tab4 + '''
    </>
  );
}''')

tab5 = extract_block('{/* TAB 5: Cài đặt */}', '</main>')
tab5 = tab5.replace('{activeTab === 5 && (\n            <>\n', '')
tab5 = tab5.replace('</>\n          )}', '')
with open('Web/src/pages/admin/tabs/SettingsTab.jsx', 'w') as f:
    f.write('''import { Settings, Bell, ShieldCheck } from 'lucide-react';

export default function SettingsTab() {
  return (
    <>
''' + tab5 + '''
    </>
  );
}''')

print("All components regenerated!")
