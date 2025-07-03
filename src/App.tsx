import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { DocumentList } from './components/DocumentList';
import { DocumentEditor } from './components/DocumentEditor';
import * as authApi from './api/auth';
import { startConnection, stopConnection, sendMessage, hubConnection } from './api/signalr';
import { LoginModel, RegisterModel } from './models/auth';

const AppContent: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    if (savedToken) {
      setToken(savedToken);

      startConnection()
        .then(() => {
          console.log('SignalR started successfully');

          // Подписка на серверные события
          hubConnection.on('DocumentCreated', (document) => {
            console.log('DocumentCreated received:', document);
          });

          hubConnection.on('AddedToDocument', (userIds) => {
            console.log('AddedToDocument received:', userIds);
          });

          hubConnection.on('ReceiveBlock', (block) => {
            console.log('ReceiveBlock received:', block);
          });

          hubConnection.on('BlockEdited', (block) => {
            console.log('BlockEdited received:', block);
          });
        })
        .catch((err) => {
          console.error('SignalR Start Error:', err);
          setError('Failed to connect to real-time updates. Check your network or token.');
        });
    } else {
      stopConnection().catch((err) => console.error('SignalR Stop Error:', err));
    }

    return () => {
      stopConnection().catch((err) => console.error('SignalR Stop Error:', err));
    };
  }, []);

  const handleLogin = async (loginModel: LoginModel) => {
    try {
      setError(null);
      const response = await authApi.login(loginModel);
      const { accessToken, refreshToken } = response;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(accessToken);
      await new Promise((r) => setTimeout(r, 1000));
      await startConnection();
      navigate('/documents');
    } catch (error: any) {
      setError(error.message || 'Login failed');
    }
  };

  const handleRegister = async (registerModel: RegisterModel) => {
    try {
      setError(null);
      const response = await authApi.register(registerModel);
      const { accessToken, refreshToken } = response;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(accessToken);
      await new Promise((r) => setTimeout(r, 1000));
      await startConnection();
      navigate('/documents');
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setToken(null);
      await stopConnection();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route
          path="/login"
          element={!token ? (
            <div className="flex items-center justify-center h-screen">
              <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">CollaboCraft</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <Login onLogin={handleLogin} />
              </div>
            </div>
          ) : (
            <Navigate to="/documents" />
          )}
        />
        <Route
          path="/register"
          element={!token ? (
            <div className="flex items-center justify-center h-screen">
              <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">CollaboCraft</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <Register onRegister={handleRegister} />
              </div>
            </div>
          ) : (
            <Navigate to="/documents" />
          )}
        />
        <Route
          path="/documents"
          element={token ? <DocumentList onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/document/:documentId"
          element={token ? <DocumentEditor /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to={token ? "/documents" : "/login"} />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
