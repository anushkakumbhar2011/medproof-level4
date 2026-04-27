import axios from 'axios'

// Environment configuration
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY

console.log('IPFS Config:', {
  PINATA_JWT: PINATA_JWT ? '***configured***' : 'missing',
  PINATA_GATEWAY
})

/**
 * Upload a file to IPFS via Pinata
 * @param {File} file - The file to upload
 * @param {Object} metadata - Additional metadata (title, category, etc.)
 * @returns {Promise<Object>} - { success, cid, error }
 */
export async function uploadToIPFS(file, metadata = {}) {
  try {
    console.log('Uploading to IPFS:', { fileName: file.name, fileSize: file.size, metadata })

    if (!PINATA_JWT) {
      throw new Error('Pinata JWT not configured. Please set VITE_PINATA_JWT in .env')
    }

    // Create FormData
    const formData = new FormData()
    formData.append('file', file)

    // Add metadata
    const pinataMetadata = {
      name: metadata.title || file.name,
      keyvalues: {
        category: metadata.category || 'general',
        uploadedAt: new Date().toISOString(),
        ...metadata
      }
    }
    formData.append('pinataMetadata', JSON.stringify(pinataMetadata))

    // Upload to Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${PINATA_JWT}`
        },
        maxBodyLength: Infinity
      }
    )

    console.log('IPFS upload response:', response.data)

    const cid = response.data.IpfsHash
    console.log('File uploaded to IPFS with CID:', cid)

    return {
      success: true,
      cid,
      size: response.data.PinSize,
      timestamp: response.data.Timestamp
    }
  } catch (error) {
    console.error('Error uploading to IPFS:', error)
    
    let errorMessage = 'Failed to upload file to IPFS'
    if (error.response) {
      errorMessage = error.response.data?.error?.details || error.response.data?.message || errorMessage
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Get the full IPFS URL for a CID
 * @param {string} cid - The IPFS CID
 * @returns {string} - Full gateway URL
 */
export function getIPFSUrl(cid) {
  if (!cid) return ''
  
  if (!PINATA_GATEWAY) {
    console.warn('Pinata gateway not configured, using default')
    return `https://gateway.pinata.cloud/ipfs/${cid}`
  }

  return `${PINATA_GATEWAY}${cid}`
}

/**
 * Fetch file metadata from IPFS
 * @param {string} cid - The IPFS CID
 * @returns {Promise<Object>} - File metadata
 */
export async function getIPFSMetadata(cid) {
  try {
    console.log('Fetching IPFS metadata for CID:', cid)

    if (!PINATA_JWT) {
      throw new Error('Pinata JWT not configured')
    }

    const response = await axios.get(
      `https://api.pinata.cloud/data/pinList?hashContains=${cid}`,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`
        }
      }
    )

    console.log('IPFS metadata response:', response.data)

    if (response.data.rows && response.data.rows.length > 0) {
      return {
        success: true,
        metadata: response.data.rows[0]
      }
    }

    return {
      success: false,
      error: 'Metadata not found'
    }
  } catch (error) {
    console.error('Error fetching IPFS metadata:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Check if a CID is pinned on Pinata
 * @param {string} cid - The IPFS CID
 * @returns {Promise<boolean>}
 */
export async function isPinned(cid) {
  try {
    const result = await getIPFSMetadata(cid)
    return result.success
  } catch (error) {
    console.error('Error checking pin status:', error)
    return false
  }
}

/**
 * Unpin a file from IPFS (admin function)
 * @param {string} cid - The IPFS CID
 * @returns {Promise<Object>}
 */
export async function unpinFromIPFS(cid) {
  try {
    console.log('Unpinning from IPFS:', cid)

    if (!PINATA_JWT) {
      throw new Error('Pinata JWT not configured')
    }

    const response = await axios.delete(
      `https://api.pinata.cloud/pinning/unpin/${cid}`,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`
        }
      }
    )

    console.log('Unpin response:', response.data)

    return {
      success: true,
      message: 'File unpinned successfully'
    }
  } catch (error) {
    console.error('Error unpinning from IPFS:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
