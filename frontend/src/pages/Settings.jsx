import React from 'react';
import { User, Shield, Key, Bell, Activity, CheckCircle, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

export default function Settings() {
  const { user } = useAuth();
  
  // Format role and date
  const userRole = user?.role === 'admin' ? 'System Administrator' : 'Forensic Investigator';
  const lastActive = user?.last_login ? new Date(user.last_login).toLocaleString() : 'Just now';
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User Profile';

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1 className="page-title">Profile & Settings</h1>
        <p className="page-description">Manage your account and monitor system status.</p>
      </div>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="settings-card profile-main">
          <div className="profile-identity">
            <div className="profile-avatar">
              <User size={40} />
            </div>
            <div className="profile-info">
              <h2>{fullName}</h2>
              <span className="user-role">{userRole}</span>
              <p className="user-email">{user?.email}</p>
            </div>
            <button className="edit-profile-btn">Edit Profile</button>
          </div>
          
          <div className="profile-details-list">
            <div className="detail-item">
              <span className="label">Last Active</span>
              <span className="value">{lastActive}</span>
            </div>
            <div className="detail-item">
              <span className="label">Verification Status</span>
              <span className="value verified">
                <CheckCircle size={14} /> Verified
              </span>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="settings-card">
          <h3 className="card-subtitle"><Shield size={18} /> Security & Access</h3>
          <div className="settings-options-list">
            <div className="option-item">
              <div className="option-text">
                <strong>Password Management</strong>
                <p>Change or reset your security password.</p>
              </div>
              <button className="option-action">Change</button>
            </div>
            <div className="option-item">
              <div className="option-text">
                <strong>Two-Factor Authentication</strong>
                <p>Add an extra layer of security to your account.</p>
              </div>
              <div className="toggle-switch active"></div>
            </div>
          </div>
        </div>

        {/* System Health Monitor */}
        <div className="settings-card system-health">
          <h3 className="card-subtitle"><Activity size={18} /> System Status</h3>
          <div className="health-metrics">
            <div className="health-item active">
              <div className="status-indicator"></div>
              <span>Backend API (8080)</span>
              <span className="status-label">Online</span>
            </div>
            <div className="health-item active">
              <div className="status-indicator"></div>
              <span>Simulator (5003)</span>
              <span className="status-label">Active</span>
            </div>
            <div className="health-item warning">
              <div className="status-indicator"></div>
              <span>Database Sync</span>
              <span className="status-label">Normal</span>
            </div>
          </div>
        </div>

        {/* Device Management */}
        <div className="settings-card device-list">
          <h3 className="card-subtitle"><Smartphone size={18} /> Logged Devices</h3>
          <div className="device-item">
            <div className="device-icon"><Smartphone size={20} /></div>
            <div className="device-info">
              <strong>Windows Desktop - Current</strong>
              <p>Pune, India | IP: 192.168.1.15</p>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-footer-actions">
         <button className="save-all-btn">Save Preferences</button>
      </div>
    </div>
  );
}
