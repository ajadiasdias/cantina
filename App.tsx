
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole } from './types';
import { db } from './services/dbService';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ChecklistScreen from './screens/ChecklistScreen';
import AdminPanel from './screens/AdminPanel';
import UserManagement from './screens/UserManagement';
import SectorManagement from './screens/SectorManagement';
import TaskManagement from './screens/TaskManagement';
import ReportsScreen from './screens/ReportsScreen';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

interface ProtectedRouteProps {
  // Fix: Make children optional to satisfy TypeScript when used as a wrapper in JSX
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}

// Fix: Using React.FC to ensure proper handling of children in React 18+ environments
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedUserId = localStorage.getItem('current_user_id');
      if (savedUserId) {
        const users = await db.getUsers();
        const found = users.find(u => u.id === savedUserId);
        if (found) setUser(found);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string) => {
    const users = await db.getUsers();
    const found = users.find(u => u.email === email);
    if (found) {
      setUser(found);
      localStorage.setItem('current_user_id', found.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('current_user_id');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginScreen />} />
          <Route path="/" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
          <Route path="/checklist/:sectorId" element={<ProtectedRoute><ChecklistScreen /></ProtectedRoute>} />
          
          <Route path="/admin" element={<ProtectedRoute allowedRoles={[UserRole.GESTOR]}><AdminPanel /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={[UserRole.GESTOR]}><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/sectors" element={<ProtectedRoute allowedRoles={[UserRole.GESTOR]}><SectorManagement /></ProtectedRoute>} />
          <Route path="/admin/tasks" element={<ProtectedRoute allowedRoles={[UserRole.GESTOR]}><TaskManagement /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={[UserRole.GESTOR]}><ReportsScreen /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}
