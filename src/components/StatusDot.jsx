import React from 'react'

export default function StatusDot({ status = 'neutral', size = 'sm' }) {
  const colors = {
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    neutral: 'bg-gray-400'
  }

  const sizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  }

  return (
    <div className={`${colors[status]} ${sizes[size]} rounded-full flex-shrink-0`} />
  )
}
