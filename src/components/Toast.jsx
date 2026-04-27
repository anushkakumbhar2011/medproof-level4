import React, { useEffect } from 'react'

export default function Toast({ type = 'success', message, onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const configs = {
    success: {
      bg: 'bg-green-600',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      )
    },
    error: {
      bg: 'bg-red-600',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      )
    }
  }

  const config = configs[type]

  return (
    <div 
      className={`fixed bottom-6 right-6 ${config.bg} text-white px-4 py-3 rounded-button shadow-lg flex items-center gap-3 animate-slide-in-up max-w-md z-50`}
      role="alert"
    >
      {config.icon}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button 
        onClick={onClose}
        className="p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Close notification"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  )
}
