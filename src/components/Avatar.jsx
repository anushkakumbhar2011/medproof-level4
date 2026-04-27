import React from 'react'

export default function Avatar({ initials, role = 'patient', size = 'md' }) {
  const colors = {
    patient: 'bg-primary',
    doctor: 'bg-blue-600'
  }

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  }

  return (
    <div 
      className={`
        ${colors[role]} 
        ${sizes[size]}
        text-white rounded-full flex items-center justify-center font-medium
      `}
    >
      {initials}
    </div>
  )
}
