import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';

function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [user, setUser] = useState({ name: '', picture: '' });
  const navigate = useNavigate();
  const profileMenuTimeout = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('google_token');
    if (token) {
      const decoded = parseJwt(token);
      setUser({
        name: decoded?.name || '',
        picture: decoded?.picture || '',
      });
    }
  }, []);

  const handleProfileMenuEnter = () => {
    clearTimeout(profileMenuTimeout.current);
    setIsProfileMenuOpen(true);
  };

  const handleProfileMenuLeave = () => {
    profileMenuTimeout.current = setTimeout(() => {
      setIsProfileMenuOpen(false);
    }, 500); // 500ms delay before closing
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavigation = (page) => {
    setActivePage(page);
    closeMenu();
    if (page === 'dashboard') navigate('/');
    else if (page === 'create-shipment') navigate('/create-shipment');
    else if (page === 'profile') navigate('/profile');
    else if (page === 'home') navigate('/');
  };

  const isActive = (page) => {
    return activePage === page;
  };

  const handleLogout = () => {
    localStorage.removeItem('google_token');
    localStorage.removeItem('user_id');
    setUser({ name: '', picture: '' });
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <button 
            className="logo-button"
            onClick={() => handleNavigation('home')}
          >
            <span className="logo-text">Trustrack</span>
          </button>
        </div>

        <nav className="nav-desktop">
          <div className="nav-links">
            <button 
              className={`nav-link ${isActive('create-shipment') ? 'active' : ''}`}
              onClick={() => handleNavigation('create-shipment')}
            >
              Create Shipment
            </button>
            <button 
              className={`nav-link ${isActive('dashboard') ? 'active' : ''}`}
              onClick={() => handleNavigation('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-link ${isActive('profile') ? 'active' : ''}`}
              onClick={() => handleNavigation('profile')}
            >
              Profile
            </button>
          </div>
        </nav>

        <div className="user-section">
          <button className="notification-btn">
            <span className="notification-icon">🔔</span>
          </button>
          <div 
            className="user-profile-container"
            onMouseEnter={handleProfileMenuEnter}
            onMouseLeave={handleProfileMenuLeave}
          >
            <div className="user-profile">
              <div className="user-avatar">
                {user.picture ? (
                  <img src={user.picture} alt="avatar" className="avatar-img" />
                ) : (
                  <span>{getInitials(user.name)}</span>
                )}
              </div>
              <span className="user-name">{user.name}</span>
            </div>
            {isProfileMenuOpen && (
              <div className="profile-dropdown">
                <button className="dropdown-item" onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>

        <button 
          className={`mobile-menu-btn ${isMenuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <nav className={`nav-mobile ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-links">
            <button 
              className={`mobile-nav-link ${isActive('create-shipment') ? 'active' : ''}`}
              onClick={() => handleNavigation('create-shipment')}
            >
              Create Shipment
            </button>
            <button 
              className={`mobile-nav-link ${isActive('dashboard') ? 'active' : ''}`}
              onClick={() => handleNavigation('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`mobile-nav-link ${isActive('profile') ? 'active' : ''}`}
              onClick={() => handleNavigation('profile')}
            >
              Profile
            </button>
            <button 
              className="mobile-nav-link"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
