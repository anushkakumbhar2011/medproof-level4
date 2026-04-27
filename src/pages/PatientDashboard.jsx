import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRecords } from '../context/RecordsContext'
import StatsCard from '../components/StatsCard'
import UploadTeaser from '../components/UploadTeaser'
import RecordsTable from '../components/RecordsTable'

export default function PatientDashboard() {
  console.log('PatientDashboard loaded')
  const navigate = useNavigate()
  const { walletAddress } = useAuth() || {}
  const { records, fetchRecords, isLoading } = useRecords() || { records: [], isLoading: false }

  // Fetch records from blockchain on mount
  useEffect(() => {
    if (walletAddress && fetchRecords) {
      console.log('Fetching records for wallet:', walletAddress)
      fetchRecords(walletAddress)
    }
  }, [walletAddress])

  const patientRecords = (records || []).filter(r => r?.patientAddr === walletAddress)

  const stats = [
    { label: 'Total records', value: patientRecords.length.toString(), color: 'text-gray-900' },
    { label: 'Verified', value: patientRecords.filter(r => r?.status === 'verified').length.toString(), color: 'text-green-600' },
    { label: 'Pending review', value: patientRecords.filter(r => r?.status === 'pending').length.toString(), color: 'text-amber-600' }
  ]

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-medium mb-2">My dashboard</h1>
          <p className="text-gray-600">Good morning! Here's your health record overview.</p>
        </div>
        <button 
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-button hover:bg-primary/90 transition-colors font-medium"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          Upload record
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Upload Teaser */}
      <UploadTeaser onClick={() => navigate('/upload')} />

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading records from blockchain...</p>
        </div>
      )}

      {/* Records Table */}
      {!isLoading && <RecordsTable records={patientRecords} />}
    </>
  )
}
