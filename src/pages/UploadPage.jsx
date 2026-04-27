import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecords } from '../context/RecordsContext'
import { useAuth } from '../context/AuthContext'
import { uploadFileToPinata, uploadMetadataToPinata, unpinFromPinata } from '../services/ipfsUpload'
import { storeRecord } from '../services/stellarContract'

export default function UploadPage() {
  const navigate = useNavigate()
  const { addRecord, fetchRecords } = useRecords()
  const { walletAddress } = useAuth()
  const fileInputRef = useRef(null)
  
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: ''
  })

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e) => {
    console.log('[Upload] File input changed')
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      console.log('[Upload] Selected file:', selectedFile.name, selectedFile.size, selectedFile.type)
      setFile(selectedFile)
    }
  }

  const handleUploadAreaClick = () => {
    console.log('[Upload] Upload area clicked')
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate
    if (!file) {
      setUploadStatus('error')
      return
    }

    if (!formData.title.trim()) {
      setUploadStatus('error')
      return
    }

    if (!formData.category) {
      setUploadStatus('error')
      return
    }

    if (!walletAddress) {
      setUploadStatus('error')
      console.error('[Upload] No wallet connected')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadStatus(null)

    let fileCID = null

    try {
      // Step 1: Upload file to IPFS (0-40%)
      console.log('[Upload] Step 1: Uploading file to IPFS...')
      setUploadProgress(10)

      fileCID = await uploadFileToPinata(file)
      console.log('[Upload] File uploaded, CID:', fileCID)
      setUploadProgress(40)

      // Step 2: Upload metadata (40-65%)
      console.log('[Upload] Step 2: Uploading metadata...')
      setUploadProgress(45)

      const metadataCID = await uploadMetadataToPinata({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        uploadedBy: walletAddress,
        timestamp: Date.now()
      })
      console.log('[Upload] Metadata uploaded, CID:', metadataCID)
      setUploadProgress(65)

      // Step 3: Store on blockchain (65-90%)
      console.log('[Upload] Step 3: Storing on blockchain...')
      setUploadProgress(70)

      const contractResult = await storeRecord(
        walletAddress,
        fileCID,
        formData.title,
        formData.category
      )

      console.log('[Upload] Blockchain storage successful, hash:', contractResult.hash)
      setUploadProgress(90)

      // Step 4: Update UI (90-100%)
      const newRecord = {
        id: contractResult.recordId?.toString() || `rec_${Date.now()}`,
        title: formData.title,
        category: formData.category,
        status: 'pending',
        uploadedBy: 'Patient',
        patientAddr: walletAddress,
        hash: fileCID,
        txHash: contractResult.hash,
        date: new Date().toISOString().split('T')[0],
        verifiedBy: null,
        verifiedAt: null,
        fileType: file.type.includes('pdf') ? 'PDF' : 'Image',
        fileSize: formatFileSize(file.size),
        priority: 'medium'
      }
      
      addRecord(newRecord)
      setUploadProgress(100)
      setIsUploading(false)
      setUploadStatus('success')
      
      // Refresh records from blockchain
      if (fetchRecords) {
        await fetchRecords(walletAddress)
      }
      
      // Navigate back after delay
      setTimeout(() => {
        navigate('/dashboard/patient')
      }, 1500)
    } catch (error) {
      console.error('[Upload] Error:', error)

      // Clean up orphaned IPFS file if contract call failed
      if (fileCID && error.message?.includes('CONTRACT') || error.message?.includes('TRANSACTION')) {
        try {
          console.log('[Upload] Cleaning up orphaned IPFS file:', fileCID)
          await unpinFromPinata(fileCID)
        } catch (unpinError) {
          console.error('[Upload] Unpin error:', unpinError)
        }
      }

      setUploadStatus('error')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-[600px] mx-auto">
        {/* Back Navigation */}
        <button 
          onClick={() => navigate(-1) || navigate('/dashboard/patient')} 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-primary font-medium mb-2">
            Patient · Upload
          </div>
          <h1 className="text-4xl font-medium mb-2">Upload medical record</h1>
          <p className="text-gray-600">
            Your files are encrypted client-side with AES-256 before upload to ensure complete privacy.
          </p>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleUploadAreaClick}
          className={`relative border-[1.5px] border-dashed rounded-card p-12 text-center mb-6 transition-all cursor-pointer ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-primary hover:bg-primary/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
          />
          
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6BAE3E" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium mb-2">Drag & drop your file here</h3>
          <p className="text-gray-600 mb-3">or browse to upload</p>
          <p className="text-sm text-gray-500">PDF, JPEG, PNG · Max 25 MB</p>
        </div>

        {/* Encryption Notice */}
        <div className="bg-[#EAF3DE] rounded-button p-4 mb-6 flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3a7020" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <p className="text-sm text-[#3a7020]">
            Files are AES-256 encrypted in your browser before leaving your device
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Record title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Blood Test Results - Complete Panel"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-input focus:outline-none focus:border-primary transition-colors"
              style={{ borderWidth: '0.5px' }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-input focus:outline-none focus:border-primary transition-colors bg-white"
              style={{ borderWidth: '0.5px' }}
              required
            >
              <option value="">Select a category</option>
              <option value="haematology">Haematology</option>
              <option value="radiology">Radiology</option>
              <option value="immunology">Immunology</option>
              <option value="general">General</option>
              <option value="dental">Dental</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any relevant notes or context for the reviewing doctor..."
              rows="3"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-input focus:outline-none focus:border-primary transition-colors resize-none"
              style={{ borderWidth: '0.5px' }}
            />
          </div>

          {/* Upload Progress */}
          {file && (
            <div className="bg-gray-50 rounded-button p-4 border border-gray-200" style={{ borderWidth: '0.5px' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                  </svg>
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              
              {isUploading && (
                <>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span>Encrypting & uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Error State */}
          {uploadStatus === 'error' && (
            <div className="bg-[#FCEBEB] border border-red-200 rounded-button p-4 text-sm text-[#A32D2D]">
              Upload failed. Please check your connection and try again.
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!file || isUploading || uploadStatus === 'success'}
            className={`w-full px-6 py-3 rounded-button font-medium transition-colors flex items-center justify-center gap-2 ${
              uploadStatus === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-primary text-white hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed'
            }`}
          >
            {uploadStatus === 'success' ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Record submitted successfully
              </>
            ) : isUploading ? (
              <>
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Encrypting & uploading...
              </>
            ) : (
              'Submit for verification'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
