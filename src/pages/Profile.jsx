import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  console.log('Profile page loaded')
  const navigate = useNavigate()
  const { walletAddress, role, disconnect } = useAuth() || {}

  const handleDisconnect = () => {
    try {
      if (disconnect) {
        disconnect()
      }
      navigate('/')
    } catch (error) {
      console.error('Error disconnecting:', error)
      navigate('/')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1) || navigate('/dashboard')} 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-4xl font-medium mb-8">Profile</h1>

      <div className="bg-white border border-gray-200 rounded-card p-6 mb-6" style={{ borderWidth: '0.5px' }}>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Wallet Address</label>
            <div className="font-mono text-sm bg-gray-50 px-3 py-2 rounded-input">
              {walletAddress || 'Not connected'}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">Role</label>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
              role === 'patient' ? 'bg-primary/10 text-primary' : 'bg-blue-50 text-blue-600'
            }`}>
              {role || 'Unknown'}
            </span>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">Member Since</label>
            <div className="text-sm">April 2026</div>
          </div>
        </div>
      </div>

      <button
        onClick={handleDisconnect}
        className="w-full px-5 py-2.5 border border-red-300 text-red-600 rounded-button hover:border-red-400 hover:bg-red-50 transition-colors font-medium"
      >
        Disconnect Wallet
      </button>
    </div>
  )
}
