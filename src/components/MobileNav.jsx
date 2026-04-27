import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function NavIcon({ type, active }) {
  const strokeColor = active ? '#6BAE3E' : 'currentColor'
  
  const icons = {
    dashboard: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>,
    upload: <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>,
    verify: <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3"/>,
    profile: <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
  }
  
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2">
      {icons[type]}
    </svg>
  )
}

export default function MobileNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { id: 'upload', label: 'Upload', icon: 'upload', path: '/upload' },
    { id: 'verify', label: 'Verify', icon: 'verify', path: '/verify' },
    { id: 'profile', label: 'Profile', icon: 'profile', path: '/profile' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50" style={{ borderWidth: '0.5px' }}>
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-3 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-600'
              }`}
            >
              <NavIcon type={item.icon} active={isActive} />
              {isActive && (
                <span className="text-xs font-medium mt-1">{item.label}</span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
