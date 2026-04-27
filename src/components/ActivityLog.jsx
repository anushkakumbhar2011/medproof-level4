import React from 'react'

function ActivityDot({ type }) {
  const colors = {
    approved: 'bg-green-500',
    rejected: 'bg-red-500'
  }

  return <div className={`w-2 h-2 rounded-full ${colors[type]} flex-shrink-0`} />
}

export default function ActivityLog({ activities = [] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-card overflow-hidden" style={{ borderWidth: '0.5px' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200" style={{ borderWidth: '0.5px' }}>
        <h3 className="text-lg font-medium">Recent activity</h3>
      </div>

      {/* Activity Items */}
      <div className="divide-y divide-gray-200">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors"
          >
            <ActivityDot type={activity.type} />
            <div className="flex-1 text-sm text-gray-700">{activity.description}</div>
            <div className="text-xs text-gray-500 whitespace-nowrap">{activity.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
