import { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import Search from './pages/Search';
import MapPage from './pages/MapPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyAccount from './pages/VerifyAccount';
import ChatWidget from './components/ChatWidget';
import Footer from './components/Footer';
import PropertyDetail from './pages/PropertyDetail';
import Profile from './pages/Profile';

function App() {
  const [currentPage, setCurrentPage] = useState(() => localStorage.getItem('currentPage') || 'home');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || null); // null (guest), 'sale', 'admin'
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    // Nếu truy cập từ URL trực tiếp (từ email)
    if (window.location.pathname === '/reset-password') {
      setCurrentPage('reset_password');
      // Tránh việc ghi đè lại localstorage ngay lập tức thành trang cũ
    } else {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    if (userRole) localStorage.setItem('userRole', userRole);
    else localStorage.removeItem('userRole');
  }, [userRole]);

  useEffect(() => {
    if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
    else localStorage.removeItem('currentUser');
  }, [currentUser]);

  const requireAuth = (Component) => {
    if (!userRole) return <Login setUserRole={setUserRole} setCurrentUser={setCurrentUser} setCurrentPage={setCurrentPage} />;
    return Component;
  };
  const renderPage = () => {
    if (currentPage.startsWith('property_detail_')) {
      const id = currentPage.split('_').slice(2).join('_'); // handles uuid
      return <PropertyDetail id={id} setCurrentPage={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'home': return <Home setCurrentPage={setCurrentPage} />;
      case 'search': return <Search setCurrentPage={setCurrentPage} />;
      case 'map': return <MapPage />;
      case 'login': return <Login setUserRole={setUserRole} setCurrentUser={setCurrentUser} setCurrentPage={setCurrentPage} />;
      case 'register': return <Register setCurrentPage={setCurrentPage} />;
      case 'forgot_password': return <ForgotPassword setCurrentPage={setCurrentPage} />;
      case 'reset_password': return <ResetPassword setCurrentPage={setCurrentPage} />;
      case 'verify': return <VerifyAccount setCurrentPage={setCurrentPage} userEmail={localStorage.getItem('verifyEmail')} />;
      case 'profile': return requireAuth(<Profile currentUser={currentUser} setCurrentPage={setCurrentPage} setCurrentUser={setCurrentUser} />);
      
      // Protected Routes
      case 'dashboard': 
        if (userRole === 'admin') return <AdminDashboard currentUser={currentUser} setCurrentPage={setCurrentPage} setUserRole={setUserRole} setCurrentUser={setCurrentUser} />; // Redirect admin
        return requireAuth(<Dashboard currentUser={currentUser} setCurrentPage={setCurrentPage} setUserRole={setUserRole} setCurrentUser={setCurrentUser} />);
      case 'admin_dashboard': 
        if (userRole !== 'admin') return requireAuth(<Dashboard currentUser={currentUser} setCurrentPage={setCurrentPage} setUserRole={setUserRole} setCurrentUser={setCurrentUser} />); // Redirect sale
        return requireAuth(<AdminDashboard currentUser={currentUser} setCurrentPage={setCurrentPage} setUserRole={setUserRole} setCurrentUser={setCurrentUser} />);

        
      default:
        return (
          <div className="container" style={{ paddingTop: '8rem', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2>Trang <span style={{ color: 'var(--primary-light)' }}>{currentPage}</span> đang được xây dựng</h2>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '2rem' }}
              onClick={() => setCurrentPage('home')}
            >
              Quay lại trang chủ
            </button>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Hide global header on internal dashboards to allow them to use their own full height layout with sidebar */}
      {currentPage !== 'admin_dashboard' && currentPage !== 'dashboard' && (
        <Header currentPage={currentPage} setCurrentPage={setCurrentPage} userRole={userRole} setUserRole={setUserRole} currentUser={currentUser} />
      )}

      {renderPage()}
      
      {/* Floating Chat Widget across all pages (except admin dashboard to avoid clutter, optional) */}
      {currentPage !== 'admin_dashboard' && <ChatWidget />}
      
      {/* Footer across main pages */}
      {currentPage !== 'admin_dashboard' && currentPage !== 'dashboard' && currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'forgot_password' && currentPage !== 'reset_password' && currentPage !== 'verify' && (
        <Footer />
      )}
    </div>
  );
}

export default App;
