import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  Bars3Icon,
  BellIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Debug: Log user data
  console.log('Navbar - isLoggedIn:', isLoggedIn);
  console.log('Navbar - user:', user);

  const handleLogout = async () => {
    await logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Get display name
  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.username) {
      return user.username;
    }
    return 'User';
  };

  const notifications = [
    { id: 1, text: "New past papers added for May/June 2025", time: "2 hours ago", unread: true },
    { id: 2, text: "Biology marking scheme updated", time: "1 day ago", unread: false },
    { id: 3, text: "Your subscription expires in 7 days", time: "2 days ago", unread: true }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section */}
          <div className="flex items-center space-x-6">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <Link to="/" className="flex items-center group">
              <div className="flex items-center space-x-2">
                <img 
                  src="/logo/genib.png" 
                  alt="GenIB" 
                  className="h-10 w-auto group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            </Link>

            {/* Navigation Pills */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link
                to="/papers"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-200"
              >
                Past Papers
              </Link>
              <Link
                to="/question-bank"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Question Bank
              </Link>
              <Link
                to="/exam-builder"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Exam Builder
              </Link>
            </div>
          </div>

          {/* Center - Search bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8 items-center">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search papers, subjects, topics..."
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            {/* Show auth buttons when not logged in */}
            {!isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="hidden sm:block text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <>
                {/* Subscriptions */}
                <div className="hidden xl:block">
                  <Link
                    to="/subscriptions"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Subscriptions
                  </Link>
                </div>

                {/* Action Buttons */}
                <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                  <QuestionMarkCircleIcon className="h-5 w-5" />
                </button>

                <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                  <Cog6ToothIcon className="h-5 w-5" />
                </button>

                {/* Shopping Cart */}
                <Link
                  to="/cart"
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors relative"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-medium">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors relative"
                  >
                    <BellIcon className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div key={notification.id} className={`px-4 py-3 hover:bg-gray-50 transition-colors ${notification.unread ? 'bg-blue-50' : ''}`}>
                            <p className="text-sm text-gray-900">{notification.text}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-3 border-t border-gray-100">
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all notifications</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-3 text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getUserInitials()}
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900">{getDisplayName()}</div>
                      <div className="text-xs text-gray-500">Premium</div>
                    </div>
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {getUserInitials()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Profile Settings
                        </Link>
                        <Link
                          to="/purchases"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          My Purchases
                        </Link>
                        <Link
                          to="/favorites"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          My Favorites
                        </Link>
                        <Link
                          to="/subscriptions"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Subscriptions
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 pt-1">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-4 bg-gray-50 border-t border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers, subjects, topics..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;