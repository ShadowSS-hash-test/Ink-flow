import React, { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';

const MyBoards = ({ onCreateBoard }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
       
       <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">My Boards</h1>
          <p className="text-gray-300">Resume your recent sessions</p>
        </div>
        
        {/* Search / Filter */}
        <div className="flex gap-2">
           <select className="bg-black/20 border border-white/10 text-white text-sm rounded-lg p-2 focus:outline-none">
             <option>Newest First</option>
             <option>Oldest First</option>
           </select>
        </div>
       </header>

       {/* Boards Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         
         {/* Mock Data Mapping */}
         {[1, 2, 3, 4, 5].map((item) => (
           <div 
             key={item}
             className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-900/20 cursor-pointer"
           >
             {/* Thumbnail Placeholder */}
             <div className="h-40 w-full bg-gray-800/50 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60" />
               
               {/* Date Badge */}
               <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-xs text-white px-2 py-1 rounded-full border border-white/10">
                 2 days ago
               </div>
             </div>

             {/* Content */}
             <div className="p-5">
               <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-blue-400 transition-colors">
                 Untitled Board #{item}
               </h3>
               <div className="flex items-center justify-between text-sm text-gray-400">
                 <span>Private</span>
                 <span className="flex items-center gap-1">
                   <div className="w-2 h-2 rounded-full bg-green-500" /> Active
                 </span>
               </div>
             </div>

             {/* Quick Action Button (appears on hover) */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={onCreateBoard}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
                >
                  Open
                </button>
             </div>
           </div>
         ))}

         {/* "Create New" Card */}
         <button 
           onClick={onCreateBoard}
           className="flex flex-col items-center justify-center h-full min-h-[250px] border-2 border-dashed border-white/10 rounded-2xl hover:border-blue-500/50 hover:bg-blue-600/5 transition-all group"
         >
           <div className="p-4 bg-white/5 rounded-full mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors text-gray-400">
             <LayoutDashboard size={24} />
           </div>
           <span className="text-gray-400 font-medium group-hover:text-white">Create New Board</span>
         </button>

       </div>
    </div>
  );
};

export default MyBoards;