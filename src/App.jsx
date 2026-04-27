import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Pages
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import UploadRecord from './pages/UploadPage'
import RecordDetails from './pages/RecordDetails'
import Verify from './pages/Verify'
import Profile from './pages/Profile'

// Guards
import PrivateRoute from './guards/PrivateRoute'
import RoleRoute from './guards/RoleRoute'

function App() {
  console.log('App loaded')
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/verify" element={<Verify />} />
        </Route>

        {/* Auth route */}
        <Route element={<AuthLayout />}>
          <Route path="/auth" element={<Auth />} />
        </Route>

        {/* Protected dashboard routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route element={<RoleRoute allowedRole="patient" />}>
              <Route path="/dashboard/patient" element={<PatientDashboard />} />
              <Route path="/upload" element={<UploadRecord />} />
            </Route>

            <Route element={<RoleRoute allowedRole="doctor" />}>
              <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
            </Route>

            <Route path="/record/:id" element={<RecordDetails />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <a href="/" style={{ color: '#6BAE3E' }}>Go to Home</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
