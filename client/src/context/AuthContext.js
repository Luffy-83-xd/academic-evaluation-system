import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { io } from 'socket.io-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const socket = useRef();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async (authToken) => {
    try {
        const response = await api.get('/notifications', { headers: { Authorization: authToken } });
        setNotifications(response.data.data);
    } catch (error) {
        console.error("Failed to fetch notifications", error);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      fetchNotifications(token);

      // Connect to the socket server
      socket.current = io('http://localhost:8080');
      // Let the server know which user has connected
      socket.current.emit('addUser', parsedUser.id);
      
      // Set up the listener for new notifications
      socket.current.on('newNotification', (newNotification) => {
        // Add the new notification to the start of the list
        setNotifications(prev => [newNotification, ...prev]);
      });
    }
    
    // Disconnect when the component unmounts or token changes
    return () => {
        if (socket.current) {
            socket.current.disconnect();
        }
    };
  }, [token, fetchNotifications]);

  const login = async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password, role });
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        // Setting the token will trigger the useEffect to connect the socket
        setToken(token);
        if (user.role === 'student') {
          navigate('/student/documents');
        } else if (user.role === 'proctor') {
          navigate('/proctor/documents');
        }
      }
      return response.data;
    } catch (error) {
      return error.response.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setNotifications([]);
    if (socket.current) socket.current.disconnect();
    navigate('/login');
  };

  const markNotificationsAsRead = async () => {
    try {
        await api.put('/notifications/mark-read', {}, { headers: { Authorization: token }});
        setNotifications(prev => prev.map(n => ({...n, isRead: true })));
    } catch (error) {
        console.error("Failed to mark notifications as read", error);
    }
  };

  const updateUserInContext = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout, socket, notifications, markNotificationsAsRead, updateUserInContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;