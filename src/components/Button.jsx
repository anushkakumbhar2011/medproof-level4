import React from 'react'

export default function Button({ 
  variant = 'primary', 
  children, 
  loading = false, 
  disabled = false,
  fullWidth = false,
  icon,
  onClick,
  type = 'button',
  ...props 
}) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 disabled:bg-gray-300',
    outline: 'border border-gray-300 text-gray-700 hover:border-gray-400 disabled:border-gray-200 disabled:text-gray-400',
    ghost: 'text-gray-700 hover:bg-gray-100 disabled:text-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300',
    'danger-outline': 'border border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 disabled:border-gray-200 disabled:text-gray-400'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        px-5 py-2.5 rounded-button font-medium transition-all
        disabled:cursor-not-allowed
        active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        flex items-center justify-center gap-2
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
          {children}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  )
}
