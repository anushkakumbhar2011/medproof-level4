import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  
  let isConnected = false
  try {
    const auth = useAuth()
    isConnected = auth?.isConnected || false
  } catch (error) {
    console.warn('[Navbar] Auth context not available:', error)
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleDashboardClick = () => {
    if (isConnected) {
      navigate('/dashboard')
    } else {
      navigate('/auth')
    }
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all ${isScrolled ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#6BAE3E" stroke="#6BAE3E" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <span className="text-xl font-medium">MedProof</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={handleDashboardClick} className="text-gray-700 hover:text-gray-900 transition-colors">
              Dashboard
            </button>
            <button onClick={() => navigate('/verify')} className="text-gray-700 hover:text-gray-900 transition-colors">
              Verify
            </button>
            <a href="https://docs.medproof.io" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 transition-colors">
              Docs
            </a>
            <button 
              onClick={() => navigate('/auth')} 
              className="px-5 py-2 bg-primary text-white rounded-button hover:bg-primary/90 transition-colors font-medium"
            >
              Connect Wallet
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 flex flex-col gap-3">
            <button onClick={handleDashboardClick} className="text-gray-700 py-2 text-left">Dashboard</button>
            <button onClick={() => navigate('/verify')} className="text-gray-700 py-2 text-left">Verify</button>
            <a href="https://docs.medproof.io" target="_blank" rel="noopener noreferrer" className="text-gray-700 py-2">Docs</a>
            <button 
              onClick={() => navigate('/auth')} 
              className="px-5 py-2 bg-primary text-white rounded-button hover:bg-primary/90 transition-colors font-medium text-left"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
