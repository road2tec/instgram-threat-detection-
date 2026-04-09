import React, { createContext, useContext, useReducer, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authService } from '../services/api';

// Authentication action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  TOKEN_REFRESH: 'TOKEN_REFRESH'
};

// Initial authentication state
const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

// Authentication reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.access_token,
        refreshToken: action.payload.refresh_token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.TOKEN_REFRESH:
      return {
        ...state,
        accessToken: action.payload.access_token
      };

    default:
      return state;
  }
}

// Create authentication context
const AuthContext = createContext(null);

// Authentication provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Cookie configuration
  const COOKIE_OPTIONS = {
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax',
    expires: 30 // 30 days
  };

  // Save tokens to cookies
  const saveTokensToStorage = (accessToken, refreshToken) => {
    if (accessToken) {
      Cookies.set('access_token', accessToken, { ...COOKIE_OPTIONS, expires: 1 }); // 1 day
    }
    if (refreshToken) {
      Cookies.set('refresh_token', refreshToken, COOKIE_OPTIONS); // 30 days
    }
  };

  // Remove tokens from cookies
  const removeTokensFromStorage = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  };

  // Get tokens from cookies
  const getTokensFromStorage = () => {
    return {
      accessToken: Cookies.get('access_token'),
      refreshToken: Cookies.get('refresh_token')
    };
  };

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const data = await authService.login(email, password);

      // Save tokens to cookies
      saveTokensToStorage(data.access_token, data.refresh_token);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: data
      });

      return { success: true, user: data.user };

    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.response?.data?.error || error.message || 'Login failed'
      });

      return { success: false, error: error.response?.data?.error || error.message || 'Login failed' };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const data = await authService.register(userData);

      // Save tokens to cookies
      saveTokensToStorage(data.access_token, data.refresh_token);

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: data
      });

      return { success: true, user: data.user };

    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: error.response?.data?.error || error.message || 'Registration failed'
      });

      return { success: false, error: error.response?.data?.error || error.message || 'Registration failed' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint if token exists
      const { accessToken } = getTokensFromStorage();

      if (accessToken) {
        await authService.logout(accessToken);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clean up local state and cookies
      removeTokensFromStorage();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Refresh token function
  const refreshAccessToken = async () => {
    const { refreshToken } = getTokensFromStorage();

    if (!refreshToken) {
      return false;
    }

    try {
      const data = await authService.refreshToken(refreshToken);

      // Update access token in cookies
      saveTokensToStorage(data.access_token, refreshToken);

      dispatch({
        type: AUTH_ACTIONS.TOKEN_REFRESH,
        payload: data
      });

      return true;

    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      logout();
      return false;
    }
  };

  // Verify token and get user profile
  const verifyAndLoadUser = async () => {
    const { accessToken } = getTokensFromStorage();

    if (!accessToken) {
      return false;
    }

    try {
      const data = await authService.verify(accessToken);

      dispatch({
        type: AUTH_ACTIONS.SET_USER,
        payload: data.user
      });

      // Also update the tokens in state
      const tokens = getTokensFromStorage();
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: data.user,
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken
        }
      });

      return true;

    } catch (error) {
      console.error('User verification failed:', error);

      // Try to refresh token and retry
      try {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return verifyAndLoadUser(); // Retry with new token
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      logout();
      return false;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Initialize authentication state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      try {
        await verifyAndLoadUser();
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Provide authentication context value
  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    accessToken: state.accessToken,

    // Actions
    login,
    register,
    logout,
    refreshAccessToken,
    clearError,

    // Helper functions
    getTokensFromStorage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication context
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// Protected route component
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page
    window.location.href = '/login';
    return null;
  }

  return children;
}

export default AuthContext;