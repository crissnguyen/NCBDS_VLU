import re

with open('Web/src/pages/admin/AdminDashboard.jsx', 'r') as f:
    code = f.read()

# Extract AddEmployeeModal
add_emp_start = code.find('function AddEmployeeModal')
edit_prop_start = code.find('function EditPropertyModal')
main_start = code.find('export default function AdminDashboard')

add_emp_code = code[add_emp_start:edit_prop_start]
with open('Web/src/pages/admin/components/AddEmployeeModal.jsx', 'w') as f:
    f.write('''import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { LabeledField, IS } from '../../../components/DashboardShared';

export default ''' + add_emp_code)

edit_prop_code = code[edit_prop_start:code.find('// ─── Main', edit_prop_start)]
with open('Web/src/pages/admin/components/EditPropertyModal.jsx', 'w') as f:
    f.write('''import { useState } from 'react';
import { X } from 'lucide-react';
import { LabeledField, IS } from '../../../components/DashboardShared';

export default ''' + edit_prop_code)

print("Modals extracted!")
