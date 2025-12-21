import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Whiteboard } from './pages/Whiteboard'
import {Routes,Route} from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import { Navbar } from './components/Navbar'
import UserDashboard from './pages/UserDashboard'



function App() {


  return (
    <>

  
     
     <Routes>
      <Route path='/' element={<LandingPage></LandingPage>}></Route>
      <Route path='/login' element={<Login></Login>}></Route>
      <Route path='/signup' element={<Signup></Signup>}></Route>
      <Route path='/draw' element= {<Whiteboard></Whiteboard>}></Route>
      <Route path='/profile' element ={<UserDashboard></UserDashboard>}></Route>
     </Routes>


     
    </>
  )
}

export default App
