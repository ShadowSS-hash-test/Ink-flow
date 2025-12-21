import React, { useState, useEffect } from 'react'
// Import lucide-react icons
import { Home, LayoutDashboard, Settings, LogOut, ArrowRight, Feather, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
const UserDashboard = () => {

  const [isLoaded, setIsLoaded] = useState(false);

  // CHANGED: Use useEffect to set isLoaded to true on mount
  useEffect(() => {
    // This triggers the animation after the component is rendered
    setIsLoaded(true);
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="grid grid-cols-[250px_1fr] h-screen font-['Inter',_sans-serif]">
      
      {/* ==================== COLUMN 1: SIDEBAR ==================== */}
      <nav className="bg-gray-900 text-gray-300 p-5 flex flex-col h-screen z-20 shadow-2xl">
        <div className="sidebar-header mb-10 mt-4">
            <Link to={"/"}>

                      <h3 className="text-2xl font-bold text-white flex items-center gap-2">

         
            <Feather className="text-blue-500" /> Inkflow
          </h3>

            </Link>

        </div>
        
        <ul className="nav-links flex-grow space-y-2">
          {/* Active Link */}
          <li>
            <a 
              href="#" 
              className="flex items-center gap-3 p-3 rounded-lg bg-blue-600 text-white font-semibold transition-all"
            >
              <Home size={20} />
              <span>Home</span>
            </a>
          </li>
          
          {/* Other Links */}
          <li>
            <a 
              href="#" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-all"
            >
              <LayoutDashboard size={20} />
              <span>My Boards</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-all"
            >
              <Settings size={20} />
              <span>Settings</span>
            </a>
          </li>
        </ul>
        
        {/* User Profile Section with Avatar */}
        <div className="user-profile border-t border-gray-800 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Placeholder Avatar Image */}
            <img 
              src="https://placehold.co/40x40/2563eb/ffffff?text=JS" 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-gray-800"
            />
            <div>
              <p className="font-semibold text-white leading-tight">John Smith</p>
              <p className="text-xs text-gray-500">Free Plan</p>
            </div>
          </div>
          <button 
            className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            title="Log out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* ==================== COLUMN 2: MAIN AREA ==================== */}
      <div className="relative flex flex-col h-screen overflow-hidden">

        {/* --- Layer 0: The Background Image --- */}
        <div 
          className="
            absolute inset-0 z-0 
            bg-[url(/dashboard.jpg)]
            bg-cover bg-center 
            blur-xl scale-110
          "
        />

        {/* --- Layer 1: Overlay/Tint --- */}
        <div className="absolute inset-0 z-0 bg-blue-900/20" />

        {/* --- Layer 2: Scrollable Content --- */}
        <main className="relative z-10 flex-1 overflow-y-auto p-8 md:p-12">
          
          {/* Header */}
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-white">Welcome back, John</h1>
            <p className="text-lg text-white mt-2">
              Ready to capture your next big idea?
            </p>
          </header>

          {/* 3. THE GLASS PANELS CONTAINER */}
          <div className="panels-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Panel 1: Draw Alone (Blue Glass) */}
            <div 
              className={`
                col-span-1 md:col-span-2 lg:col-span-1 p-8 rounded-3xl shadow-xl
                bg-blue-600/80 text-white
                backdrop-blur-md border border-white/20
                cursor-pointer
                
                transform-gpu transition-all ease-out duration-500 delay-100
                hover:scale-[1.02]
                
                ${isLoaded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
              `}
            >
              <div className="h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-bold mb-2">Draw Alone</h3>
                  <p className="text-blue-100 text-lg">Start a private session just for you.</p>
                </div>
                <div className="mt-8 flex justify-end">
                  <span className="p-3 bg-white/20 rounded-full">
                    <ArrowRight />
                  </span>
                </div>
              </div>
            </div>

            {/* Panel 2: Draw Together (Dark Glass) */}
            <div 
              className={`
                col-span-1 md:col-span-2 lg:col-span-1 p-8 rounded-3xl shadow-xl
                bg-gray-900/80 text-white
                backdrop-blur-md border border-white/20
                cursor-pointer

                transform-gpu transition-all ease-out duration-500 delay-200
                hover:scale-[1.02]

                ${isLoaded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
              `}
            >
              <div className="h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-bold mb-2">Draw Together</h3>
                  <p className="text-gray-300 text-lg">Invite your team to a shared canvas.</p>
                </div>
                <div className="mt-8 flex justify-end">
                  <span className="p-3 bg-white/20 rounded-full">
                    <Users />
                  </span>
                </div>
              </div>
            </div>

            {/* Panel 3: Recent Board (Light Glass) */}
            <div 
              className={`
                p-6 rounded-3xl shadow-sm hover:shadow-md
                bg-white/60 text-gray-800
                backdrop-blur-md border border-white/40
                
                transform-gpu transition-all ease-out duration-500 delay-300
                
                ${isLoaded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
              `}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                  <LayoutDashboard size={24} />
                </div>
                <span className="text-xs font-medium text-gray-500 bg-white/50 px-2 py-1 rounded-full">
                  2h ago
                </span>
              </div>
              <h4 className="text-xl font-bold mb-1">Marketing Brainstorm</h4>
              <p className="text-sm text-gray-600">4 collaborators</p>
            </div>
            
            {/* Panel 4: Recent Board (Light Glass) */}
            <div 
              className={`
                p-6 rounded-3xl shadow-sm hover:shadow-md
                bg-white/60 text-gray-800
                backdrop-blur-md border border-white/40
                
                transform-gpu transition-all ease-out duration-500 delay-400
                
                ${isLoaded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
              `}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
                  <LayoutDashboard size={24} />
                </div>
                <span className="text-xs font-medium text-gray-500 bg-white/50 px-2 py-1 rounded-full">
                  1d ago
                </span>
              </div>
              <h4 className="text-xl font-bold mb-1">Website Wireframe</h4>
              <p className="text-sm text-gray-600">Private board</p>
            </div>

          </div>
        </main>
      </div>

    </div>
  )
}

export default UserDashboard;