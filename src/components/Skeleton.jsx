import React from 'react'

export function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-card p-6 animate-pulse" style={{ borderWidth: '0.5px' }}>
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="bg-white border border-gray-200 rounded-card overflow-hidden" style={{ borderWidth: '0.5px' }}>
      <div className="px-6 py-4 border-b border-gray-200 animate-pulse" style={{ borderWidth: '0.5px' }}>
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="divide-y divide-gray-200">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-6 py-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-20 ml-6"></div>
              <div className="h-4 bg-gray-200 rounded w-24 ml-6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="h-4 bg-gray-200 rounded" 
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        ></div>
      ))}
    </div>
  )
}
