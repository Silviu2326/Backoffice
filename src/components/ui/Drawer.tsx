import React, { useState, useEffect } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  side?: 'left' | 'right';
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, children, title, side = 'right' }) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    // Give time for the transition to complete before calling onClose
    setTimeout(onClose, 300);
  };

  const transformClasses = side === 'left'
    ? (isVisible ? 'translate-x-0' : '-translate-x-full')
    : (isVisible ? 'translate-x-0' : 'translate-x-full');

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ease-in-out
        ${isVisible ? 'bg-black bg-opacity-50' : 'bg-black bg-opacity-0 pointer-events-none'}`}
      onClick={handleClose}
    >
      <div
        className={`fixed top-0 ${side === 'left' ? 'left-0' : 'right-0'} w-full md:w-[400px] h-screen bg-[#2C2C2C] shadow-lg shadow-black/70
          transform transition-transform duration-300 ease-in-out
          ${transformClasses}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the drawer
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl">
            &times;
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)]"> {/* Adjust height based on header */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
