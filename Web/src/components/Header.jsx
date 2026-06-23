import { Home, LogOut, Plus, UserCircle2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ currentPage, setCurrentPage, userRole, setUserRole, currentUser }) {
  const navItems = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'search', label: 'Mua bán' },
    { id: 'map', label: 'Bản đồ' },
  ];

  return (
    <header className="header glass">
      <div className="brand" onClick={() => setCurrentPage('home')}>
        <div className="brand-icon">
          <Home size={24} />
        </div>
        <div>
          <span>EstateAI</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '0.25rem' }}>Vietnam</span>
        </div>
      </div>

      <nav className="nav-links-modern" style={{ marginLeft: '3rem', marginRight: 'auto' }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-link-modern ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.id)}
          >
            {item.label}
            {currentPage === item.id && (
              <motion.div
                layoutId="active-nav-indicator"
                className="active-nav-indicator"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="header-search-bar">
        <Search size={18} />
        <input type="text" placeholder="Tìm kiếm khu vực" />
      </div>

      <div className="flex items-center gap-2">
        {!userRole ? (
          <button
            className="btn btn-primary"
            onClick={() => setCurrentPage('login')}
          >
            <UserCircle2 size={18} />
            Đăng nhập
          </button>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => setCurrentPage('profile')}>
              <UserCircle2 size={18} style={{ marginRight: '6px' }} />
              {currentUser?.name || 'Tài khoản'}
            </button>
            {userRole === 'admin' && (
              <button className="btn btn-ghost" onClick={() => setCurrentPage('admin_dashboard')}>
                Quản trị
              </button>
            )}
            {userRole === 'sale' && (
              <button className="btn btn-ghost" onClick={() => setCurrentPage('dashboard')}>
                Môi giới
              </button>
            )}
            {userRole !== 'user' && (
              <button className="btn btn-primary" onClick={() => setCurrentPage(userRole === 'admin' ? 'admin_dashboard' : 'dashboard')}>
                <Plus size={18} />
                Đăng tin
              </button>
            )}
            <button
              className="btn btn-ghost icon-button"
              onClick={() => { setUserRole(null); setCurrentPage('home'); }}
              title="Đăng xuất"
            >
              <LogOut size={18} color="var(--text-secondary)" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
