import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import MobileNav from '../components/MobileNav'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop: Sidebar */}
      <div className="hidden md:grid md:grid-cols-[200px_1fr] min-h-screen">
        <Sidebar />
        <main className="p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile: Content + Bottom Nav */}
      <div className="md:hidden">
        <main className="p-6 pb-24">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
