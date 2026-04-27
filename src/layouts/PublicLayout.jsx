import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function PublicLayout() {
  console.log('PublicLayout rendering')
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}
