const fs = require('fs');

const path = 'Web/src/pages/admin/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Add handleDeleteUser
const deleteFunc = `
  const handleDeleteUser = async (userId, email) => {
    if (email === 'admin@test.vn' || userId === currentUser?.id) {
      toast.error('Không thể xóa tài khoản này!');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này? Các bài đăng của họ sẽ bị gỡ tên tác giả nhưng vẫn tồn tại trên hệ thống.')) {
      try {
        const res = await fetch(\`\${API_URL}/api/admin/users/\${userId}\`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
          toast.success(data.message);
          fetchAdminData();
        } else {
          toast.error(data.message || 'Lỗi khi xóa tài khoản');
        }
      } catch (err) {
        console.error(err);
        toast.error('Lỗi kết nối máy chủ');
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
`;

content = content.replace('  const handleRoleChange = async (userId, newRole) => {', deleteFunc);

// Import Trash-2 icon if not imported
if (!content.includes('Trash2')) {
  content = content.replace('import { Users, BarChart3, Building2, MapPin, Activity, CheckCircle, ShieldAlert, MoreVertical, TrendingUp, DollarSign, Bell, ShieldCheck, PieChart, Star, Mail, Award, X, Image as ImageIcon, Map, Loader2 } from \'lucide-react\';', 
  'import { Users, BarChart3, Building2, MapPin, Activity, CheckCircle, ShieldAlert, MoreVertical, TrendingUp, DollarSign, Bell, ShieldCheck, PieChart, Star, Mail, Award, X, Image as ImageIcon, Map, Loader2, Trash2 } from \'lucide-react\';');
}

// Add Delete Button in User list
const newButtons = `
                            <button onClick={() => handleDeleteUser(user.id, user.email)} title="Xóa tài khoản" style={{ width:30,height:30,borderRadius:7,border:'1px solid #e2e8f0',background:'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}
                              onMouseOver={e=>e.currentTarget.style.background='#fee2e2'}
                              onMouseOut={e=>e.currentTarget.style.background='white'}
                            ><Trash2 size={13} color="#ef4444"/></button>
                            <button style={{ width:30,height:30,borderRadius:7,border:'1px solid #e2e8f0',background:'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}><MoreVertical size={13} color="#64748b"/></button>
`;

content = content.replace('<button style={{ width:30,height:30,borderRadius:7,border:\'1px solid #e2e8f0\',background:\'white\',display:\'flex\',alignItems:\'center\',justifyContent:\'center\',cursor:\'pointer\' }}><MoreVertical size={13} color="#64748b"/></button>', newButtons);

fs.writeFileSync(path, content, 'utf8');
console.log('Patched AdminDashboard.jsx');
