import { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import Search from './pages/Search';
import MapPage from './pages/MapPage';
import Projects from './pages/Projects';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import PostProperty from './pages/PostProperty';
import Login from './pages/Login';
import ChatWidget from './components/ChatWidget';
import Footer from './components/Footer';
import PropertyDetail from './pages/PropertyDetail';

function App() {
  const [currentPage, setCurrentPage] = useState(() => localStorage.getItem('currentPage') || 'home');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || null); // null (guest), 'sale', 'admin'
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
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
      case 'projects': return <Projects />;
      case 'login': return <Login setUserRole={setUserRole} setCurrentUser={setCurrentUser} setCurrentPage={setCurrentPage} />;
      
      // Protected Routes
      case 'dashboard': 
        if (userRole === 'admin') return <AdminDashboard currentUser={currentUser} setCurrentPage={setCurrentPage} setUserRole={setUserRole} setCurrentUser={setCurrentUser} />; // Redirect admin
        return requireAuth(<Dashboard currentUser={currentUser} setCurrentPage={setCurrentPage} setUserRole={setUserRole} setCurrentUser={setCurrentUser} />);
      case 'admin_dashboard': 
        if (userRole !== 'admin') return requireAuth(<Dashboard currentUser={currentUser} setCurrentPage={setCurrentPage} setUserRole={setUserRole} setCurrentUser={setCurrentUser} />); // Redirect sale
        return requireAuth(<AdminDashboard currentUser={currentUser} setCurrentPage={setCurrentPage} setUserRole={setUserRole} setCurrentUser={setCurrentUser} />);
      case 'post': 
        return requireAuth(<PostProperty currentUser={currentUser} />);
        
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
        <Header currentPage={currentPage} setCurrentPage={setCurrentPage} userRole={userRole} setUserRole={setUserRole} />
      )}

      {renderPage()}
      
      {/* Floating Chat Widget across all pages (except admin dashboard to avoid clutter, optional) */}
      {currentPage !== 'admin_dashboard' && <ChatWidget />}
      
      {/* Footer across main pages */}
      {currentPage !== 'admin_dashboard' && currentPage !== 'dashboard' && currentPage !== 'login' && (
        <Footer />
      )}
    </div>
  );
}

export default App;
