import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getVerificationByHash } from '../services/stellarContract'
import { getFileUrl } from '../services/ipfsUpload'

function VerificationResult({ status, data, error }) {
  if (status === 'loading') {
    return (
      <div className="bg-white border border-gray-200 rounded-card p-6 animate-pulse" style={{ borderWidth: '0.5px' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
        <p className="text-sm text-gray-500 text-center mt-4">Verifying on-chain...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="bg-[#FCEBEB] border border-red-200 rounded-card p-8 text-center" style={{ borderWidth: '0.5px' }}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A32D2D" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h3 className="text-xl font-medium text-[#A32D2D] mb-2">Verification lookup failed</h3>
        <p className="text-sm text-[#A32D2D]/80">{error || 'An unexpected error occurred.'}</p>
      </div>
    )
  }

  if (status === 'not-found') {
    return (
      <div className="bg-[#FCEBEB] border border-red-200 rounded-card p-8 text-center" style={{ borderWidth: '0.5px' }}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A32D2D" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h3 className="text-xl font-medium text-[#A32D2D] mb-2">Record not found</h3>
        <p className="text-sm text-[#A32D2D]/80">
          RECORD_NOT_FOUND: Record not found on-chain. Verify the record ID or hash and try again.
        </p>
      </div>
    )
  }

  if (status === 'found' && data) {
    const verificationStatus = data.status || data.verificationStatus || 'pending'
    const isVerified = verificationStatus === 'verified'
    const isRejected = verificationStatus === 'rejected'
    const isPending = !isVerified && !isRejected

    const statusConfig = {
      verified: { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500', label: 'Verified on-chain' },
      rejected: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', label: 'Rejected' },
      pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', label: 'Pending verification' },
    }
    const cfg = statusConfig[verificationStatus] || statusConfig.pending

    const cid = data.cid || data.hash
    const owner = data.owner || data.patientAddr
    const doctor = data.doctor || data.verifiedBy || data.verified_by
    const verifiedAt = data.verified_at || data.verifiedAt
    const explorerBase = 'https://stellar.expert/explorer/testnet'

    return (
      <>
        <div className="bg-white border border-gray-200 rounded-card overflow-hidden" style={{ borderWidth: '0.5px' }}>
          <div className="flex items-start gap-3 p-6 border-b border-gray-200" style={{ borderWidth: '0.5px' }}>
            <div className={`w-12 h-12 ${isVerified ? 'bg-primary/10' : isRejected ? 'bg-red-100' : 'bg-amber-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
              {isVerified && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6BAE3E" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              )}
              {isRejected && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A32D2D" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              )}
              {isPending && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium mb-1">{data.title || 'Medical Record'}</h3>
              <p className="text-sm text-gray-600">{data.category || 'General'}</p>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            <div className="flex items-center justify-between px-6 py-3">
              <span className="text-sm text-gray-600">Verification status</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 ${cfg.dot} rounded-full`}></div>
                <span className={`text-sm font-medium ${cfg.text}`}>{cfg.label}</span>
              </div>
            </div>

            {doctor && (
              <div className="flex items-center justify-between px-6 py-3">
                <span className="text-sm text-gray-600">Verified by</span>
                <span className="text-sm font-medium font-mono">
                  {typeof doctor === 'string' ? `${doctor.slice(0, 8)}...${doctor.slice(-6)}` : String(doctor)}
                </span>
              </div>
            )}

            {owner && (
              <div className="flex items-center justify-between px-6 py-3">
                <span className="text-sm text-gray-600">Patient address</span>
                <span className="text-sm font-medium font-mono">
                  {typeof owner === 'string' ? `${owner.slice(0, 8)}...${owner.slice(-6)}` : String(owner)}
                </span>
              </div>
            )}

            {verifiedAt && (
              <div className="flex items-center justify-between px-6 py-3">
                <span className="text-sm text-gray-600">Verification date</span>
                <span className="text-sm font-medium">
                  {new Date(
                    typeof verifiedAt === 'number' ? verifiedAt * 1000 : verifiedAt
                  ).toLocaleDateString()}
                </span>
              </div>
            )}

            {cid && (
              <div className="flex items-center justify-between px-6 py-3">
                <span className="text-sm text-gray-600">Record CID</span>
                <span className="text-sm font-medium font-mono">
                  {cid.slice(0, 12)}...{cid.slice(-6)}
                </span>
              </div>
            )}

            {cid && (
              <div className="px-6 py-3 flex items-center gap-4">
                <a
                  href={getFileUrl(cid)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-primary/80 inline-flex items-center gap-1"
                >
                  View on IPFS
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                </a>
                <a
                  href={`${explorerBase}/contract/${import.meta.env.VITE_RECORDS_CONTRACT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  View on Stellar Expert
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-100 rounded-full px-4 py-2 text-center mt-6">
          <p className="text-xs text-gray-600">
            This confirms authenticity only. Medical contents are private and encrypted.
          </p>
        </div>
      </>
    )
  }

  return null
}

export default function Verify() {
  console.log('[Verify] Page loaded')
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [verificationStatus, setVerificationStatus] = useState(null)
  const [resultData, setResultData] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleVerify = async (e) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    setVerificationStatus('loading')
    setResultData(null)
    setErrorMessage(null)

    try {
      console.log('[Verify] Looking up:', searchQuery.trim())
      const record = await getVerificationByHash(searchQuery.trim())

      if (!record) {
        setVerificationStatus('not-found')
        return
      }

      console.log('[Verify] Record found:', record)
      setResultData(record)
      setVerificationStatus('found')
    } catch (error) {
      console.error('[Verify] Lookup error:', error)
      setErrorMessage(error.message)
      setVerificationStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[520px]">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#6BAE3E" stroke="#6BAE3E" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <span className="text-xl font-medium">MedProof</span>
          </div>

          <h1 className="text-4xl font-medium mb-3">Verify a medical record</h1>
          <p className="text-gray-600">
            Enter a record ID or IPFS CID. No sensitive data is revealed.
          </p>
        </div>

        <form onSubmit={handleVerify} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Record ID or IPFS CID..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-button font-mono text-sm focus:outline-none focus:border-primary transition-colors"
              style={{ borderWidth: '0.5px' }}
            />
            <button
              type="submit"
              disabled={verificationStatus === 'loading'}
              className="px-6 py-3 bg-primary text-white rounded-button hover:bg-primary/90 transition-colors font-medium whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {verificationStatus === 'loading' ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>

        {verificationStatus && (
          <VerificationResult
            status={verificationStatus}
            data={resultData}
            error={errorMessage}
          />
        )}

        <div className="text-center mt-8 text-xs text-gray-500">
          Powered by MedProof · Stellar Testnet
          <span className="mx-2">·</span>
          <a href="/" className="hover:text-gray-700 underline">
            Full platform
          </a>
        </div>
      </div>
    </div>
  )
}
