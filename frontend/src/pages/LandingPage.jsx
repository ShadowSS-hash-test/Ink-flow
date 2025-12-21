import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Users, ArrowRight, Pencil, Cloud, Check } from 'lucide-react';
import { Navbar } from '../components/Navbar';

/**
 * Custom Hook: useAnimateOnScroll
 *
 * This hook uses the IntersectionObserver API to detect when an element
 * is visible in the viewport.
 *
 * @param {object} options - IntersectionObserver options (e.g., threshold, rootMargin)
 * @param {boolean} options.triggerOnce - If true, the observer will unobserve after firing once.
 * @returns {[React.RefObject, boolean]} - A ref to attach to the element and a boolean indicating visibility.
 */
const useAnimateOnScroll = (options = { triggerOnce: true, threshold: 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);

        if (options.triggerOnce && ref.current) {
          observer.unobserve(ref.current);
        }
      }
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }


    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);

  return [ref, isVisible];
};


const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // --- Hooks for Scroll Animations ---
  // We create a ref and a visibility state for each section
  // that we want to animate as it scrolls into view.
  const [featuresSectionRef, isFeaturesSectionVisible] = useAnimateOnScroll({ triggerOnce: true, threshold: 0.2 });
  const [howItWorksSectionRef, isHowItWorksSectionVisible] = useAnimateOnScroll({ triggerOnce: true, threshold: 0.2 });
  const [ctaSectionRef, isCtaVisible] = useAnimateOnScroll({ triggerOnce: true, threshold: 0.2 });


  return (
    // This main container has the default dark blue background
    // and establishes the stacking context.
    <div className="flex flex-col min-h-screen relative bg-blue-900 font-['Inter',_sans-serif]">

  
      <div
        aria-hidden="true"
        className="
          absolute inset-0 z-0 
          bg-[url(../../public/landingpage.jpg)]
          bg-cover bg-center bg-fixed 
          blur-lg
        "
      />
      {/* === Dark Overlay === */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-blue-900/70 bg-fixed"
      />

      {/* === All Page Content === */}
      {/* This sits on top of the overlay (z-20) */}
      <div className="relative z-20 flex flex-col min-h-screen">
        <Navbar />

        <main>
          {/* === Hero Section === */}
          {/* This section animates ON LOAD using 'isLoaded' */}
          <div className="relative h-screen flex items-center overflow-hidden">
            <div className="container mx-auto px-4 sm:px-8">
              <div className="max-w-3xl">
                <h1 className={`
                  text-4xl md:text-6xl 
                  font-bold 
                  text-white
                  leading-tight
                  transition-all duration-1200 ease-out
                  ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}
                `}>
                  Bring Your Ideas to Life. <br />
                  <span className="text-blue-300">Together.</span>
                </h1>
                <p className={`
                  mt-6 text-lg text-white max-w-xl
                  transition-all duration-1200 ease-out delay-200
                  ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}
                `}>
                  Welcome to Inkflow. The simple, real-time collaborative whiteboard
                  that syncs your creativity. Start a solo sketch or
                  invite your team.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="mt-12 flex flex-col sm:flex-row gap-6">

                <Link
                  to="/draw"
                  className={`
                    group flex-1 
                    bg-blue-600 text-white 
                    p-6 rounded-lg 
                    shadow-lg hover:shadow-xl 
                    hover:bg-blue-700
                    transform hover:-translate-y-1
                    transition-all duration-700 ease-out delay-300
                    ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <User size={24} />

                    <span className="text-xl font-semibold">Draw Alone</span>
                  </div>
                  <p className="mt-2 text-blue-100">
                    Start a private session just for you.
                  </p>
                  <span className="mt-4 flex items-center gap-2 font-medium text-blue-50 group-hover:gap-3 transition-all">
                    Start sketching <ArrowRight size={18} />
                  </span>
                </Link>
                <Link
                  to="/draw"
                  className={`
                    group flex-1 
                    bg-gray-800 text-white 
                    p-6 rounded-lg 
                    shadow-lg hover:shadow-xl 
                    hover:bg-gray-900 
                    transform hover:-translate-y-1
                    transition-all duration-700 ease-out delay-500
                    ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Users size={24} />
                    <span className="text-xl font-semibold">Draw Together</span>
                  </div>
                  <p className="mt-2 text-gray-300">
                    Invite your team to a shared canvas.
                  </p>
                  <span className="mt-4 flex items-center gap-2 font-medium text-gray-100 group-hover:gap-3 transition-all">
                    Create a room <ArrowRight size={18} />
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 sm:px-8">
            <div className="h-px max-w-5xl mx-auto bg-gradient-to-r from-transparent via-blue-300/30 to-transparent"></div>
          </div>

          {/* === Features Section === */}
          {/* This section animates ON SCROLL using 'isFeaturesSectionVisible' */}
          <section
            ref={featuresSectionRef} // <-- Attach ref here
            className="relative z-20 py-20 md:py-24"
          >
            <div className="container mx-auto px-4 sm:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className={`
                  text-3xl md:text-4xl font-bold text-white
                  transition-all duration-700 ease-out
                  ${isFeaturesSectionVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}
                `}>
                  Everything you need to collaborate
                </h2>
                <p className={`
                  mt-4 text-lg text-blue-100
                  transition-all duration-700 ease-out delay-100
                  ${isFeaturesSectionVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}
                `}>
                  A simple, powerful, and fast toolkit for your ideas.
                </p>
              </div>

              <div className="mt-16 grid md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className={`
                  bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg
                  transition-all duration-700 ease-out delay-200
                  ${isFeaturesSectionVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}
                `}>
                  <div className="p-3 bg-blue-600/20 rounded-full w-12 h-12 flex items-center justify-center border border-blue-500">
                    <Users size={24} className="text-blue-300" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">Real-time Collaboration</h3>
                  <p className="mt-2 text-gray-300">
                    Draw with your team in perfect sync. See every stroke as it happens.
                  </p>
                </div>
                {/* Feature 2 */}
                <div className={`
                  bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg
                  transition-all duration-700 ease-out delay-300
                  ${isFeaturesSectionVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}
                `}>
                  <div className="p-3 bg-blue-600/20 rounded-full w-12 h-12 flex items-center justify-center border border-blue-500">
                    <Pencil size={24} className="text-blue-300" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">Simple & Powerful Tools</h3>
                  <p className="mt-2 text-gray-300">
                    All the tools you need, nothing you don't. Pen, eraser, and colors.
                  </p>
                </div>
                {/* Feature 3 */}
                <div className={`
                  bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg
                  transition-all duration-700 ease-out delay-400
                  ${isFeaturesSectionVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}
                `}>
                  <div className="p-3 bg-blue-600/20 rounded-full w-12 h-12 flex items-center justify-center border border-blue-500">
                    <Cloud size={24} className="text-blue-300" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">Save to the Cloud</h3>
                  <p className="mt-2 text-gray-300">
                    Save your creations to your profile and access them from anywhere.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* === Line Divider === */}
          <div className="container mx-auto px-4 sm:px-8">
            <div className="h-px max-w-5xl mx-auto bg-gradient-to-r from-transparent via-blue-300/30 to-transparent"></div>
          </div>

          {/* === How It Works Section === */}
          {/* This section animates ON SCROLL using 'isHowItWorksSectionVisible' */}
          <section
            ref={howItWorksSectionRef} // <-- Attach ref here
            className="relative z-20 py-20 md:py-24"
          >
            <div className="container mx-auto px-4 sm:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className={`
                  text-3xl md:text-4xl font-bold text-white
                  transition-all duration-700 ease-out
                  ${isHowItWorksSectionVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}
                `}>
                  Get started in seconds
                </h2>
              </div>

              <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
                {/* Step 1 */}
                <div className={`
                  transition-all duration-700 ease-out delay-100
                  ${isHowItWorksSectionVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}
                `}>
                  <div className="flex justify-center">
                    <div className="p-4 bg-gray-700/50 rounded-full w-16 h-16 flex items-center justify-center border-2 border-white/10">
                      <span className="text-2xl font-bold text-white">1</span>
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">Create a Room</h3>
                  <p className="mt-2 text-gray-300">
                    Just click "Draw Together" to start a new session.
                  </p>
                </div>
                {/* Step 2 */}
                <div className={`
                  transition-all duration-700 ease-out delay-200
                  ${isHowItWorksSectionVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}
                `}>
                  <div className="flex justify-center">
                    <div className="p-4 bg-gray-700/50 rounded-full w-16 h-16 flex items-center justify-center border-2 border-white/10">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">Share the Link</h3>
                  <p className="mt-2 text-gray-300">
                    Send the unique room URL to your friends or colleagues.
                  </p>
                </div>
                {/* Step 3 */}
                <div className={`
                  transition-all duration-700 ease-out delay-300
                  ${isHowItWorksSectionVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}
                `}>
                  <div className="flex justify-center">
                    <div className="p-4 bg-gray-700/50 rounded-full w-16 h-16 flex items-center justify-center border-2 border-white/10">
                      <Check size={32} className="text-white" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">Start Collaborating</h3>
                  <p className="mt-2 text-gray-300">
                    That's it! Everyone in the room can draw instantly.
                  </p>
                </div>
              </div>
            </div>
          </section>


          {/* === Line Divider === */}
          <div className="container mx-auto px-4 sm:px-8">
            <div className="h-px max-w-5xl mx-auto bg-gradient-to-r from-transparent via-blue-300/30 to-transparent"></div>
          </div>

          {/* === Final CTA Section === */}
          {/* This section animates ON SCROLL using 'isCtaVisible' */}
          <section
            ref={ctaSectionRef} // <-- Attach ref here
            className="relative z-20 py-20 md:py-32"
          >
            <div className="container mx-auto px-4 sm:px-8">
              <div className={`
                max-w-3xl mx-auto text-center 
                bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-10 md:p-16 shadow-lg
                transition-all duration-700 ease-out
                ${isCtaVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}
              `}>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Ready to start drawing?
                </h2>
                <p className="mt-4 text-lg text-blue-100">
                  Create an account for free. No credit card required.
                </p>
                <Link
                  to="/signup"
                  className="
                    mt-8 inline-block 
                    px-8 py-4 
                    bg-blue-600 text-white 
                    font-bold text-lg 
                    rounded-lg 
                    shadow-lg hover:shadow-xl 
                    hover:bg-blue-700 
                    transform hover:-translate-y-1 
                    transition-all duration-300
                  "
                >
                  Sign Up for Free
                </Link>
              </div>
            </div>
          </section>

        </main>

        {/* === Footer === */}
        <footer className="relative z-20 py-8 ">
          <div className="container mx-auto px-4 sm:px-8 text-center text-white">
            <p>&copy; {new Date().getFullYear()} Inkflow. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;