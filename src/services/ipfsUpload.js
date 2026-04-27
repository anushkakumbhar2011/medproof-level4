/**
 * IPFS Upload Service - Pinata Integration
 * Handles all file and metadata uploads to IPFS via Pinata API
 * No mock CIDs - all uploads return real CIDs from Pinata
 */

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY

console.log('[IPFS] Service initialized', {
  hasJWT: !!PINATA_JWT,
  gateway: PINATA_GATEWAY
})

/**
 * Upload a file to Pinata IPFS
 * @param {File} file - Browser File object
 * @returns {Promise<string>} - IPFS CID (e.g., "QmXyz...")
 * @throws {Error} - With full API error message
 */
export async function uploadFileToPinata(file) {
  try {
    if (!PINATA_JWT) {
      throw new Error('IPFS_UPLOAD_FAILED: Pinata JWT not configured in environment')
    }

    if (!file) {
      throw new Error('IPFS_UPLOAD_FAILED: No file provided')
    }

    console.log('[IPFS] Uploading file to Pinata:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.details || errorData.message || response.statusText
      throw new Error(`IPFS_UPLOAD_FAILED: ${errorMessage}`)
    }

    const data = await response.json()
    console.log('[IPFS] File uploaded successfully:', data)

    if (!data.IpfsHash) {
      throw new Error('IPFS_UPLOAD_FAILED: No CID returned from Pinata')
    }

    return data.IpfsHash
  } catch (error) {
    console.error('[IPFS] Upload file error:', error)
    throw error
  }
}

/**
 * Upload metadata JSON to Pinata IPFS
 * @param {Object} metadata - Plain JavaScript object with record metadata
 * @returns {Promise<string>} - IPFS CID of the metadata JSON
 * @throws {Error} - With full API error message
 */
export async function uploadMetadataToPinata(metadata) {
  try {
    if (!PINATA_JWT) {
      throw new Error('IPFS_UPLOAD_FAILED: Pinata JWT not configured in environment')
    }

    if (!metadata || typeof metadata !== 'object') {
      throw new Error('IPFS_UPLOAD_FAILED: Invalid metadata object')
    }

    console.log('[IPFS] Uploading metadata to Pinata:', metadata)

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pinataContent: metadata
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.details || errorData.message || response.statusText
      throw new Error(`IPFS_UPLOAD_FAILED: ${errorMessage}`)
    }

    const data = await response.json()
    console.log('[IPFS] Metadata uploaded successfully:', data)

    if (!data.IpfsHash) {
      throw new Error('IPFS_UPLOAD_FAILED: No CID returned from Pinata for metadata')
    }

    return data.IpfsHash
  } catch (error) {
    console.error('[IPFS] Upload metadata error:', error)
    throw error
  }
}

/**
 * Construct a gateway URL for an IPFS CID
 * @param {string} cid - IPFS CID
 * @returns {string} - Full gateway URL
 */
export function getFileUrl(cid) {
  if (!cid) {
    console.warn('[IPFS] No CID provided to getFileUrl')
    return ''
  }

  const gateway = PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/'
  const url = `${gateway}${cid}`
  console.log('[IPFS] Generated file URL:', url)
  return url
}

/**
 * Unpin a file from Pinata (cleanup function)
 * @param {string} cid - IPFS CID to unpin
 * @returns {Promise<boolean>} - True on success
 * @throws {Error} - On failure
 */
export async function unpinFromPinata(cid) {
  try {
    if (!PINATA_JWT) {
      throw new Error('IPFS_UPLOAD_FAILED: Pinata JWT not configured')
    }

    if (!cid) {
      throw new Error('IPFS_UPLOAD_FAILED: No CID provided to unpin')
    }

    console.log('[IPFS] Unpinning from Pinata:', cid)

    const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.details || errorData.message || response.statusText
      throw new Error(`IPFS_UPLOAD_FAILED: Unpin failed - ${errorMessage}`)
    }

    console.log('[IPFS] File unpinned successfully:', cid)
    return true
  } catch (error) {
    console.error('[IPFS] Unpin error:', error)
    throw error
  }
}
