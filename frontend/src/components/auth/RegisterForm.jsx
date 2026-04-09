import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle, User, Mail, Activity, Brain, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthForms.css';

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    clearErrors
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setSubmitStatus('submitting');
    clearError();

    const result = await registerUser({
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName
    });

    if (result.success) {
      setSubmitStatus('success');
      // Small delay to show success state before redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
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

  // Simple password validation - just minimum length
  const validatePassword = (value) => {
    if (value.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return true;
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-card register-card">
        {/* Header */}
        <div className="auth-form-header">
          <div className="auth-form-logo">
            <Shield className="auth-logo-icon" />
            <h1>Cyber-Intel Monitor IG</h1>
          </div>
          <div className="auth-form-title">
            <h2>Join the IG Defense</h2>
            <p>Protect your Instagram ecosystem with AI-powered monitoring</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {/* Name Fields Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <div className="input-with-icon">
                <User className="input-icon" size={20} />
                <input
                  id="firstName"
                  type="text"
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="First name"
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters'
                    },
                    onChange: (e) => handleInputChange(e)
                  })}
                />
              </div>
              {errors.firstName && (
                <div className="form-error">
                  <AlertCircle size={16} />
                  {errors.firstName.message}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <div className="input-with-icon">
                <User className="input-icon" size={20} />
                <input
                  id="lastName"
                  type="text"
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="Last name"
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters'
                    },
                    onChange: (e) => handleInputChange(e)
                  })}
                />
              </div>
              {errors.lastName && (
                <div className="form-error">
                  <AlertCircle size={16} />
                  {errors.lastName.message}
                </div>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={20} />
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
            </div>
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
                placeholder="Create a strong password"
                {...register('password', {
                  required: 'Password is required',
                  validate: validatePassword,
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

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="password-input-container">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                  onChange: (e) => handleInputChange(e)
                })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="form-error">
                <AlertCircle size={16} />
                {errors.confirmPassword.message}
              </div>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                {...register('acceptTerms', {
                  required: 'You must accept the terms and conditions'
                })}
              />
              <span className="checkmark"></span>
              I agree to the{' '}
              <Link to="/terms" className="auth-link">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="auth-link">
                Privacy Policy
              </Link>
            </label>
            {errors.acceptTerms && (
              <div className="form-error">
                <AlertCircle size={16} />
                {errors.acceptTerms.message}
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
              ? 'Account Created!'
              : submitStatus === 'submitting'
              ? 'Creating Account...'
              : 'Create Account'
            }
          </button>
        </form>

        {/* Sign In Link */}
        <div className="auth-form-alternate">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link-primary">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Side Panel */}
      <div className="auth-side-panel">
        <div className="side-panel-content">
          <h3>Join the Cyber Defense Network</h3>
          <div className="side-panel-features">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Shield size={20} />
              </div>
              <div className="feature-text">
                <strong>Advanced Threat Intel</strong>
                <p>Detect phishing and malware coordination in real-time.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Activity size={20} />
              </div>
              <div className="feature-text">
                <strong>Live Feed Analysis</strong>
                <p>Monitor your Instagram feed with 94.15% ML accuracy.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Brain size={20} />
              </div>
              <div className="feature-text">
                <strong>AI-Powered Insights</strong>
                <p>Random Forest model classifies incidents instantly.</p>
              </div>
            </div>
          </div>

          <div className="side-panel-testimonial">
            <blockquote>
              "This platform has transformed our cybersecurity posture. The real-time threat detection is unparalleled."
            </blockquote>
            <cite>— Sarah Johnson, CISO at TechCorp</cite>
          </div>
        </div>
      </div>
    </div>
  );
}