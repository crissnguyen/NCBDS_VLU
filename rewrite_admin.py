import re

with open('admin_backup.jsx', 'r') as f:
    code = f.read()

# 1. Remove Modals from the top
modal_start = code.find('// ─── AddEmployeeModal')
if modal_start == -1:
    modal_start = code.find('function AddEmployeeModal')
main_start = code.find('// ─── Main')
if main_start == -1:
    main_start = code.find('export default function AdminDashboard')

code = code[:modal_start] + code[main_start:]

# 2. Add imports
imports = """import AddEmployeeModal from './components/AddEmployeeModal';
import EditPropertyModal from './components/EditPropertyModal';
import OverviewTab from './tabs/OverviewTab';
import UserManagementTab from './tabs/UserManagementTab';
import PendingPropertiesTab from './tabs/PendingPropertiesTab';
import PostPropertyTab from './tabs/PostPropertyTab';
import AllPropertiesTab from './tabs/AllPropertiesTab';
import SettingsTab from './tabs/SettingsTab';
"""

import_insert_pos = code.find('// ─── Chart Data')
code = code[:import_insert_pos] + imports + '\n' + code[import_insert_pos:]

# 3. Remove searchTerm, setSearchTerm, filteredUsers, metrics
code = re.sub(r'\s*const \[searchTerm, setSearchTerm\] = useState\(\'\'\);\n', '\n', code)
code = re.sub(r'\s*const filteredUsers = users\.filter\(.*?\}\);\n\n', '\n', code, flags=re.DOTALL)
code = re.sub(r'\s*const filteredUsers = users\.filter\([\s\S]*?\);\n', '\n', code)

metrics_start = code.find('const metrics = [')
if metrics_start != -1:
    metrics_end = code.find('];', metrics_start) + 2
    code = code[:metrics_start] + code[metrics_end:]

# 4. Replace main tab rendering
tabs_start = code.find('{/* TAB 0: Tổng quan */}')
tabs_end = code.find('</main>')

new_tabs_jsx = """
          {activeTab === 0 && <OverviewTab stats={stats} revenueData={revenueData} propertyTypeData={propertyTypeData} currentUser={currentUser} pendingProperties={pendingProperties} allProperties={allProperties} />}
          {activeTab === 1 && <UserManagementTab users={users} currentUser={currentUser} handleRoleChange={handleRoleChange} handleToggleStatus={handleToggleStatus} handleDeleteUser={handleDeleteUser} setShowAddEmployee={setShowAddEmployee} />}
          {activeTab === 2 && <PendingPropertiesTab pendingProperties={pendingProperties} handleApproveProperty={handleApproveProperty} />}
          {activeTab === 3 && <PostPropertyTab currentUser={currentUser} toast={toast} fetchData={fetchData} />}
          {activeTab === 4 && <AllPropertiesTab allProperties={allProperties} setEditingProperty={setEditingProperty} handleDeleteProperty={handleDeleteProperty} handleApproveProperty={handleApproveProperty} />}
          {activeTab === 5 && <SettingsTab />}
"""

code = code[:tabs_start] + new_tabs_jsx + code[tabs_end:]

with open('Web/src/pages/admin/AdminDashboard.jsx', 'w') as f:
    f.write(code)

print("AdminDashboard fully refactored!")
