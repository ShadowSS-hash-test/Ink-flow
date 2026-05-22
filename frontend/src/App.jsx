import { useState, useEffect } from 'react'
import { Routes, Route } from "react-router-dom"
import './App.css'
import { Whiteboard } from './pages/Whiteboard'
import LandingPage from "./pages/LandingPage"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import UserDashboard from './pages/UserDashboard'
import ProtectedRoutes from './util/ProtectedRoutes'
import { useUserStore } from './stores/useUserStore'
import { Toaster } from 'react-hot-toast'
import { Navigate } from 'react-router-dom'
import {OfflineWhiteboard} from './pages/OfflineWhiteboard'

function App() {
  const { user,checkAuth, checkingAuth } = useUserStore();
   
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // === ADD THIS BLOCK ===
  // While we are checking the user's cookies on initial load, show a loader
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        {/* You can replace this with a nice spinner component later! */}
        <div className="text-white text-xl">Loading Inkflow...</div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={!user ? <Login /> : <Navigate to = '/'/> } />
        <Route path='/signup' element={!user? <Signup />:<Navigate to = '/'/> } />
        
        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoutes />}>
          <Route path='/draw' element={<Whiteboard />} />
           <Route path='/drawOffline' element={<OfflineWhiteboard />} />
          <Route path='/profile' element={<UserDashboard />} />
        </Route>
      </Routes>

           <Toaster />
    </>
  )
}

export default App