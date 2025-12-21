import React from 'react'

const Toolbutton = ({ label, icon, isActive = false, className = '', ...props }) => {
return (
    <button
      aria-label={label}
      title={label}
      className={`
        p-3 rounded-lg flex items-center justify-center transition-all
        ${isActive 
          ? 'bg-blue-500 text-white' 
          : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'}
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );
}

export default Toolbutton