import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  addUser: (user: User) => void;
  switchUser: (userId: string) => void;
}

const defaultUser: User = {
  id: 'default-user',
  name: 'User',
  email: 'user@aaruchudar.com'
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load users from localStorage
  const [users, setUsers] = useState<User[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('brain_gym_users');
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Failed to load users from storage:', error);
    }
    return [defaultUser];
  });

  const [currentUser, setCurrentUserState] = useState<User>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('brain_gym_current_user');
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Failed to load current user from storage:', error);
    }
    return users[0] || defaultUser;
  });

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('brain_gym_current_user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Failed to save current user to storage:', error);
    }
  };

  const addUser = (user: User) => {
    const updatedUsers = [...users];
    const existingIndex = updatedUsers.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      updatedUsers[existingIndex] = user;
    } else {
      updatedUsers.push(user);
    }
    setUsers(updatedUsers);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('brain_gym_users', JSON.stringify(updatedUsers));
      }
    } catch (error) {
      console.error('Failed to save users to storage:', error);
    }
  };

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, users, addUser, switchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
