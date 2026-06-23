import { useState, useEffect } from 'react';
import { Home, LogOut, Plus, UserCircle2, Search, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ currentPage, setCurrentPage, userRole, setUserRole, currentUser }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'search', label: 'Mua bán' },
    { id: 'news', label: 'Tin tức' },
  ];

  const closeMenuAndNavigate = (pageId) => {
    setCurrentPage(pageId);
    setIsMobileMenuOpen(false);
  };

  const ActionButtons = ({ isMobile }) => {
    return (
      <div className={isMobile ? "mobile-action-buttons" : "desktop-action-buttons"} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '1rem' : '0.5rem', flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto' }}>
        {!userRole ? (
          <button
            className="btn btn-primary"
            style={isMobile ? { width: '100%', justifyContent: 'center' } : {}}
            onClick={() => closeMenuAndNavigate('login')}
          >
            <UserCircle2 size={18} />
            Đăng nhập
          </button>
        ) : (
          <>
            <button className="btn btn-ghost" style={isMobile ? { width: '100%', justifyContent: 'flex-start' } : {}} onClick={() => closeMenuAndNavigate('profile')}>
              <UserCircle2 size={18} style={{ marginRight: '6px' }} />
              {currentUser?.name || 'Tài khoản'}
            </button>
            {userRole === 'admin' && (
              <button className="btn btn-ghost" style={isMobile ? { width: '100%', justifyContent: 'flex-start' } : {}} onClick={() => closeMenuAndNavigate('admin_dashboard')}>
                Quản trị
              </button>
            )}
            {userRole === 'sale' && (
              <button className="btn btn-ghost" style={isMobile ? { width: '100%', justifyContent: 'flex-start' } : {}} onClick={() => closeMenuAndNavigate('dashboard')}>
                Môi giới
              </button>
            )}
            {userRole !== 'user' && (
              <button className="btn btn-primary" style={isMobile ? { width: '100%', justifyContent: 'center' } : {}} onClick={() => closeMenuAndNavigate(userRole === 'admin' ? 'admin_dashboard' : 'dashboard')}>
                <Plus size={18} />
                Đăng tin
              </button>
            )}
            <button
              className="btn btn-ghost icon-button"
              style={isMobile ? { width: '100%', justifyContent: 'center', color: '#ef4444', background: '#fef2f2' } : {}}
              onClick={() => { setUserRole(null); closeMenuAndNavigate('home'); }}
              title="Đăng xuất"
            >
              {isMobile ? <><LogOut size={18} /> Đăng xuất</> : <LogOut size={18} color="var(--text-secondary)" />}
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <header className={`header glass ${scrolled ? 'scrolled' : ''}`} style={{ position: 'sticky', top: 0, zIndex: 100, transition: 'all 0.3s', padding: scrolled ? '0.75rem 5%' : '1.25rem 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent' }}>
        <div className="brand" onClick={() => setCurrentPage('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>
          <div className="brand-icon" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', color: 'white', padding: '0.4rem', borderRadius: '10px' }}>
            <Home size={22} />
          </div>
          <div>
            <span>EstateAI</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '0.25rem', fontSize: '1rem' }}>Vietnam</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="nav-links-modern desktop-only" style={{ display: 'flex', gap: '1.5rem' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-link-modern ${currentPage === item.id ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', fontSize: '0.95rem', fontWeight: 600, color: currentPage === item.id ? 'var(--primary)' : 'var(--text-secondary)', position: 'relative', cursor: 'pointer', padding: '0.5rem 0' }}
              onClick={() => setCurrentPage(item.id)}
            >
              {item.label}
              {currentPage === item.id && (
                <motion.div
                  layoutId="active-nav-indicator"
                  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'var(--primary)', borderRadius: 3 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="header-search-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: 99, border: '1px solid var(--border)' }}>
            <Search size={16} color="var(--text-secondary)" />
            <input type="text" placeholder="Tìm kiếm..." style={{ border: 'none', background: 'transparent', outline: 'none', width: 120, fontSize: '0.85rem' }} />
          </div>
          <ActionButtons isMobile={false} />
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="mobile-menu-btn mobile-only" 
          onClick={() => setIsMobileMenuOpen(true)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
        >
          <Menu size={24} color="var(--primary)" />
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000 }}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '85%', maxWidth: 360, background: 'white', zIndex: 1001, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)' }}
            >
              <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>Menu</div>
                <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={20} color="var(--text-secondary)" />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => closeMenuAndNavigate(item.id)}
                      style={{ padding: '1rem', background: currentPage === item.id ? '#f0fdfa' : 'transparent', border: 'none', borderRadius: 12, textAlign: 'left', fontWeight: currentPage === item.id ? 700 : 500, color: currentPage === item.id ? 'var(--primary)' : 'var(--text-main)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      {item.label}
                      {currentPage === item.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />}
                    </button>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Tài khoản</p>
                  <ActionButtons isMobile={true} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
