import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Feather, LogIn } from 'lucide-react';

/**
 * A responsive navbar component that becomes opaque on scroll.
 * This fixes the issue of text overlapping content.
 */
export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Function to handle the scroll event
    const handleScroll = () => {
      // Set state to true if user has scrolled more than 10px
      setIsScrolled(window.scrollY > 10);
    };

    // Add scroll event listener when the component mounts
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <nav className={`
      sticky top-0 z-50 
      w-full
      transition-all duration-300 ease-in-out
      ${isScrolled 
        ? 'bg-black/50 backdrop-blur-lg border-b border-white/10 shadow-lg' 
        : 'bg-transparent border-b border-transparent'}
    `}>
      <div className="container mx-auto flex justify-between items-center p-4 sm:px-8">
        
        {/* === Left Side: Brand Logo === */}
        <Link 
          to="/" 
          className="flex items-center gap-2 group transition-all duration-200 hover:scale-105"
          title="Home"
        >
          <Feather size={24} className="text-blue-400 group-hover:rotate-12 transition-transform duration-200" />
          <span className="font-bold text-xl text-white group-hover:text-blue-300 transition-colors duration-200">
            Inkflow
          </span>
        </Link>

        {/* === Right Side: Auth Buttons === */}
        <div className="flex items-center gap-4">
          <Link 
            to="/signup" 
            className="
              text-gray-200 hover:text-white
              font-medium 
              transition-all duration-200 
              hover:-translate-y-0.5
            "
          >
            Sign up
          </Link>
          <Link 
            to="/login" 
            className={`
              group 
              flex items-center gap-2 
              px-4 py-2 
              border rounded-lg 
              text-gray-100 
              hover:text-white
              hover:shadow-lg
              active:bg-black/30
              font-medium 
              transition-all duration-200 
              hover:scale-105 active:scale-100
              ${isScrolled 
                ? 'border-white/20 hover:bg-black/20 hover:border-white/40' 
                : 'border-white/30 hover:bg-white/10 hover:border-white/50'}
            `}
          >
            Log in
            <LogIn 
              size={18} 
              className="
                text-gray-300 
                group-hover:text-white
                transition-colors duration-200
              " 
            />
          </Link>
        </div>

      </div>
    </nav>
  );
}
