import React, { createContext, useContext, useState, useEffect } from 'react'
import { isFreighterInstalled, connectWallet as connectFreighterWallet, getConnectedPublicKey } from '../services/stellarWallet'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  console.log('[Auth] Provider rendering')
  const [state, setState] = useState({
    isConnected: false,
    walletAddress: null,
    role: null,
    isLoading: false,
    error: null,
    hasFreighter: false
  })

  // Check Freighter installation and restore session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if Freighter is installed
        const installed = await isFreighterInstalled()
        console.log('[Auth] Freighter installed:', installed)

        setState(prev => ({ ...prev, hasFreighter: installed }))

        // Try to restore session
        const savedRole = localStorage.getItem('mp_role')
        const savedWallet = localStorage.getItem('mp_wallet')

        if (savedRole && savedWallet && installed) {
          try {
            // Verify wallet is still connected
            const connectedKey = await getConnectedPublicKey()
            console.log('[Auth] Connected key:', connectedKey, typeof connectedKey)
            
            if (typeof connectedKey === 'string' && connectedKey === savedWallet) {
              console.log('[Auth] Session restored:', savedWallet)
              setState({
                isConnected: true,
                walletAddress: savedWallet,
                role: savedRole,
                isLoading: false,
                error: null,
                hasFreighter: true
              })
            } else {
              // Clear stale session
              console.log('[Auth] Stale session cleared')
              localStorage.removeItem('mp_role')
              localStorage.removeItem('mp_wallet')
            }
          } catch (sessionError) {
            console.warn('[Auth] Session restoration failed:', sessionError)
            localStorage.removeItem('mp_role')
            localStorage.removeItem('mp_wallet')
          }
        }
      } catch (error) {
        console.error('[Auth] Initialization error:', error)
        // Don't crash the app - just log the error
      }
    }

    initializeAuth()
  }, [])

  const connectWallet = async (selectedRole) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      console.log('[Auth] Connecting wallet with role:', selectedRole)

      // Connect to Freighter
      const publicKey = await connectFreighterWallet()
      console.log('[Auth] Wallet connected:', publicKey, typeof publicKey)

      // Ensure publicKey is a string
      if (typeof publicKey !== 'string') {
        throw new Error('WALLET_CONNECTION_FAILED: Invalid wallet address format')
      }

      setState({
        isConnected: true,
        walletAddress: publicKey,
        role: selectedRole,
        isLoading: false,
        error: null,
        hasFreighter: true
      })

      // Persist to localStorage
      localStorage.setItem('mp_role', selectedRole)
      localStorage.setItem('mp_wallet', publicKey)

      return { success: true, wallet: publicKey }
    } catch (error) {
      console.error('[Auth] Connection error:', error)

      const errorMessage = error.message || 'Failed to connect wallet'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))

      return { success: false, error: errorMessage }
    }
  }

  const disconnect = () => {
    try {
      console.log('[Auth] Disconnecting wallet')

      setState({
        isConnected: false,
        walletAddress: null,
        role: null,
        isLoading: false,
        error: null,
        hasFreighter: state.hasFreighter
      })

      localStorage.removeItem('mp_role')
      localStorage.removeItem('mp_wallet')
    } catch (error) {
      console.error('[Auth] Disconnect error:', error)
    }
  }

  const value = {
    ...state,
    isAuthenticated: state.isConnected,
    connectWallet,
    disconnect
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
