/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Bell, Search, Settings, User, ChevronDown, X } from 'lucide-react';
// import useOutsideClick from '../../hooks/useOutsideClick';
import { useAuth, useUI } from '../../store';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, removeNotification } = useUI();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  // const menuRef = useRef<HTMLDivElement>(null);

  // useOutsideClick(menuRef, () => setIsProfileOpen(false), isProfileOpen);


  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">

          {/* Search Bar */}
          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-start">
            <div className="max-w-lg w-full lg:max-w-xs">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all duration-200"
                  placeholder="Search anything..."
                  type="search"
                />
              </div>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 relative"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-lg bg-white border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  </div>
                  <div className="py-2">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notification: any) => (
                        <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            </div>
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
              <Settings className="h-5 w-5" />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 p-2 hover:bg-gray-100 transition-all duration-200"
              >
                <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-sm font-medium text-white">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="font-medium text-gray-900 text-sm">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">Premium Member</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''
                  }`} />
              </button>

              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white border border-gray-200 z-50">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 rounded-t-xl">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-blue-100">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Your Profile
                    </a>
                    <a
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Settings
                    </a>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
