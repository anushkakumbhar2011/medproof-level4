import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthLayout() {
  const { isConnected } = useAuth()

  // If already authenticated, redirect to dashboard
  if (isConnected) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  )
}
