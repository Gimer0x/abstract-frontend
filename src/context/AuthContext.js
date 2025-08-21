import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const login = useCallback(newToken => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  }, []);

  const updateUser = useCallback(userData => {
    setUser(userData);
  }, []);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (token) {
        try {
          console.log('Checking auth status with token');
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/auth/status`,
          );
          console.log('Auth status response:', response.data);
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          // Only logout if it's a 401 error (invalid token)
          if (error.response && error.response.status === 401) {
            console.log('Token is invalid, logging out');
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
          }
        }
      } else {
        // No token, user is not authenticated
        console.log('No token found, user not authenticated');
        setUser(null);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
      isAuthenticated: !!user,
    }),
    [user, token, loading, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
