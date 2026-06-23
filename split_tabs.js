const fs = require('fs');

const code = fs.readFileSync('Web/src/pages/admin/AdminDashboard.jsx', 'utf8');

// 1. Extract AddEmployeeModal
const modalStart = code.indexOf('function AddEmployeeModal');
const modalEnd = code.indexOf('// ─── Main Admin Dashboard Component', modalStart);
const modalCode = code.slice(modalStart, modalEnd);

fs.writeFileSync('Web/src/pages/admin/components/AddEmployeeModal.jsx', `import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { LabeledField, IS } from '../../../components/DashboardShared';

export default ` + modalCode);

// 2. Extract Tabs
const tab0Start = code.indexOf('{/* TAB 0: Tổng quan */}');
const tab1Start = code.indexOf('{/* TAB 1: Nhân viên */}');
const tab2Start = code.indexOf('{/* TAB 2: Phê duyệt */}');
const tab3Start = code.indexOf('{/* TAB 3: Đăng tin */}');
const tab4Start = code.indexOf('{/* TAB 4: Quản lý tất cả tin đăng */}');
const tab5Start = code.indexOf('{/* TAB 5: Cài đặt */}');
const tabEnd = code.indexOf('</main>', tab5Start);

function extractTab(start, end, componentName, props, imports) {
  let content = code.slice(start, end);
  // remove the wrapper if it has activeTab === X && ( <> ... </> )
  content = content.replace(/\\{\\/\\* TAB.*?\\*\\/\\}\\s*\\{activeTab === \\d && \\(\\s*<>\\s*/, '');
  content = content.replace(/\\s*<\\/>\\s*\\)\\}\\s*$/, '');

  const fileContent = `import React from 'react';
${imports}

export default function ${componentName}({ ${props.join(', ')} }) {
  return (
    <>
      ${content}
    </>
  );
}
`;
  fs.writeFileSync(`Web/src/pages/admin/tabs/${componentName}.jsx`, fileContent);
}

// Write the script to do this more accurately
