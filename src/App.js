import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeModeProvider } from './contexts/ThemeContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import Notifications from './components/Notifications';
import Layout from './components/Layout';
import Goals from './components/Goals';
import Recurring from './components/Recurring';
import Reports from './components/Reports';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Help from './components/Help';
import axios from 'axios';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { unreadCount } = useNotifications();
  if (loading) return null;
  return user ? <Layout notificationCount={unreadCount}>{children}</Layout> : <Navigate to="/login" />;
};

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const App = () => {
  return (
    <SnackbarProvider maxSnack={3}>
      <ThemeModeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <PrivateRoute>
                      <TransactionList />
                    </PrivateRoute>
                  }
                />
                <Route path="/goals" element={<PrivateRoute><Goals /></PrivateRoute>} />
                <Route path="/recurring" element={<PrivateRoute><Recurring /></PrivateRoute>} />
                <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                <Route path="/help" element={<PrivateRoute><Help /></PrivateRoute>} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ThemeModeProvider>
    </SnackbarProvider>
  );
};

export default App;
