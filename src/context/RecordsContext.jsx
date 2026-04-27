import React, { createContext, useContext, useState } from 'react'
import { getRecordsByOwner, getRecordWithStatus } from '../services/stellarContract'
import { getFileUrl } from '../services/ipfsUpload'

const RecordsContext = createContext()

export function RecordsProvider({ children }) {
  console.log('[Records] Provider rendering')
  const [records, setRecords] = useState([])
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Fetch records from blockchain for a specific owner
   */
  const fetchRecords = async (ownerAddress) => {
    try {
      if (!ownerAddress) {
        console.log('[Records] No owner address provided')
        return
      }

      setIsLoading(true)
      setError(null)
      console.log('[Records] Fetching records for owner:', ownerAddress)

      const blockchainRecords = await getRecordsByOwner(ownerAddress)

      if (blockchainRecords && Array.isArray(blockchainRecords)) {
        // Transform blockchain records to UI format
        const transformedRecords = blockchainRecords.map(record => ({
          id: record.record_id?.toString(),
          title: record.title,
          category: record.category,
          status: record.status || 'pending',
          uploadedBy: 'Patient',
          patientAddr: record.owner,
          hash: record.cid,
          ipfsUrl: getFileUrl(record.cid),
          date: record.timestamp ? new Date(record.timestamp * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          verifiedBy: record.doctor || null,
          verifiedAt: record.verified_at ? new Date(record.verified_at * 1000).toISOString() : null,
          rejectionReason: record.reason || null,
          fileType: 'Document',
          priority: 'medium'
        }))

        console.log('[Records] Transformed records:', transformedRecords.length)
        setRecords(transformedRecords)
      } else {
        console.log('[Records] No records found')
        setRecords([])
      }

      setIsLoading(false)
    } catch (error) {
      console.error('[Records] Fetch error:', error)
      setError(error.message)
      setIsLoading(false)
    }
  }

  /**
   * Fetch a single record with verification status
   */
  const fetchSingleRecord = async (recordId) => {
    try {
      console.log('[Records] Fetching single record:', recordId)
      const record = await getRecordWithStatus(recordId)
      return record
    } catch (error) {
      console.error('[Records] Fetch single record error:', error)
      throw error
    }
  }

  const getRecordById = (id) => {
    try {
      return records.find(record => record?.id === id) || null
    } catch (error) {
      console.error('[Records] Get record by ID error:', error)
      return null
    }
  }

  const getRecordByHash = (hash) => {
    try {
      return records.find(record => record?.hash === hash) || null
    } catch (error) {
      console.error('[Records] Get record by hash error:', error)
      return null
    }
  }

  const setSelectedRecord = (id) => {
    try {
      setSelectedRecordId(id)
    } catch (error) {
      console.error('[Records] Set selected record error:', error)
    }
  }

  const updateRecordStatus = (id, newStatus, reason = null) => {
    try {
      setRecords(prevRecords =>
        prevRecords.map(record =>
          record?.id === id
            ? { ...record, status: newStatus, rejectionReason: reason }
            : record
        )
      )
    } catch (error) {
      console.error('[Records] Update record status error:', error)
    }
  }

  const addRecord = (newRecord) => {
    try {
      if (newRecord && newRecord.id) {
        setRecords(prevRecords => [newRecord, ...prevRecords])
      }
    } catch (error) {
      console.error('[Records] Add record error:', error)
    }
  }

  const value = {
    records,
    selectedRecordId,
    isLoading,
    error,
    fetchRecords,
    fetchSingleRecord,
    getRecordById,
    getRecordByHash,
    setSelectedRecord,
    updateRecordStatus,
    addRecord
  }

  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>
}

export function useRecords() {
  const context = useContext(RecordsContext)
  if (!context) {
    throw new Error('useRecords must be used within RecordsProvider')
  }
  return context
}
