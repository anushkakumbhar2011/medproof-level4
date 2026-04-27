import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecords } from '../context/RecordsContext'
import { useAuth } from '../context/AuthContext'
import { getRecordCount, getRecord, getVerification, verifyRecord } from '../services/stellarContract'
import StatsCard from '../components/StatsCard'
import VerificationQueue from '../components/VerificationQueue'
import ActivityLog from '../components/ActivityLog'

export default function DoctorDashboard() {
  console.log('[DoctorDashboard] Loaded')
  const navigate = useNavigate()
  const { walletAddress } = useAuth() || {}
  const { records, updateRecordStatus } = useRecords() || { records: [] }

  const [pendingQueue, setPendingQueue] = useState([])
  const [activities, setActivities] = useState([])
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [rowLoading, setRowLoading] = useState({})
  const [rowError, setRowError] = useState({})
  const [rejectForms, setRejectForms] = useState({})
  const [rejectReasons, setRejectReasons] = useState({})

  // Fetch all pending records from blockchain on mount
  useEffect(() => {
    const loadPendingRecords = async () => {
      try {
        setIsFetching(true)
        setFetchError(null)
        console.log('[DoctorDashboard] Fetching pending records from blockchain...')

        const count = await getRecordCount()
        console.log('[DoctorDashboard] Total records on-chain:', count)

        if (!count || count === 0) {
          setPendingQueue([])
          setIsFetching(false)
          return
        }

        // Fetch last 50 records (or all if fewer)
        const fetchLimit = Math.min(Number(count), 50)
        const startId = Math.max(1, Number(count) - fetchLimit + 1)

        const pending = []
        for (let id = startId; id <= Number(count); id++) {
          try {
            const record = await getRecord(id)
            const verification = await getVerification(id)

            // Only include records with no verification (pending)
            if (!verification) {
              pending.push({
                recordId: id.toString(),
                id: id.toString(),
                title: record.title || 'Untitled',
                category: record.category || 'General',
                owner: record.owner,
                cid: record.cid,
                timestamp: record.timestamp,
                priority: 'medium',
              })
            }
          } catch (err) {
            console.log(`[DoctorDashboard] Skipping record ${id}:`, err.message)
          }
        }

        console.log('[DoctorDashboard] Pending records found:', pending.length)
        setPendingQueue(pending)
        setIsFetching(false)
      } catch (error) {
        console.error('[DoctorDashboard] Fetch error:', error)
        setFetchError(error.message)
        setIsFetching(false)
      }
    }

    loadPendingRecords()
  }, [])

  const handleApprove = async (recordId) => {
    if (!walletAddress) {
      setRowError(prev => ({ ...prev, [recordId]: 'WALLET_NOT_FOUND: Wallet not connected' }))
      return
    }

    try {
      setRowLoading(prev => ({ ...prev, [recordId]: true }))
      setRowError(prev => ({ ...prev, [recordId]: null }))
      console.log('[DoctorDashboard] Approving record:', recordId)

      const result = await verifyRecord(walletAddress, parseInt(recordId, 10), 'verified', null)
      console.log('[DoctorDashboard] Approved on-chain:', result.hash)

      // Update context
      if (updateRecordStatus) updateRecordStatus(recordId, 'verified')

      // Add to activity log
      setActivities(prev => [{
        type: 'approved',
        description: `Approved record #${recordId}`,
        timestamp: new Date().toLocaleTimeString(),
        hash: result.hash,
      }, ...prev])

      // Remove from pending queue
      setPendingQueue(prev => prev.filter(r => r.recordId !== recordId))
      setRowLoading(prev => ({ ...prev, [recordId]: false }))
    } catch (error) {
      console.error('[DoctorDashboard] Approve error:', error)
      setRowError(prev => ({ ...prev, [recordId]: error.message }))
      setRowLoading(prev => ({ ...prev, [recordId]: false }))
    }
  }

  const handleRejectConfirm = async (recordId) => {
    const reason = rejectReasons[recordId] || ''

    if (!reason.trim()) {
      setRowError(prev => ({ ...prev, [recordId]: 'Please provide a rejection reason' }))
      return
    }

    if (!walletAddress) {
      setRowError(prev => ({ ...prev, [recordId]: 'WALLET_NOT_FOUND: Wallet not connected' }))
      return
    }

    try {
      setRowLoading(prev => ({ ...prev, [recordId]: true }))
      setRowError(prev => ({ ...prev, [recordId]: null }))
      console.log('[DoctorDashboard] Rejecting record:', recordId, 'Reason:', reason)

      const result = await verifyRecord(walletAddress, parseInt(recordId, 10), 'rejected', reason)
      console.log('[DoctorDashboard] Rejected on-chain:', result.hash)

      // Update context
      if (updateRecordStatus) updateRecordStatus(recordId, 'rejected', reason)

      // Add to activity log
      setActivities(prev => [{
        type: 'rejected',
        description: `Rejected record #${recordId}: ${reason}`,
        timestamp: new Date().toLocaleTimeString(),
        hash: result.hash,
      }, ...prev])

      // Remove from pending queue
      setPendingQueue(prev => prev.filter(r => r.recordId !== recordId))
      setRowLoading(prev => ({ ...prev, [recordId]: false }))
      setRejectForms(prev => ({ ...prev, [recordId]: false }))
    } catch (error) {
      console.error('[DoctorDashboard] Reject error:', error)
      setRowError(prev => ({ ...prev, [recordId]: error.message }))
      setRowLoading(prev => ({ ...prev, [recordId]: false }))
    }
  }

  // Stats derived from context records + live pending queue
  const contextVerified = (records || []).filter(r => r?.status === 'verified')
  const contextVerifiedToday = contextVerified.filter(r => {
    try {
      return r?.verifiedAt && new Date(r.verifiedAt).toDateString() === new Date().toDateString()
    } catch {
      return false
    }
  })

  const stats = [
    { label: 'Pending review', value: pendingQueue.length.toString(), color: 'text-amber-600' },
    { label: 'Verified today', value: (contextVerifiedToday.length + activities.filter(a => a.type === 'approved').length).toString(), color: 'text-green-600' },
    { label: 'Total approved', value: (contextVerified.length + activities.filter(a => a.type === 'approved').length).toString(), color: 'text-gray-900' },
  ]

  // Map pending queue to VerificationQueue format
  const queueItems = pendingQueue.map(record => ({
    priority: record.priority || 'medium',
    patient: {
      name: typeof record.owner === 'string' ? `${record.owner.slice(0, 6)}...${record.owner.slice(-4)}` : 'Unknown',
      initials: 'P',
    },
    submittedAgo: record.timestamp ? `${Math.floor((Date.now() / 1000 - Number(record.timestamp)) / 3600)}h ago` : '—',
    category: record.category,
    recordTitle: record.title,
    hash: record.cid,
    recordId: record.recordId,
    isLoading: rowLoading[record.recordId] || false,
    error: rowError[record.recordId] || null,
    showRejectForm: rejectForms[record.recordId] || false,
    rejectReason: rejectReasons[record.recordId] || '',
    onApprove: () => handleApprove(record.recordId),
    onRejectToggle: () => setRejectForms(prev => ({ ...prev, [record.recordId]: !prev[record.recordId] })),
    onRejectReasonChange: (val) => setRejectReasons(prev => ({ ...prev, [record.recordId]: val })),
    onRejectConfirm: () => handleRejectConfirm(record.recordId),
    onViewDetails: () => navigate(`/records/${record.recordId}`),
  }))

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-medium mb-2">Verification dashboard</h1>
        <p className="text-gray-600">Review and verify pending patient medical records.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Fetch error */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-card p-4 mb-6 text-sm text-red-600">
          {fetchError}
        </div>
      )}

      {/* Loading state */}
      {isFetching && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading pending records from blockchain...</p>
        </div>
      )}

      {/* Verification Queue */}
      {!isFetching && <VerificationQueue items={queueItems} />}

      {/* Activity Log — real on-chain actions from this session */}
      {activities.length > 0 && <ActivityLog activities={activities} />}
    </>
  )
}
