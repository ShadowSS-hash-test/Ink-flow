import React, { useState, useEffect } from 'react'
import SettingsTab from '../components/SettingsTab';
import Sidebar from '../components/Sidebar';
import MyBoards from '../components/MyBoards';
import { LayoutDashboard, ArrowRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [activeTab, setActiveTab] = useState('home');

  const [user, setUser] = useState({
    name: "John Smith",
    plan: "Free Plan",
    avatar: "https://placehold.co/40x40/2563eb/ffffff?text=JS",
    email: "john@example.com"
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleStartDrawing = () => {
    navigate('/draw');
  };

  const handleLogout = () => {
    console.log("Logging out...");
    navigate('/login');
  };

  return (
    <div className="grid grid-cols-[250px_1fr] h-screen font-['Inter',_sans-serif]">
      
      {/* 1. Sidebar Component */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* 2. Main Content Area */}
      <div className="relative flex flex-col h-screen overflow-hidden">
        
        {/* Background Layers */}
        <div className="absolute inset-0 z-0 bg-[url(/dashboard.jpg)] bg-cover bg-center blur-xl scale-110"/>
        <div className="absolute inset-0 z-0 bg-blue-900/20" />

        <main className="relative z-10 flex-1 overflow-y-auto p-8 md:p-12">
          
          {/* --- TAB: HOME --- */}
          {activeTab === 'home' && (
            <>
              <header className="mb-12">
                <h1 className="text-4xl font-bold text-white">Welcome back, {user.name.split(' ')[0]}</h1>
                <p className="text-lg text-white mt-2">
                  Ready to capture your next big idea?
                </p>
              </header>

              <div className="panels-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Draw Alone Panel */}
                <div 
                  onClick={handleStartDrawing}
                  className={`col-span-1 md:col-span-2 lg:col-span-1 p-8 rounded-3xl shadow-xl bg-blue-600/80 text-white backdrop-blur-md border border-white/20 cursor-pointer transform-gpu transition-all ease-out duration-500 delay-100 hover:scale-[1.02] hover:bg-blue-600 ${isLoaded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
                >
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-3xl font-bold mb-2">Draw Alone</h3>
                      <p className="text-blue-100 text-lg">Start a private session just for you.</p>
                    </div>
                    <div className="mt-8 flex justify-end">
                      <span className="p-3 bg-white/20 rounded-full"><ArrowRight /></span>
                    </div>
                  </div>
                </div>

                {/* Draw Together Panel */}
                <div 
                  onClick={handleStartDrawing}
                  className={`col-span-1 md:col-span-2 lg:col-span-1 p-8 rounded-3xl shadow-xl bg-gray-900/80 text-white backdrop-blur-md border border-white/20 cursor-pointer transform-gpu transition-all ease-out duration-500 delay-200 hover:scale-[1.02] hover:bg-gray-900 ${isLoaded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
                >
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-3xl font-bold mb-2">Draw Together</h3>
                      <p className="text-gray-300 text-lg">Invite your team to a shared canvas.</p>
                    </div>
                    <div className="mt-8 flex justify-end">
                      <span className="p-3 bg-white/20 rounded-full"><Users /></span>
                    </div>
                  </div>
                </div>

                {/* Recent Boards Panels */}
                <div className={`p-6 rounded-3xl shadow-sm hover:shadow-md bg-white/60 text-gray-800 backdrop-blur-md border border-white/40 cursor-pointer transform-gpu transition-all ease-out duration-500 delay-300 ${isLoaded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><LayoutDashboard size={24} /></div>
                    <span className="text-xs font-medium text-gray-500 bg-white/50 px-2 py-1 rounded-full">2h ago</span>
                  </div>
                  <h4 className="text-xl font-bold mb-1">Marketing Brainstorm</h4>
                  <p className="text-sm text-gray-600">4 collaborators</p>
                </div>
                
                <div className={`p-6 rounded-3xl shadow-sm hover:shadow-md bg-white/60 text-gray-800 backdrop-blur-md border border-white/40 cursor-pointer transform-gpu transition-all ease-out duration-500 delay-400 ${isLoaded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-2xl"><LayoutDashboard size={24} /></div>
                    <span className="text-xs font-medium text-gray-500 bg-white/50 px-2 py-1 rounded-full">1d ago</span>
                  </div>
                  <h4 className="text-xl font-bold mb-1">Website Wireframe</h4>
                  <p className="text-sm text-gray-600">Private board</p>
                </div>

              </div>
            </>
          )}

          {/* --- TAB: BOARDS --- */}
          {activeTab === 'boards' && (<MyBoards/> )
          }

          {/* --- TAB: SETTINGS --- */}
          {activeTab === 'settings' && (
            <SettingsTab user={user} setUser={setUser} />
          )}

        </main>
      </div>

    </div>
  )
}

export default UserDashboard;