import React, { useState, useEffect } from 'react';
import SettingsTab from '../components/SettingsTab';
import Sidebar from '../components/Sidebar';
import MyBoards from '../components/MyBoards';
import { LayoutDashboard, ArrowRight, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import { useDrawingStore } from '../stores/useDrawingStore'; 

const UserDashboard = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [pendingDrawType, setPendingDrawType] = useState(null);
  const [joinRoomId, setJoinRoomId] = useState(''); // State for joining existing rooms

  const { user, logout } = useUserStore();
  const { createBoard, loading: creatingBoard } = useDrawingStore();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Open the modal for both Online and Offline modes
  const handleStartDrawing = (drawType) => {
    setPendingDrawType(drawType);
    setShowModal(true);
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!boardTitle.trim()) return;

    const newBoard = await createBoard({ title: boardTitle });

    if (newBoard) {
      setShowModal(false);
      setBoardTitle('');
      navigate('/drawOffline');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="grid grid-cols-[250px_1fr] h-screen font-['Inter',_sans-serif]">
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      <div className="relative flex flex-col h-screen overflow-hidden">
        
        <div className="absolute inset-0 z-0 bg-[url(/dashboard.jpg)] bg-cover bg-center blur-xl scale-110"/>
        <div className="absolute inset-0 z-0 bg-blue-900/20" />

        <main className="relative z-10 flex-1 overflow-y-auto p-8 md:p-12">
          
          {activeTab === 'home' && (
            <>
              <header className="mb-12">
                <h1 className="text-4xl font-bold text-white">Welcome back, {(user.username || user.name || "User").split(' ')[0]}</h1>
                <p className="text-lg text-white mt-2">
                  Ready to capture your next big idea?
                </p>
              </header>

              <div className="panels-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div 
                  onClick={() => handleStartDrawing("offline")}
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

                <div 
                  onClick={() => handleStartDrawing("online")}
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

          
         
              </div>
            </>
          )}

          {activeTab === 'boards' && <MyBoards />}
          {activeTab === 'settings' && <SettingsTab />}

        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                {pendingDrawType === 'offline' ? 'Name your board' : 'Join or Create Room'}
              </h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setJoinRoomId(''); // Reset input on close
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {pendingDrawType === 'offline' ? (
                /* --- OFFLINE FORM --- */
                <form onSubmit={handleCreateBoard}>
                  <div className="mb-6">
                    <label htmlFor="boardTitle" className="block text-sm font-medium text-gray-700 mb-2">
                      Board Title
                    </label>
                    <input
                      type="text"
                      id="boardTitle"
                      value={boardTitle}
                      onChange={(e) => setBoardTitle(e.target.value)}
                      placeholder="e.g., Q3 Brainstorming"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      autoFocus
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!boardTitle.trim() || creatingBoard}
                      className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
                    >
                      {creatingBoard ? 'Creating...' : 'Create & Join'}
                    </button>
                  </div>
                </form>
              ) : (
                /* --- ONLINE FORM --- */
                <div className="flex flex-col gap-5">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      navigate('/draw', { state: { roomID: 'create' } });
                    }}
                    className="w-full px-5 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    Create a New Room
                  </button>
                  
                  <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">or join existing</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                      placeholder="Enter Room ID..."
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && joinRoomId.trim()) {
                          setShowModal(false);
                          navigate('/draw', { state: { roomID: joinRoomId.trim() } });
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (joinRoomId.trim()) {
                          setShowModal(false);
                          navigate('/draw', { state: { roomID: joinRoomId.trim() } });
                        }
                      }}
                      disabled={!joinRoomId.trim()}
                      className="px-6 py-3 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-colors"
                    >
                      Join
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default UserDashboard;