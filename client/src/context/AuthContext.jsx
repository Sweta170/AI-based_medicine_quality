import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef(null);

  // Keep ref in sync with state for interceptors
  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  // Request interceptor to attach access token
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (tokenRef.current) {
          config.headers['Authorization'] = `Bearer ${tokenRef.current}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token expiry (401)
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and not retried yet
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            // Attempt to refresh the token
            const { data } = await api.post('/auth/refresh');
            const newAccessToken = data.accessToken;

            setAccessToken(newAccessToken);
            tokenRef.current = newAccessToken;

            // Re-run original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh token failed/expired -> log user out
            console.error('Refresh token expired, logging out...');
            logoutLocal();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check auth state on mount (silent refresh)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try refreshing token
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.accessToken);
        tokenRef.current = data.accessToken;

        // Fetch current user details
        const userRes = await api.get('/auth/me');
        setUser(userRes.data);
      } catch (err) {
        console.log('No active session found.');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      setAccessToken(data.accessToken);
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      setAccessToken(data.accessToken);
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    } finally {
      setLoading(false);
    }
  };

  const logoutLocal = () => {
    setUser(null);
    setAccessToken(null);
    tokenRef.current = null;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      logoutLocal();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
