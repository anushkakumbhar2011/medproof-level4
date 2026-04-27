import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecords } from '../context/RecordsContext'

function PriorityDot({ priority }) {
  const colors = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-green-500'
  }

  return <div className={`w-1.5 h-1.5 rounded-full ${colors[priority]}`} />
}

function PatientAvatar({ initials }) {
  return (
    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-medium text-sm">
      {initials}
    </div>
  )
}

export default function VerificationQueue({ items = [] }) {
  const navigate = useNavigate()
  const { updateRecordStatus } = useRecords()

  const handleView = (recordId) => {
    navigate(`/record/${recordId}`)
  }

  const handleApprove = (recordId) => {
    updateRecordStatus(recordId, 'verified')
    // Show toast notification
  }

  const handleReject = (recordId) => {
    updateRecordStatus(recordId, 'rejected', 'Does not meet verification requirements')
    // Show toast notification
  }

  return (
    <div className="bg-white border border-gray-200 rounded-card overflow-hidden mb-8" style={{ borderWidth: '0.5px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200" style={{ borderWidth: '0.5px' }}>
        <h3 className="text-lg font-medium">Pending verification queue</h3>
        <span className="text-sm text-gray-500">Oldest first</span>
      </div>

      {/* Queue Items */}
      <div>
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 px-6 py-5 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0"
            style={{ borderWidth: '0.5px' }}
          >
            {/* Priority Dot */}
            <PriorityDot priority={item.priority} />

            {/* Patient Avatar */}
            <PatientAvatar initials={item.patient.initials} />

            {/* Patient & Record Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{item.patient.name}</span>
                <span className="text-sm text-gray-500">
                  Submitted {item.submittedAgo} ago · {item.category}
                </span>
              </div>
              <div className="text-sm text-gray-700 mb-0.5">{item.recordTitle}</div>
              <div className="text-xs text-gray-500 font-mono">{item.hash.slice(0, 24)}...</div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleView(item.recordId)}
                className="px-4 py-2 border border-gray-300 rounded-button hover:border-gray-400 transition-colors text-sm font-medium"
              >
                View
              </button>
              <button 
                onClick={() => handleReject(item.recordId)}
                className="px-4 py-2 bg-[#FCEBEB] text-[#A32D2D] rounded-button hover:bg-[#FCEBEB]/80 transition-colors text-sm font-medium"
              >
                Reject
              </button>
              <button 
                onClick={() => handleApprove(item.recordId)}
                className="px-4 py-2 bg-[#EAF3DE] text-[#3a7020] rounded-button hover:bg-[#EAF3DE]/80 transition-colors text-sm font-medium"
              >
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
