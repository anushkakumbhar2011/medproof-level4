import React from 'react'

export function Input({ 
  label, 
  error, 
  helperText,
  mono = false,
  fullWidth = true,
  ...props 
}) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          ${fullWidth ? 'w-full' : ''}
          ${mono ? 'font-mono' : ''}
          ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'}
          px-3 py-2.5 border rounded-input 
          focus:outline-none transition-colors
        `}
        style={{ borderWidth: '0.5px' }}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  )
}

export function Textarea({ 
  label, 
  error, 
  helperText,
  fullWidth = true,
  rows = 3,
  ...props 
}) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          ${fullWidth ? 'w-full' : ''}
          ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'}
          px-3 py-2.5 border rounded-input 
          focus:outline-none transition-colors resize-none
        `}
        style={{ borderWidth: '0.5px' }}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  )
}

export function Select({ 
  label, 
  error, 
  helperText,
  fullWidth = true,
  children,
  ...props 
}) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        className={`
          ${fullWidth ? 'w-full' : ''}
          ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'}
          px-3 py-2.5 border rounded-input bg-white
          focus:outline-none transition-colors
        `}
        style={{ borderWidth: '0.5px' }}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  )
}
