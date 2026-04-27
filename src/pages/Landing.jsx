import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Footer from '../components/Footer'

export default function Landing() {
  console.log('Landing page loaded')
  const navigate = useNavigate()
  
  let isConnected = false
  let role = null
  try {
    const auth = useAuth()
    isConnected = auth?.isConnected || false
    role = auth?.role || null
  } catch (error) {
    console.warn('[Landing] Auth context not available:', error)
  }

  const handleGetStarted = () => {
    try {
      if (isConnected && role === 'patient') {
        navigate('/dashboard/patient')
      } else {
        navigate('/auth')
      }
    } catch (error) {
      console.error('Error in handleGetStarted:', error)
      navigate('/auth')
    }
  }

  const handleVerify = () => {
    try {
      navigate('/verify')
    } catch (error) {
      console.error('Error in handleVerify:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Hero onGetStarted={handleGetStarted} onVerify={handleVerify} />
      <Features />
      <HowItWorks onStepClick={() => navigate('/auth')} />
      <Footer />
    </div>
  )
}
