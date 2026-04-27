import React, { useState } from 'react'

function VerificationResult({ status, data }) {
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
          Please check the hash or contact the record owner for the correct ID.
        </p>
      </div>
    )
  }

  if (status === 'verified' && data) {
    return (
      <>
        <div className="bg-white border border-gray-200 rounded-card overflow-hidden" style={{ borderWidth: '0.5px' }}>
          {/* Card Header */}
          <div className="flex items-start gap-3 p-6 border-b border-gray-200" style={{ borderWidth: '0.5px' }}>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6BAE3E" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium mb-1">{data.title}</h3>
              <p className="text-sm text-gray-600">{data.category}</p>
            </div>
          </div>

          {/* Metadata Rows */}
          <div className="divide-y divide-gray-200">
            <div className="flex items-center justify-between px-6 py-3">
              <span className="text-sm text-gray-600">Verification status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Verified on-chain</span>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-3">
              <span className="text-sm text-gray-600">Verified by</span>
              <span className="text-sm font-medium">{data.doctor}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-3">
              <span className="text-sm text-gray-600">Wallet address</span>
              <span className="text-sm font-medium font-mono">
                {data.wallet.slice(0, 10)}...{data.wallet.slice(-8)}
              </span>
            </div>
            <div className="flex items-center justify-between px-6 py-3">
              <span className="text-sm text-gray-600">Verification date</span>
              <span className="text-sm font-medium">{data.date}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-3">
              <span className="text-sm text-gray-600">Record hash</span>
              <span className="text-sm font-medium font-mono">
                {data.hash.slice(0, 16)}...
              </span>
            </div>
            <div className="px-6 py-3">
              <a 
                href={`https://etherscan.io/tx/${data.hash}`}
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
          </div>
        </div>

        {/* Privacy Disclaimer */}
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

export default function PublicVerification() {
  const [searchQuery, setSearchQuery] = useState('')
  const [verificationStatus, setVerificationStatus] = useState(null)
  const [resultData, setResultData] = useState(null)

  const handleVerify = (e) => {
    e.preventDefault()
    
    if (!searchQuery.trim()) return

    // Simulate verification
    setVerificationStatus('loading')
    
    setTimeout(() => {
      // Simulate found record
      if (searchQuery.includes('0x7f3a')) {
        setVerificationStatus('verified')
        setResultData({
          title: 'Blood Test Results - Complete Panel',
          category: 'Haematology',
          doctor: 'Dr. Sarah Chen',
          wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          date: 'March 16, 2026',
          hash: '0x7f3a9b2c8d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a'
        })
      } else {
        setVerificationStatus('not-found')
        setResultData(null)
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[520px]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#6BAE3E" stroke="#6BAE3E" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <span className="text-xl font-medium">MedProof</span>
          </div>
          
          <h1 className="text-4xl font-medium mb-3">Verify a medical record</h1>
          <p className="text-gray-600">
            Enter a record ID or on-chain hash. No sensitive data is revealed.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleVerify} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Record ID or 0x hash..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-button font-mono text-sm focus:outline-none focus:border-primary transition-colors"
              style={{ borderWidth: '0.5px' }}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white rounded-button hover:bg-primary/90 transition-colors font-medium whitespace-nowrap"
            >
              Verify
            </button>
          </div>
        </form>

        {/* Result States */}
        {verificationStatus && (
          <VerificationResult status={verificationStatus} data={resultData} />
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          Powered by MedProof · Ethereum mainnet
          <span className="mx-2">·</span>
          <a href="#platform" className="hover:text-gray-700 underline">
            Full platform
          </a>
        </div>
      </div>
    </div>
  )
}
