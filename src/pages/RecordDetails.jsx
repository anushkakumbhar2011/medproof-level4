import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRecords } from '../context/RecordsContext'
import { verifyRecord, getRecordWithStatus } from '../services/stellarContract'
import { getFileUrl } from '../services/ipfsUpload'

function VerificationBanner({ status, doctor, date, reason }) {
  const configs = {
    verified: {
      bg: 'bg-[#EAF3DE]',
      text: 'text-[#3a7020]',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      heading: 'Verified on-chain',
      subtext: doctor && date ? `Verified by ${doctor} on ${date}` : 'Verified on-chain'
    },
    pending: {
      bg: 'bg-[#FAEEDA]',
      text: 'text-[#854F0B]',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      heading: 'Pending verification',
      subtext: 'Awaiting review by a verified doctor'
    },
    rejected: {
      bg: 'bg-[#FCEBEB]',
      text: 'text-[#A32D2D]',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ),
      heading: 'Verification rejected',
      subtext: reason || 'This record did not meet verification requirements'
    }
  }

  const config = configs[status] || configs.pending

  return (
    <div className={`${config.bg} ${config.text} rounded-button p-4 mb-6`}>
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="flex-1">
          <div className="font-medium mb-1">{config.heading}</div>
          <div className="text-sm opacity-90">{config.subtext}</div>
        </div>
      </div>
    </div>
  )
}

function MetadataRow({ label, value, mono = false, action }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0" style={{ borderWidth: '0.5px' }}>
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}>
          {value || 'N/A'}
        </span>
        {action}
      </div>
    </div>
  )
}

