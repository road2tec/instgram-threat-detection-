import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Mail, Lock, LogIn, RefreshCw, AlertTriangle, ArrowLeft, Brain, Activity, Globe } from 'lucide-react';
import './Auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Incorrect credentials. Access denied.');
      }
    } catch (err) {
      setError('Connection refused. Is the Node server online?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Investigative Sidebar */}
      <div className="auth-side-panel">
        <div className="side-panel-content">
          <div className="side-panel-badge">
            <Shield size={14} />
            <span>94.15% ML Classification Accuracy</span>
          </div>
          <h3>Secure Cyber <br />Intelligence Monitoring</h3>
          <p>Protect your organization from social media vulnerabilities. Real-time scanning for Phishing, DDoS, and Malware coordination.</p>
          
          <div className="side-panel-features">
            <div className="feature-item">
              <div className="feature-icon-wrapper"><Brain size={18} /></div>
              <span>Neural-based Threat Recognition</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper"><Activity size={18} /></div>
              <span>Real-time Investigative Analytics</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper"><Globe size={18} /></div>
              <span>Global Threat Feed Integration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Area */}
      <div className="auth-form-area">
        <div className="auth-form-inner">
          <Link to="/" className="back-to-home">
             <ArrowLeft size={16} />
             Back to Platform
          </Link>

          <div className="auth-header">
             <h1>Researcher Access</h1>
             <p>Access the unified forensic dashboard.</p>
          </div>

          {error && (
            <div className="error-msg">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Intel Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  className="auth-input" 
                  placeholder="researcher@intel.hub" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Access Key</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  id="password"
                  name="password"
                  className="auth-input" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <RefreshCw className="spin" size={20} /> : <LogIn size={20} />}
              {loading ? 'Authenticating...' : 'Sign In Now'}
            </button>
          </form>

          <div className="auth-footer">
            New investigator? <Link to="/register" className="auth-link">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}