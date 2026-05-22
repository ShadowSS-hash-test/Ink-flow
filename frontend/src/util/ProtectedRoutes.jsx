import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useUserStore } from '../stores/useUserStore'

const ProtectedRoutes = () => {

   const {user} = useUserStore() 
   
   return user ? <Outlet/> :  <Navigate to= "/login" />
}

export default ProtectedRoutes