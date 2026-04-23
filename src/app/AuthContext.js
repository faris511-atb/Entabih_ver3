/**
 * src/context/AuthContext.js
 * Converted from: app/context/AuthContext.tsx
 *
 * Changes:
 *  - TSX → JS (removed TypeScript types)
 *  - No expo-router imports
 *  - All logic identical to original
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV from '../config';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem('token');
      const username = await AsyncStorage.getItem('username');

      if (token && username) {
        setSession(true);
        setUser({ username });
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${ENV.FASTAPI_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return false;

      await AsyncStorage.setItem('token', data.access_token);
      await AsyncStorage.setItem('username', data.username);
      await AsyncStorage.setItem('user_id', String(data.user_id));
      setUser({ username: data.username });
      setSession(true);
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await fetch(`${ENV.FASTAPI_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.detail === 'Email already registered') {
          return { success: false, message: 'duplicate' };
        }
        return { success: false, message: 'unknown' };
      }

      await AsyncStorage.setItem('username', name);
      await AsyncStorage.setItem('token', data.token ?? '');
      await AsyncStorage.setItem('user_id', String(data.user_id ?? ''));

      setUser({ username: name, email });
      setSession(true);
      return { success: true };
    } catch {
      return { success: false, message: 'network' };
    }
  };

  const signout = async () => {
    await AsyncStorage.multiRemove(['token', 'username', 'user_id']);
    setUser(null);
    setSession(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, login, signup, signout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
