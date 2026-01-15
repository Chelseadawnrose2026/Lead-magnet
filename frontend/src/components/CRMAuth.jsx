import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Auth Context
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/crm/auth/me`, {
        withCredentials: true
      });
      setUser(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      setUser(null);
      setLoading(false);
      return null;
    }
  };

  const login = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/crm';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/crm/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    navigate('/crm/login');
  };

  return { user, setUser, loading, setLoading, checkAuth, login, logout };
};

// Login Page
export const CRMLogin = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7B3B3B 0%, #5a2a2a 100%)' }}>
      <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#7B3B3B' }}>Chelsea Flynn CRM</h1>
        <p className="text-gray-600 mb-8">Manage your contacts, leads, and speaking engagements</p>
        
        <button
          onClick={login}
          className="w-full py-3 px-6 rounded-lg text-white font-semibold flex items-center justify-center gap-3 hover:opacity-90 transition"
          style={{ backgroundColor: '#7B3B3B' }}
          data-testid="google-login-btn"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
        
        <p className="mt-6 text-sm text-gray-500">
          Access restricted to authorized users only
        </p>
      </div>
    </div>
  );
};

// Auth Callback
export const CRMAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = React.useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (sessionIdMatch) {
        const sessionId = sessionIdMatch[1];
        
        try {
          const response = await axios.post(
            `${API_URL}/api/crm/auth/session`,
            { session_id: sessionId },
            { withCredentials: true }
          );
          
          navigate('/crm', { state: { user: response.data.user } });
        } catch (error) {
          console.error('Auth error:', error);
          navigate('/crm/login');
        }
      } else {
        navigate('/crm/login');
      }
    };

    processAuth();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7B3B3B 0%, #5a2a2a 100%)' }}>
      <div className="text-white text-xl">Authenticating...</div>
    </div>
  );
};

export default { useAuth, CRMLogin, CRMAuthCallback };
