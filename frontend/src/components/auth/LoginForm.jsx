import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle, Activity, Brain, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthForms.css';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitStatus('submitting');
    clearError();

    const result = await login(data.email, data.password);

    if (result.success) {
      setSubmitStatus('success');
      // Small delay to show success state before redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } else {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  const handleInputChange = () => {
    if (error) clearError();
    if (submitStatus === 'error') setSubmitStatus(null);
    clearErrors();
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        {/* Header */}
        <div className="auth-form-header">
          <div className="auth-form-logo">
            <Shield className="auth-logo-icon" />
            <h1>Cyber-Intel Monitor IG</h1>
          </div>
          <div className="auth-form-title">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue monitoring</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                },
                onChange: (e) => handleInputChange(e)
              })}
            />
            {errors.email && (
              <div className="form-error">
                <AlertCircle size={16} />
                {errors.email.message}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  },
                  onChange: (e) => handleInputChange(e)
                })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <div className="form-error">
                <AlertCircle size={16} />
                {errors.password.message}
              </div>
            )}
          </div>

          {/* Global Error */}
          {error && (
            <div className="form-error global-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || submitStatus === 'submitting'}
            className={`auth-submit-btn ${submitStatus === 'success' ? 'success' : ''} ${
              submitStatus === 'error' ? 'error' : ''
            }`}
          >
            {submitStatus === 'submitting' && (
              <div className="btn-spinner"></div>
            )}
            {submitStatus === 'success' && (
              <CheckCircle size={20} />
            )}
            {submitStatus === 'success'
              ? 'Login Successful!'
              : submitStatus === 'submitting'
              ? 'Signing In...'
              : 'Sign In'
            }
          </button>

          {/* Forgot Password Link */}
          <div className="auth-form-footer">
            <Link to="/forgot-password" className="auth-link">
              Forgot your password?
            </Link>
          </div>
        </form>

        {/* Sign Up Link */}
        <div className="auth-form-alternate">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link-primary">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Side Panel */}
      <div className="auth-side-panel">
        <div className="side-panel-content">
          <h3>Secure Cyber Threat Monitoring</h3>
          <div className="side-panel-features">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Shield size={20} />
              </div>
              <span>Real-time threat detection</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Brain size={20} />
              </div>
              <span>AI-powered analysis (94.15%)</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Lock size={20} />
              </div>
              <span>Secure IG Integration</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Activity size={20} />
              </div>
              <span>24/7 Monitoring coverage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}