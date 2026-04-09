import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, User, Mail, Lock, UserPlus, RefreshCw, AlertTriangle, ArrowLeft, Brain, Activity, Globe } from 'lucide-react';
import './Auth.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await register(name, email, password);
      if (result.success) {
        navigate('/login');
      } else {
        setError(result.message || 'Registration failed. Check your data.');
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
          <h3>Join the Global <br />Intelligence Network</h3>
          <p>Enrol your device to begin identifying social media cyber-incidents in real-time. Join thousands of degree-level researchers.</p>
          
          <div className="side-panel-features">
            <div className="feature-item">
              <div className="feature-icon-wrapper"><Brain size={18} /></div>
              <span>Advanced Neural Classification</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper"><Activity size={18} /></div>
              <span>Real-time Investigative Feed</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper"><Globe size={18} /></div>
              <span>Secure Forensic Reporting Hub</span>
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
             <h1>Researcher Enrolment</h1>
             <p>Register your investigator credentials below.</p>
          </div>

          {error && (
            <div className="error-msg">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input 
                  type="text" 
                  className="auth-input" 
                  placeholder="Investigator Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Intel Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  className="auth-input" 
                  placeholder="researcher@intel.hub" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Create Access Key</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  className="auth-input" 
                  placeholder="Choose a strong password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <RefreshCw className="spin" size={20} /> : <UserPlus size={20} />}
              {loading ? 'Processing Enrolment...' : 'Initialize Secure Access'}
            </button>
          </form>

          <div className="auth-footer">
            Already registered? <Link to="/login" className="auth-link">Sign In Now</Link>
          </div>
        </div>
      </div>
    </div>
  );
}