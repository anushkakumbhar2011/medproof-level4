import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NavIcon({ type }) {
  const icons = {
    dashboard: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>,
    upload: <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>,
    records: <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>,
    verify: <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3"/>,
    profile: <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
  }
  
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {icons[type]}
    </svg>
  )
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { role, disconnect } = useAuth()
  
  const isPatient = role === 'patient'
  const accentBg = isPatient ? 'bg-primary/10' : 'bg-blue-50'
  const accentText = isPatient ? 'text-primary' : 'text-blue-600'

  const handleLogout = () => {
    disconnect()
    navigate('/')
  }

  const patientNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard/patient' },
    { id: 'upload', label: 'Upload record', icon: 'upload', path: '/upload' },
    { id: 'records', label: 'My records', icon: 'records', path: '/dashboard/patient#records' },
    { id: 'divider' },
    { id: 'verify', label: 'Verify record', icon: 'verify', path: '/verify' },
    { id: 'profile', label: 'Profile', icon: 'profile', path: '/profile' }
  ]

  const doctorNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard/doctor' },
    { id: 'queue', label: 'Pending queue', icon: 'verify', path: '/dashboard/doctor#queue', badge: 12 },
    { id: 'records', label: 'All records', icon: 'records', path: '/dashboard/doctor?tab=verified' },
    { id: 'divider' },
    { id: 'profile', label: 'Profile', icon: 'profile', path: '/profile' }
  ]

  const navItems = isPatient ? patientNavItems : doctorNavItems

  return (
    <aside className="bg-white border-r border-gray-200 flex flex-col" style={{ borderWidth: '0.5px' }}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200" style={{ borderWidth: '0.5px' }}>
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#6BAE3E" stroke="#6BAE3E" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <span className="text-lg font-medium">MedProof</span>
        </div>
      </div>

      {/* Role Badge (Doctor only) */}
      {!isPatient && (
        <div className="px-4 pt-4 pb-2">
          <div className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full inline-block">
            Doctor / Admin
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item, index) => {
            if (item.id === 'divider') {
              return (
                <li key={index} className="my-3">
                  <div className="h-px bg-gray-200" />
                </li>
              )
            }

            const isActive = location.pathname === item.path || 
                           (item.path && location.pathname.startsWith(item.path.split('?')[0].split('#')[0]))

            return (
              <li key={item.id}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-button transition-colors ${
                    isActive
                      ? `${accentBg} ${accentText}`
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <NavIcon type={item.icon} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile Card */}
      <div className="p-4 border-t border-gray-200" style={{ borderWidth: '0.5px' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 ${isPatient ? 'bg-primary' : 'bg-blue-600'} text-white rounded-full flex items-center justify-center font-medium`}>
            {isPatient ? 'JD' : 'DR'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {isPatient ? 'John Doe' : 'Dr. Smith'}
            </div>
            <div className="text-xs text-gray-500 capitalize">{role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors text-left"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
