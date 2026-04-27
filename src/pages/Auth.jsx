import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { checkNetworkMatch } from '../services/stellarWallet'

function PersonIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  )
}

function StethoscopeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 5c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm-3.5 1.5c0 1.9-1.6 3.5-3.5 3.5s-3.5-1.6-3.5-3.5V14H7v1.5C7 18.4 9.6 21 12 21s5-2.6 5-5.5V14h-1.5v1.5zM4 2v8c0 1.1.9 2 2 2h1v3.5c0 .8.2 1.6.5 2.3-.3-.1-.6-.2-1-.2-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2c0-.2 0-.4-.1-.6.9.4 1.9.6 2.9.6h.2c-.1-.5-.2-1-.2-1.5V14h1c1.1 0 2-.9 2-2V2H4z"/>
    </svg>
  )
}

function RadioButton({ selected }) {
  return (
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
      selected ? 'border-primary bg-primary' : 'border-gray-300'
    }`}>
      {selected && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  )
}

function FreighterIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#7B61FF"/>
      <path d="M12 6L8 12h8l-4 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function Auth() {
  console.log('[Auth] Page loaded')
  const [selectedRole, setSelectedRole] = useState('patient')
  const navigate = useNavigate()
  const { connectWallet, isLoading, error, hasFreighter } = useAuth() || {}

  const handleConnect = async () => {
    try {
      if (!connectWallet) {
        console.error('[Auth] connectWallet not available')
        return
      }

      // Check network match
      const networkPassphrase = import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE
      try {
        await checkNetworkMatch(networkPassphrase)
      } catch (networkError) {
        console.error('[Auth] Network check failed:', networkError)
        // Continue anyway - error will be shown in UI
      }

      const result = await connectWallet(selectedRole)
      if (result?.success) {
        if (selectedRole === 'patient') {
          navigate('/dashboard/patient')
        } else {
          navigate('/dashboard/doctor')
        }
      }
    } catch (error) {
      console.error('[Auth] Connection error:', error)
    }
  }

  const roles = [
    {
      id: 'patient',
      icon: <PersonIcon />,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      title: 'Patient',
      description: 'Upload and manage your medical records'
    },
    {
      id: 'doctor',
      icon: <StethoscopeIcon />,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      title: 'Doctor / Admin',
      description: 'Review and verify patient records'
    }
  ]

  // walletOptions reserved for future multi-wallet support

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[440px]">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')} 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-card border border-gray-200 p-8" style={{ borderWidth: '0.5px' }}>
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#6BAE3E" stroke="#6BAE3E" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <span className="text-lg font-medium">MedProof</span>
        </div>

        {/* Header */}
        <h2 className="text-3xl font-medium mb-2">Welcome back</h2>
        <p className="text-gray-600 mb-8">
          Connect your wallet to securely access your medical records with cryptographic authentication.
        </p>

        {/* Role Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Continue as
          </label>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`relative text-left p-4 rounded-button border transition-all ${
                  selectedRole === role.id
                    ? 'border-primary bg-[#f4f9ed]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                style={{ 
                  borderWidth: selectedRole === role.id ? '1.5px' : '0.5px'
                }}
              >
                {/* Radio Button */}
                <div className="absolute top-3 right-3">
                  <RadioButton selected={selectedRole === role.id} />
                </div>

                {/* Icon */}
                <div className={`w-10 h-10 ${role.iconBg} rounded-input flex items-center justify-center mb-3 ${role.iconColor}`}>
                  {role.icon}
                </div>

                {/* Content */}
                <div className="pr-6">
                  <div className="font-medium mb-1">{role.title}</div>
                  <div className="text-xs text-gray-600 leading-relaxed">
                    {role.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="mb-6">
          {!hasFreighter && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-button p-3 text-sm text-red-600">
              Freighter wallet not found. Install it from <a href="https://freighter.app" target="_blank" rel="noopener noreferrer" className="underline font-medium">freighter.app</a>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-button p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={!selectedRole || isLoading || !hasFreighter}
            className="w-full flex items-center justify-center gap-3 p-4 bg-primary text-white rounded-button hover:bg-primary/90 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <FreighterIcon />
                <span>Connect Freighter Wallet</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">Stellar Wallet</p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <a href="#terms" className="text-gray-700 hover:text-gray-900 underline">
            Terms
          </a>
          {' '}and{' '}
          <a href="#privacy" className="text-gray-700 hover:text-gray-900 underline">
            Privacy Policy
          </a>
        </div>
        </div>
      </div>
    </div>
  )
}
