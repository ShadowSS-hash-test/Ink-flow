import React from 'react';
import { Home, LayoutDashboard, Settings, LogOut, Feather } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
  return (
    <nav className="bg-gray-900 text-gray-300 p-5 flex flex-col h-screen z-20 shadow-2xl">
      <div className="sidebar-header mb-10 mt-4">
        <Link to={"/"}>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Feather className="text-blue-500" /> Inkflow
          </h3>
        </Link>
      </div>

      <ul className="nav-links flex-grow space-y-2">
        {/* Home Tab */}
        <li>
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
              activeTab === 'home' 
                ? 'bg-blue-600 text-white font-semibold' 
                : 'hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Home size={20} />
            <span>Home</span>
          </button>
        </li>
        
        {/* Boards Tab */}
        <li>
          <button
            onClick={() => setActiveTab('boards')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
              activeTab === 'boards' 
                ? 'bg-blue-600 text-white font-semibold' 
                : 'hover:bg-gray-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} />
            <span>My Boards</span>
          </button>
        </li>

        {/* Settings Tab */}
        <li>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
              activeTab === 'settings' 
                ? 'bg-blue-600 text-white font-semibold' 
                : 'hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </li>
      </ul>

      {/* User Profile Footer */}
      <div className="user-profile border-t border-gray-800 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-gray-800"
          />
          <div>
            <p className="font-semibold text-white leading-tight">{user.name}</p>
            <p className="text-xs text-gray-500">{user.plan}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          title="Log out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;