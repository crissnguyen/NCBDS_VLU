import re
import os

with open('Web/src/pages/admin/AdminDashboard.jsx', 'r') as f:
    code = f.read()

# 1. Extract AddEmployeeModal
modal_start = code.find('function AddEmployeeModal')
modal_end = code.find('// ─── Main Admin Dashboard Component', modal_start)
modal_code = code[modal_start:modal_end]

with open('Web/src/pages/admin/components/AddEmployeeModal.jsx', 'w') as f:
    f.write('''import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { LabeledField, IS } from '../../../components/DashboardShared';

export default ''' + modal_code)

# 2. Extract Tabs
def extract_tab(start_marker, end_marker, component_name, props_str, imports_str):
    start_idx = code.find(start_marker)
    if end_marker:
        end_idx = code.find(end_marker, start_idx)
    else:
        end_idx = code.find('</main>', start_idx)
        
    content = code[start_idx:end_idx]
    
    # Remove the wrapper
    content = re.sub(r'\{\/\* TAB \d: .*?\*\/ফে\n*\s*\{activeTab === \d && \(\n*\s*<>\n*', '', content, flags=re.DOTALL)
    # The start marker might not be perfectly matched by the above regex, let's just do a simpler replace
    
    # Actually, let's just write the exact string replacing
    # Remove `{/* TAB X: Name */}`
    content = re.sub(r'\{\/\* TAB \d: .*?\*\/\}\n', '', content)
    # Remove `{activeTab === X && (`
    content = re.sub(r'\s*\{activeTab === \d && \(\s*<>\n', '', content)
    # Remove `</>\n          )}` at the end
    content = re.sub(r'\s*</>\n\s*\)\}\n*', '', content)
    
    file_content = f'''import React from 'react';
{imports_str}

export default function {component_name}({{ {props_str} }}) {{
  return (
    <>
{content}
    </>
  );
}}
'''
    with open(f'Web/src/pages/admin/tabs/{component_name}.jsx', 'w') as f:
        f.write(file_content)

extract_tab('{/* TAB 0: Tổng quan */}', '{/* TAB 1: Nhân viên */}', 'OverviewTab', 'stats, revenueData, propertyTypeData', "import { Activity, Building2, Users, CheckCircle } from 'lucide-react';\nimport { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';\nimport { StatCard } from '../../../components/DashboardShared';")

extract_tab('{/* TAB 1: Nhân viên */}', '{/* TAB 2: Phê duyệt */}', 'UserManagementTab', 'users, currentUser, handleRoleChange, handleToggleStatus, handleDeleteUser', "import { Users, ShieldAlert, MoreVertical, Search, Trash2 } from 'lucide-react';\n\nconst statusBg = { Active: '#dcfce7', Locked: '#fee2e2' };\nconst statusColor = { Active: '#166534', Locked: '#991b1b' };\nconst statusLabel = { Active: 'Hoạt động', Locked: 'Đã khóa' };")

extract_tab('{/* TAB 2: Phê duyệt */}', '{/* TAB 3: Đăng tin */}', 'PendingPropertiesTab', 'pendingProperties, handleApproveProperty', "import { Check, X, ShieldCheck } from 'lucide-react';")

extract_tab('{/* TAB 3: Đăng tin */}', '{/* TAB 4: Quản lý tất cả tin đăng */}', 'PostPropertyTab', 'currentUser, toast, fetchAdminData', "import { PostPropertyForm } from '../../../components/DashboardShared';")

extract_tab('{/* TAB 4: Quản lý tất cả tin đăng */}', '{/* TAB 5: Cài đặt */}', 'AllPropertiesTab', 'allProperties, setEditingProperty, handleDeleteProperty, handleApproveProperty', "import { Image as ImageIcon, Trash2, X, Check } from 'lucide-react';")

extract_tab('{/* TAB 5: Cài đặt */}', '</main>', 'SettingsTab', '', "import { Settings, Bell, ShieldCheck } from 'lucide-react';")

print("Tabs extracted!")
