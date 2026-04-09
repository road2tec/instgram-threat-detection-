import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  BarChart3,
  AlertTriangle,
  Home,
  Settings,
  User,
  LogOut,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/analytics', icon: Search, label: 'Start Analysis' },
    { path: '/incidents', icon: AlertTriangle, label: 'Incidents' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="sidebar shadow-neuro">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Shield className="logo-icon" size={28} />
          <span className="logo-text">Cyber monitor</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" size={22} />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-user">
        <div className="user-card">
          <div className="user-avatar">
            <User size={22} />
          </div>
          <div className="user-info">
            <div className="user-name">{user?.first_name} {user?.last_name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
        <button 
          className="nav-link logout-btn" 
          onClick={handleLogout}
          style={{ width: '100%', marginTop: '15px', border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          <LogOut size={22} className="nav-icon" />
          <span className="nav-label">Sign Out</span>
        </button>
      </div>
    </div>
  );
}