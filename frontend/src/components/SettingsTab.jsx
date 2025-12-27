import React, { useState, useEffect } from 'react'
import { User, Shield, ArrowRight, Save } from 'lucide-react';

const SettingsTab = ({ user, setUser }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  user = {name: "John"}

  return (
    <div className={`max-w-4xl mx-auto transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
       <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-300">Manage your account preferences</p>
       </header>

       <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-8">
         <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
           <User className="text-blue-400"/> Profile
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
             <label className="text-sm text-gray-300">Display Name</label>
             <input 
                type="text" 
                value={user.name} 
                onChange={(e) => setUser({...user, name: e.target.value})}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
             />
           </div>
           <div className="space-y-2">
             <label className="text-sm text-gray-300">Email Address</label>
             <input 
                type="email" 
                value={user.email} 
                readOnly
                className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-gray-400 cursor-not-allowed"
             />
           </div>
         </div>
       </div>

       <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
         <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
           <Shield className="text-green-400"/> Security
         </h2>
         <div className="space-y-4">
           <button className="flex items-center justify-between w-full p-4 bg-black/20 rounded-xl hover:bg-black/30 transition-all text-left">
             <span className="text-white">Change Password</span>
             <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">Last changed 30d ago</span>
           </button>
           <button className="flex items-center justify-between w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-left group">
             <span className="text-red-300 group-hover:text-red-200">Delete Account</span>
             <ArrowRight size={16} className="text-red-300 group-hover:text-red-200" />
           </button>
         </div>
       </div>

       <div className="mt-8 flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all">
            <Save size={18}/> Save Changes
          </button>
       </div>
     </div>
  )
}

export default SettingsTab;