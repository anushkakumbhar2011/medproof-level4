import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecords } from '../context/RecordsContext'

function StatusBadge({ status }) {
  const styles = {
    verified: {
      bg: 'bg-[#EAF3DE]',
      text: 'text-[#3a7020]'
    },
    pending: {
      bg: 'bg-[#FAEEDA]',
      text: 'text-[#854F0B]'
    },
    rejected: {
      bg: 'bg-[#FCEBEB]',
      text: 'text-[#A32D2D]'
    }
  }

  const style = styles[status] || styles.pending

  return (
    <span className={`${style.bg} ${style.text} text-xs font-medium px-3 py-1 rounded-full capitalize`}>
      {status}
    </span>
  )
}

export default function RecordsTable({ records = [] }) {
  const navigate = useNavigate()
  const { setSelectedRecord } = useRecords()

  const handleRecordClick = (record) => {
    setSelectedRecord(record.id)
    navigate(`/record/${record.id}`)
  }

  if (records.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-card p-16 text-center" style={{ borderWidth: '0.5px' }}>
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <h3 className="text-xl font-medium mb-2">No records yet</h3>
        <p className="text-gray-600 mb-6">Upload your first medical record to get started.</p>
        <button 
          onClick={() => navigate('/upload')}
          className="px-6 py-2.5 bg-primary text-white rounded-button hover:bg-primary/90 transition-colors font-medium"
        >
          Upload your first record
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-card overflow-hidden" style={{ borderWidth: '0.5px' }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200" style={{ borderWidth: '0.5px' }}>
        <h3 className="text-lg font-medium">Recent records</h3>
        <span className="text-sm text-gray-500">Tap to view</span>
      </div>

      <div>
        {records.map((record, index) => (
          <button
            key={index}
            onClick={() => handleRecordClick(record)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0 text-left"
            style={{ borderWidth: '0.5px' }}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium mb-1">{record.title}</div>
              <div className="text-sm text-gray-500">
                {record.category} · <span className="font-mono text-xs">{record.hash.slice(0, 16)}...</span>
              </div>
            </div>

            <div className="mx-6">
              <StatusBadge status={record.status} />
            </div>

            <div className="text-sm text-gray-600 whitespace-nowrap">
              {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