export default function RecordDetails() {
  console.log('[RecordDetails] Page loaded')
  const { id } = useParams()
  const navigate = useNavigate()
  const { role, walletAddress } = useAuth() || {}
  const { getRecordById, updateRecordStatus, fetchRecords } = useRecords() || {}
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [record, setRecord] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch record on mount
  useEffect(() => {
    const loadRecord = async () => {
      try {
        setIsLoading(true)
        console.log('[RecordDetails] Loading record:', id)

        // Try local state first
        let localRecord = getRecordById ? getRecordById(id) : null

        if (!localRecord) {
          // Fetch from blockchain
          const blockchainRecord = await getRecordWithStatus(parseInt(id, 10))
          if (blockchainRecord) {
            localRecord = {
              id: blockchainRecord.record_id?.toString(),
              title: blockchainRecord.title,
              category: blockchainRecord.category,
              status: blockchainRecord.status || 'pending',
              uploadedBy: 'Patient',
              patientAddr: blockchainRecord.owner,
              hash: blockchainRecord.cid,
              ipfsUrl: getFileUrl(blockchainRecord.cid),
              date: blockchainRecord.timestamp ? new Date(blockchainRecord.timestamp * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              verifiedBy: blockchainRecord.doctor || null,
              verifiedAt: blockchainRecord.verified_at ? new Date(blockchainRecord.verified_at * 1000).toISOString() : null,
              rejectionReason: blockchainRecord.reason || null,
              fileType: 'Document',
              priority: 'medium'
            }
          }
        }

        if (!localRecord) {
          console.log('[RecordDetails] Record not found')
          setIsLoading(false)
          return
        }

        setRecord(localRecord)
        setIsLoading(false)
      } catch (error) {
        console.error('[RecordDetails] Load error:', error)
        setError(error.message)
        setIsLoading(false)
      }
    }

    loadRecord()
  }, [id])

  if (!record) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-white border border-gray-200 rounded-card p-16 text-center" style={{ borderWidth: '0.5px' }}>
          {isLoading ? (
            <>
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <h2 className="text-2xl font-medium mb-2">Loading record...</h2>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-medium mb-2">Record not found</h2>
              <p className="text-gray-600 mb-6">The record you're looking for doesn't exist or has been removed.</p>
              <button 
                onClick={() => navigate('/dashboard')} 
                className="px-6 py-2.5 bg-primary text-white rounded-button hover:bg-primary/90 transition-colors font-medium"
              >
                Back to dashboard
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  const handleCopyHash = () => {
    try {
      if (record?.hash) {
        navigator.clipboard.writeText(record.hash)
      }
    } catch (error) {
      console.error('Error copying hash:', error)
    }
  }

  const handleApprove = async () => {
    try {
      if (!walletAddress) {
        setError('WALLET_NOT_FOUND: Wallet not connected')
        return
      }

      setIsProcessing(true)
      setError(null)
      console.log('[RecordDetails] Approving record:', id)

      // Call smart contract
      const result = await verifyRecord(walletAddress, parseInt(id, 10), 'verified', null)

      console.log('[RecordDetails] Record approved on-chain:', result.hash)

      // Update local state
      if (updateRecordStatus) {
        updateRecordStatus(id, 'verified')
      }

      // Refresh records
      if (fetchRecords && walletAddress) {
        await fetchRecords(walletAddress)
      }

      setIsProcessing(false)
      setTimeout(() => navigate('/dashboard/doctor'), 1500)
    } catch (error) {
      console.error('[RecordDetails] Approval error:', error)
      setError(error.message)
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    try {
      if (!walletAddress) {
        setError('WALLET_NOT_FOUND: Wallet not connected')
        return
      }

      if (!rejectionReason.trim()) {
        setError('Please provide a rejection reason')
        return
      }

      setIsProcessing(true)
      setError(null)
      console.log('[RecordDetails] Rejecting record:', id, 'Reason:', rejectionReason)

      // Call smart contract
      const result = await verifyRecord(walletAddress, parseInt(id, 10), 'rejected', rejectionReason)

      console.log('[RecordDetails] Record rejected on-chain:', result.hash)

      // Update local state
      if (updateRecordStatus) {
        updateRecordStatus(id, 'rejected', rejectionReason)
      }

      // Refresh records
      if (fetchRecords && walletAddress) {
        await fetchRecords(walletAddress)
      }

      setIsProcessing(false)
      setTimeout(() => navigate('/dashboard/doctor'), 1500)
    } catch (error) {
      console.error('[RecordDetails] Rejection error:', error)
      setError(error.message)
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    try {
      if (role === 'patient') {
        navigate('/dashboard/patient')
      } else if (role === 'doctor') {
        navigate('/dashboard/doctor')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error navigating back:', error)
      navigate('/dashboard')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button 
        onClick={handleBack} 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-gray-100 rounded-card overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <p className="text-sm">Preview not available</p>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 rounded-button hover:border-gray-400 transition-colors font-medium">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Download file
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-card p-6" style={{ borderWidth: '0.5px' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-medium mb-3">{record?.title || 'Untitled Record'}</h2>
            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
              {record?.category || 'General'}
            </span>
          </div>

          <VerificationBanner
            status={record?.status || 'pending'}
            doctor={record?.verifiedBy}
            date={record?.verifiedAt ? new Date(record.verifiedAt).toLocaleDateString() : ''}
            reason={record?.rejectionReason}
          />

          <div className="mb-6">
            <MetadataRow label="Uploaded by" value={record?.uploadedBy} />
            <MetadataRow 
              label="Wallet address" 
              value={record?.patientAddr ? `${record.patientAddr.slice(0, 10)}...${record.patientAddr.slice(-8)}` : 'N/A'}
              mono
            />
            <MetadataRow label="Upload date" value={record?.date ? new Date(record.date).toLocaleDateString() : 'N/A'} />
            <MetadataRow label="File type" value={record?.fileType} />
            <MetadataRow label="File size" value={record?.fileSize} />
            <MetadataRow 
              label="Record hash" 
              value={record?.hash ? `${record.hash.slice(0, 16)}...` : 'N/A'}
              mono
              action={
                record?.hash && (
                  <button 
                    onClick={handleCopyHash}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    aria-label="Copy hash"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                  </button>
                )
              }
            />
            {record?.hash && (
              <div className="py-3">
                <a 
                  href={`https://etherscan.io/tx/${record.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  View on Etherscan
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                </a>
              </div>
            )}
          </div>

          {role === 'doctor' && record?.status === 'pending' && (
            <div className="space-y-3 pt-6 border-t border-gray-200" style={{ borderWidth: '0.5px' }}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-button p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button 
                onClick={handleApprove}
                disabled={isProcessing}
                className="w-full px-5 py-2.5 bg-primary text-white rounded-button hover:bg-primary/90 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Approve record'
                )}
              </button>
              
              {!showRejectForm ? (
                <button 
                  onClick={() => setShowRejectForm(true)}
                  disabled={isProcessing}
                  className="w-full px-5 py-2.5 border border-red-300 text-red-600 rounded-button hover:border-red-400 hover:bg-red-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject record
                </button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Add rejection reason..."
                    rows="3"
                    disabled={isProcessing}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-input focus:outline-none focus:border-primary transition-colors resize-none disabled:bg-gray-50"
                    style={{ borderWidth: '0.5px' }}
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowRejectForm(false)}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-button hover:border-gray-400 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleReject}
                      disabled={isProcessing || !rejectionReason.trim()}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-button hover:bg-red-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 11-6.219-8.56"/>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Confirm rejection'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
