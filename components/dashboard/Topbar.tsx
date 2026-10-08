'use client';

import { useState } from 'react';
import { Bell, CircleQuestionMark, Search } from 'lucide-react';

interface User {
  id: number;
  name: string;
  username: string;
  phone: string | null;
  role_id: number;
  restaurant_id: number | null;
}

export default function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="group relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
             <Search className='text-gray-500 group-focus-within:text-orange-500 '/>
            </div>
            <input
              type="text"
              placeholder="Search restaurants, users..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-200 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-black"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
             
            <Bell/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                 {/* show notification */}
                </div>
                <div className="px-4 py-2 bg-gray-50 text-center">
                  <button className="text-xs font-medium text-orange-600 hover:text-orange-700">
                    View all
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
           <CircleQuestionMark/>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
              SA
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-gray-900 leading-tight">Super Admin</p>
              <p className="text-[10px] text-gray-500 leading-tight">superadmin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}