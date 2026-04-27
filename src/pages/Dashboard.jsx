import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  console.log('Dashboard redirect page loaded')
  const navigate = useNavigate()
  const { role, isConnected } = useAuth() || {}

  useEffect(() => {
    try {
      if (!isConnected) {
        navigate('/auth', { replace: true })
        return
      }

      if (role === 'patient') {
        navigate('/dashboard/patient', { replace: true })
      } else if (role === 'doctor') {
        navigate('/dashboard/doctor', { replace: true })
      } else {
        navigate('/auth', { replace: true })
      }
    } catch (error) {
      console.error('Error in Dashboard redirect:', error)
      navigate('/auth', { replace: true })
    }
  }, [role, isConnected, navigate])

  // Show brief loading spinner while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12a9 9 0 11-6.219-8.56"/>
      </svg>
    </div>
  )
}
