import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useUserStore } from '../stores/useUserStore';

export const Login = () => {
  const { login, loading } = useUserStore();
  
  // 1. Added isLoaded state for the fade-in animation
  const [isLoaded, setIsLoaded] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // 2. Trigger the mount animation as soon as the page loads
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="flex flex-col min-h-screen relative bg-gray-900"> 
      
      {/* === Blurred Image Background === */}
      <div 
        aria-hidden="true" 
        className="
          absolute inset-0 z-0 
          bg-[url(https://media.istockphoto.com/id/469937444/photo/paintbrushes-on-artist-canvas-covered-with-oil-paints.jpg?s=612x612&w=0&k=20&c=u5Ac53dhkpKrAzz21faeDTC79mtuMVCCSX9xsCJp2qo=)] 
          bg-cover
          blur-lg
        "
      />
      {/* === Dark Overlay === */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 z-10 bg-gray-900/70" 
      />

      <Navbar />

      <div className="relative z-20 flex flex-col min-h-screen">
        <main className="flex-1 flex items-center justify-center p-4">
          
          {/* === Login Card === */}
          {/* 3. Changed 'loading' to 'isLoaded' so the form actually shows up! */}
          <div className={`
            w-full max-w-md
            transition-all duration-1000 ease-out
            ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
          `}>
            <form 
              onSubmit={handleSubmit}
              className="
                bg-black/40 
                backdrop-blur-xl 
                border border-white/10 
                shadow-2xl 
                rounded-2xl 
                p-8 md:p-10
              "
            >
              <h1 className="text-white text-3xl font-bold mb-2">
                Welcome back
              </h1>
              <p className="text-gray-300 mb-6"> 
                Log in to continue to Inkflow.
              </p>

              {/* Email Input */}
              <div className="mb-4 relative">
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-200 mb-2" 
                >
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"> 
                    <Mail size={18} />
                  </span>
                  <input 
                    type="email" 
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="
                      w-full pl-10 pr-4 py-3 
                      bg-white/10 
                      text-white 
                      border border-white/20 
                      rounded-lg 
                      placeholder-gray-400 
                      focus:outline-none 
                      focus:ring-2 
                      focus:ring-blue-400 
                      focus:border-blue-400
                    " 
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-6 relative">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-200 mb-2" 
                >
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"> 
                    <Lock size={18} />
                  </span>
                  <input 
                    type="password" 
                    id="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="
                      w-full pl-10 pr-4 py-3 
                      bg-white/10 
                      text-white 
                      border border-white/20 
                      rounded-lg 
                      placeholder-gray-400 
                      focus:outline-none 
                      focus:ring-2 
                      focus:ring-blue-400 
                      focus:border-blue-400
                    "
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                className="
                  w-full 
                  py-3 
                  bg-blue-600 
                  text-white 
                  font-bold 
                  rounded-lg 
                  shadow-lg 
                  hover:bg-blue-700 
                  transition-all duration-300 
                  transform hover:-translate-y-0.5
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-blue-400 
                  focus:ring-offset-2 
                  focus:ring-offset-gray-900
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>

              {/* Sign up Link */}
              <p className="text-center text-gray-300 text-sm mt-6"> 
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-blue-300 hover:text-white">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
          
        </main>
      </div>
      
    </div>
  );
}

export default Login;