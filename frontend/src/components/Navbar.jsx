import { Link, useLocation } from 'react-router-dom'
import { Shield, User, LogOut, Settings } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  const isActiveRoute = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <Shield size={24} />
          <span>Cyber Monitor</span>
        </Link>

        {isAuthenticated && (
          <>
            <ul className="navbar-menu">
              <li>
                <Link
                  to="/dashboard"
                  className={`navbar-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/incidents"
                  className={`navbar-link ${isActiveRoute('/incidents') ? 'active' : ''}`}
                >
                  Incidents
                </Link>
              </li>
              <li>
                <Link
                  to="/analytics"
                  className={`navbar-link ${isActiveRoute('/analytics') ? 'active' : ''}`}
                >
                  Analytics
                </Link>
              </li>
            </ul>

            <div className="navbar-user">
              <div className="user-info">
                <span className="user-name">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="user-role">{user?.role}</span>
              </div>

              <div className="user-menu">
                <button
                  className="user-avatar"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="User menu"
                >
                  <User size={20} />
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-user-info">
                        <div className="dropdown-name">
                          {user?.first_name} {user?.last_name}
                        </div>
                        <div className="dropdown-email">{user?.email}</div>
                      </div>
                    </div>

                    <div className="dropdown-menu">
                      <button className="dropdown-item">
                        <User size={16} />
                        <span>Profile</span>
                      </button>
                      <button className="dropdown-item">
                        <Settings size={16} />
                        <span>Settings</span>
                      </button>
                      <hr className="dropdown-separator" />
                      <button className="dropdown-item logout" onClick={handleLogout}>
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Backdrop */}
              {showUserMenu && (
                <div
                  className="dropdown-backdrop"
                  onClick={() => setShowUserMenu(false)}
                />
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
