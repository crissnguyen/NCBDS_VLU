import { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import Search from './pages/property/Search';
import News from './pages/News';
import Dashboard from './pages/user/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyAccount from './pages/auth/VerifyAccount';
import ChatWidget from './components/ChatWidget';
import Footer from './components/Footer';
import PropertyDetail from './pages/property/PropertyDetail';
import Profile from './pages/user/Profile';
import Contact from './pages/Contact';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined' && (window.location.pathname.includes('/reset-password') || window.location.search.includes('token='))) {
      return 'reset_password';
    }
    return localStorage.getItem('currentPage') || 'home';
  });
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || null); // null (guest), 'sale', 'admin'
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    // Nếu truy cập từ URL trực tiếp (từ email)
    if (window.location.pathname.includes('/reset-password') || window.location.search.includes('token=')) {
      setCurrentPage('reset_password');
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
      case 'news': return <News setCurrentPage={setCurrentPage} />;
      case 'contact': return <Contact />;
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

  const isAuthPage = ['login', 'register', 'forgot_password', 'reset_password', 'verify'].includes(currentPage);
  const isDashboardPage = ['admin_dashboard', 'dashboard'].includes(currentPage);

  return (
    <div className="app-container">
      {/* Hide global header on internal dashboards and auth pages */}
      {!isDashboardPage && !isAuthPage && (
        <Header currentPage={currentPage} setCurrentPage={setCurrentPage} userRole={userRole} setUserRole={setUserRole} currentUser={currentUser} />
      )}

      {renderPage()}
      
      {/* Floating Chat Widget across all pages except admin dashboard */}
      {currentPage !== 'admin_dashboard' && <ChatWidget />}
      
      {/* Footer across main pages */}
      {!isDashboardPage && !isAuthPage && (
        <Footer />
      )}
    </div>
  );
}

export default App;
