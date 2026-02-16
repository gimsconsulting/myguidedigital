'use client';

import { useState, useEffect } from 'react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Afficher le bouton quand on scroll plus de 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Retour en haut"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity"></div>
      {/* Button background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 rounded-full"></div>
      {/* Arrow icon */}
      <svg
        className="relative w-5 h-5 text-white group-hover:-translate-y-0.5 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
