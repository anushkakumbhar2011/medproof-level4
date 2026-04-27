import React from 'react'

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  variant = 'default' 
}) {
  const variants = {
    default: {
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-400'
    },
    success: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  }

  const config = variants[variant]

  return (
    <div className="bg-white border border-gray-200 rounded-card p-16 text-center" style={{ borderWidth: '0.5px' }}>
      <div className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <div className={config.iconColor}>
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6">{description}</p>}
      {action}
    </div>
  )
}
