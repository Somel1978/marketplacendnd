import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = location.pathname === '/admin';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img src="/logo.png" alt="Sphaera" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Sphaera Marketplace</h1>
          </Link>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {!isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <Shield className="w-5 h-5" />
                <span>Admin Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}