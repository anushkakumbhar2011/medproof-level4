import React from 'react'

export default function Badge({ variant = 'neutral', children, pulse = false }) {
  const variants = {
    verified: 'bg-[#EAF3DE] text-[#3a7020]',
    pending: 'bg-[#FAEEDA] text-[#854F0B]',
    rejected: 'bg-[#FCEBEB] text-[#A32D2D]',
    neutral: 'bg-gray-100 text-gray-700'
  }

  return (
    <span 
      className={`
        ${variants[variant]}
        ${pulse ? 'animate-pulse' : ''}
        text-xs font-medium px-3 py-1 rounded-full capitalize inline-block
      `}
    >
      {children}
    </span>
  )
}
