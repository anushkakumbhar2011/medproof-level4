import React from 'react'

export default function ProgressBar({ progress = 0, animated = true }) {
  return (
    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={`h-full bg-primary rounded-full ${animated ? 'transition-all duration-300' : ''}`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}
