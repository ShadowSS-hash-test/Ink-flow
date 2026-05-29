import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrawingStore } from '../stores/useDrawingStore';
import { LayoutDashboard, Clock, FilePenLine, ArrowRight } from 'lucide-react';

const MyBoards = () => {
  const navigate = useNavigate();
  
  // Pull what we need from your Zustand store
  const { boards, fetchBoards, loading, setCurrentBoard } = useDrawingStore();

  // Fetch boards when the component loads
  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  // Handle opening an existing board
  const handleOpenBoard = (board) => {
    setCurrentBoard(board);
    // Navigating to the "offline" route since they are opening it alone first.
    // They can invite people later if you build a sharing feature!
    navigate('/drawOffline'); 
  };


// Helper to format the PostgreSQL timestamp cleanly
  // Helper to format the PostgreSQL timestamp cleanly
const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Create a Date object from the mangled string Express sent
    const date = new Date(dateString);

    // Brute-force add 5 hours and 30 minutes to correct the backend's mistake
    date.setHours(date.getHours() + 5);
    date.setMinutes(date.getMinutes() + 30);

    const options = { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    
    return date.toLocaleString('en-IN', options);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white">My Boards</h2>
          <p className="text-blue-100 mt-2">Pick up where you left off</p>
        </div>
      </header>

      {/* Loading State */}
      {loading && boards.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && boards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
          <FilePenLine size={48} className="text-white/50 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No boards yet</h3>
          <p className="text-blue-100 text-center max-w-sm">
            You haven't created any drawings. Go back to the Home tab to start your first board!
          </p>
        </div>
      )}

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map((board, index) => (
          <div 
            key={board.id}
            onClick={() => handleOpenBoard(board)}
            className="p-6 rounded-3xl shadow-sm hover:shadow-xl bg-white/70 text-gray-800 backdrop-blur-xl border border-white/50 cursor-pointer transform-gpu transition-all ease-out duration-300 hover:-translate-y-1 hover:bg-white/90 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <LayoutDashboard size={24} />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-white/60 px-3 py-1.5 rounded-full shadow-sm">
                <Clock size={12} />
                <span>{formatDate(board.updated_at)}</span>
              </div>
            </div>
            
            <h4 className="text-xl font-bold mb-2 truncate" title={board.title}>
              {board.title}
            </h4>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200/50">
              
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600 transition-colors">
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBoards;