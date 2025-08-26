import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Login } from './components/LoginAndRegister/Login';
import { Register } from './components/LoginAndRegister/Register';
import { DocumentList } from './components/ProfileAndDocument/DocumentList';
import { DocumentEditor } from './components/Editor/DocumentEditor';
import * as authApi from './api/auth';
import { startConnection, stopConnection, sendMessage, hubConnection } from './api/signalr';
import { LoginModel, RegisterModel } from './models/auth';
import { UserProfile } from './components/ProfileAndDocument/UserProfile';

const AppContent: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    if (savedToken) {
      setToken(savedToken);
      startConnection()
        .then(() => {

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
      const response = await authApi.login(loginModel);
      const { accessToken, refreshToken } = response;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(accessToken);
      await new Promise((r) => setTimeout(r, 1000));
      await startConnection();
      navigate('/documents');
    } catch (error) {
      throw error;
    }
  };

  const handleRegister = async (registerModel: RegisterModel) => {
    try {
      const response = await authApi.register(registerModel);
      const { accessToken, refreshToken } = response;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(accessToken);
      await new Promise((r) => setTimeout(r, 1000));
      await startConnection();
      navigate('/documents');
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    await stopConnection();
    navigate('/login');
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
        <Route
  path="/profile"
  element={token ? <UserProfile /> : <Navigate to="/login" />}
/>
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
