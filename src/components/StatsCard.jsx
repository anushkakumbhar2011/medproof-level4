import React from 'react'

export default function StatsCard({ label, value, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6" style={{ borderWidth: '0.5px' }}>
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      <div className={`text-3xl font-medium ${color}`}>{value}</div>
    </div>
  )
}
