/**
 * Stellar Contract Service - Soroban Integration
 * Handles all smart contract interactions
 * Every write operation follows: build → simulate → sign → submit → poll
 */

import * as StellarSdk from '@stellar/stellar-sdk'
import { signTransactionWithFreighter } from './stellarWallet'

// Environment configuration
const RPC_URL = import.meta.env.VITE_STELLAR_RPC_URL
const NETWORK_PASSPHRASE = import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE
const RECORDS_CONTRACT_ID = import.meta.env.VITE_RECORDS_CONTRACT_ID
const VERIFICATION_CONTRACT_ID = import.meta.env.VITE_VERIFICATION_CONTRACT_ID

console.log('[Contract] Service initialized', {
  RPC_URL,
  NETWORK_PASSPHRASE,
  RECORDS_CONTRACT_ID: RECORDS_CONTRACT_ID ? '***configured***' : 'missing',
  VERIFICATION_CONTRACT_ID: VERIFICATION_CONTRACT_ID ? '***configured***' : 'missing'
})

// Initialize Soroban RPC server
let server = null
try {
  if (RPC_URL) {
    server = new StellarSdk.SorobanRpc.Server(RPC_URL)
    console.log('[Contract] Soroban RPC server initialized')
  } else {
    console.warn('[Contract] RPC_URL not configured')
  }
} catch (error) {
  console.error('[Contract] Failed to initialize RPC server:', error)
}

// Contract instances
let recordsContract = null
let verificationContract = null

try {
  if (RECORDS_CONTRACT_ID) {
    recordsContract = new StellarSdk.Contract(RECORDS_CONTRACT_ID)
    console.log('[Contract] Records contract initialized')
  } else {
    console.warn('[Contract] RECORDS_CONTRACT_ID not configured')
  }
} catch (error) {
  console.error('[Contract] Failed to initialize records contract:', error)
}

try {
  if (VERIFICATION_CONTRACT_ID) {
    verificationContract = new StellarSdk.Contract(VERIFICATION_CONTRACT_ID)
    console.log('[Contract] Verification contract initialized')
  } else {
    console.warn('[Contract] VERIFICATION_CONTRACT_ID not configured')
  }
} catch (error) {
  console.error('[Contract] Failed to initialize verification contract:', error)
}

/**
 * INTERNAL HELPER: Execute a transaction (build → simulate → sign → submit → poll)
 * @private
 * @param {StellarSdk.Transaction} transaction - Built transaction
 * @param {string} publicKey - Caller's public key
 * @returns {Promise<string>} - Transaction hash
 * @throws {Error} - With appropriate error category
 */
async function executeTransaction(transaction, publicKey) {
  try {
    if (!server) {
      throw new Error('CONTRACT_READ_FAILED: Stellar RPC server not configured')
    }

    console.log('[Contract] Executing transaction for:', publicKey)

    // Step 1: Simulate
    console.log('[Contract] Simulating transaction...')
    const simulationResult = await server.simulateTransaction(transaction)

    if (StellarSdk.SorobanRpc.Api.isSimulationError(simulationResult)) {
      const errorMsg = simulationResult.error || 'Unknown simulation error'
      throw new Error(`TRANSACTION_SIMULATION_FAILED: ${errorMsg}`)
    }

    // Step 2: Prepare
    console.log('[Contract] Preparing transaction...')
    const preparedTx = StellarSdk.SorobanRpc.assembleTransaction(
      transaction,
      simulationResult
    ).build()

    // Step 3: Sign
    console.log('[Contract] Requesting signature from Freighter...')
    const signedXdr = await signTransactionWithFreighter(
      preparedTx.toXDR(),
      NETWORK_PASSPHRASE
    )

    // Step 4: Reconstruct signed transaction
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(
      signedXdr,
      NETWORK_PASSPHRASE
    )

    // Step 5: Submit
    console.log('[Contract] Submitting transaction...')
    const submitResult = await server.sendTransaction(signedTx)

    if (submitResult.status === 'ERROR') {
      throw new Error(`TRANSACTION_SUBMISSION_FAILED: ${submitResult.errorResultXdr}`)
    }

    console.log('[Contract] Transaction submitted:', submitResult.hash)

    // Step 6: Poll for confirmation
    console.log('[Contract] Polling for confirmation...')
    let status = submitResult.status
    let attempts = 0
    const maxAttempts = 30

    while (status === 'PENDING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const txResult = await server.getTransaction(submitResult.hash)
      status = txResult.status
      attempts++
      console.log(`[Contract] Poll attempt ${attempts}/${maxAttempts}: ${status}`)
    }

    if (status === 'PENDING') {
      throw new Error('TRANSACTION_TIMEOUT: Transaction confirmation timed out. Check Stellar Explorer for status.')
    }

    if (status === 'FAILED') {
      throw new Error(`TRANSACTION_SUBMISSION_FAILED: Transaction failed on-chain`)
    }

    console.log('[Contract] Transaction confirmed:', submitResult.hash)
    return submitResult.hash
  } catch (error) {
    console.error('[Contract] Transaction execution error:', error)
    throw error
  }
}

/**
 * Store a medical record on-chain
 * @param {string} publicKey - Patient's public key
 * @param {string} cid - IPFS CID of the file
 * @param {string} title - Record title
 * @param {string} category - Record category
 * @returns {Promise<Object>} - { hash: string, recordId: number }
 * @throws {Error} - With appropriate error category
 */
export async function storeRecord(publicKey, cid, title, category) {
  try {
    if (!recordsContract) {
      throw new Error('CONTRACT_READ_FAILED: Records contract not configured')
    }

    if (!server) {
      throw new Error('CONTRACT_READ_FAILED: Stellar RPC server not configured')
    }

    console.log('[Contract] Storing record:', { publicKey, cid, title, category })

    // Get account
    const account = await server.getAccount(publicKey)

    // Build operation
    const operation = recordsContract.call(
      'store_record',
      StellarSdk.Address.fromString(publicKey).toScVal(),
      StellarSdk.nativeToScVal(cid, { type: 'string' }),
      StellarSdk.nativeToScVal(title, { type: 'string' }),
      StellarSdk.nativeToScVal(category, { type: 'string' })
    )

    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(operation)
      .setTimeout(30)
      .build()

    // Execute
    const hash = await executeTransaction(transaction, publicKey)

    // Parse record ID from result (temporary - use timestamp as fallback)
    const recordId = Math.floor(Date.now() / 1000)

    return { hash, recordId }
  } catch (error) {
    console.error('[Contract] Store record error:', error)
    throw error
  }
}

/**
 * Get a single record by ID (read-only)
 * @param {number} recordId - Record ID
 * @returns {Promise<Object>} - Record object
 * @throws {Error} - With appropriate error category
 */
export async function getRecord(recordId) {
  try {
    if (!recordsContract || !server) {
      throw new Error('CONTRACT_READ_FAILED: Contract or RPC not configured')
    }

    console.log('[Contract] Getting record:', recordId)

    // Get a dummy account for simulation
    const dummyAccount = new StellarSdk.Account(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5V3VQ',
      '0'
    )

    // Build operation
    const operation = recordsContract.call(
      'get_record',
      StellarSdk.nativeToScVal(recordId, { type: 'u64' })
    )

    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(operation)
      .setTimeout(30)
      .build()

    // Simulate
    const result = await server.simulateTransaction(transaction)

    if (StellarSdk.SorobanRpc.Api.isSimulationError(result)) {
      throw new Error(`CONTRACT_READ_FAILED: ${result.error}`)
    }

    // Parse result
    const record = StellarSdk.scValToNative(result.result.retval)
    console.log('[Contract] Record retrieved:', record)

    return record
  } catch (error) {
    console.error('[Contract] Get record error:', error)
    throw error
  }
}

/**
 * Get all records for an owner (read-only)
 * @param {string} ownerPublicKey - Owner's public key
 * @returns {Promise<Array>} - Array of record objects
 * @throws {Error} - With appropriate error category
 */
export async function getRecordsByOwner(ownerPublicKey) {
  try {
    if (!recordsContract || !server) {
      throw new Error('CONTRACT_READ_FAILED: Contract or RPC not configured')
    }

    console.log('[Contract] Getting records for owner:', ownerPublicKey)

    // Get a dummy account for simulation
    const dummyAccount = new StellarSdk.Account(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5V3VQ',
      '0'
    )

    // Build operation
    const operation = recordsContract.call(
      'get_records_by_owner',
      StellarSdk.Address.fromString(ownerPublicKey).toScVal()
    )

    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(operation)
      .setTimeout(30)
      .build()

    // Simulate
    const result = await server.simulateTransaction(transaction)

    if (StellarSdk.SorobanRpc.Api.isSimulationError(result)) {
      throw new Error(`CONTRACT_READ_FAILED: ${result.error}`)
    }

    // Parse result
    const records = StellarSdk.scValToNative(result.result.retval) || []
    console.log('[Contract] Records retrieved:', records.length)

    return records
  } catch (error) {
    console.error('[Contract] Get records by owner error:', error)
    throw error
  }
}

/**
 * Get record count (read-only)
 * @returns {Promise<number>} - Total record count
 * @throws {Error} - With appropriate error category
 */
export async function getRecordCount() {
  try {
    if (!recordsContract || !server) {
      throw new Error('CONTRACT_READ_FAILED: Contract or RPC not configured')
    }

    console.log('[Contract] Getting record count...')

    // Get a dummy account for simulation
    const dummyAccount = new StellarSdk.Account(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5V3VQ',
      '0'
    )

    // Build operation
    const operation = recordsContract.call('get_record_count')

    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(operation)
      .setTimeout(30)
      .build()

    // Simulate
    const result = await server.simulateTransaction(transaction)

    if (StellarSdk.SorobanRpc.Api.isSimulationError(result)) {
      throw new Error(`CONTRACT_READ_FAILED: ${result.error}`)
    }

    // Parse result
    const count = StellarSdk.scValToNative(result.result.retval)
    console.log('[Contract] Record count:', count)

    return count
  } catch (error) {
    console.error('[Contract] Get record count error:', error)
    throw error
  }
}

/**
 * Get record with verification status (read-only)
 * @param {number} recordId - Record ID
 * @returns {Promise<Object>} - Record with verification status
 * @throws {Error} - With appropriate error category
 */
export async function getRecordWithStatus(recordId) {
  try {
    if (!recordsContract || !server) {
      throw new Error('CONTRACT_READ_FAILED: Contract or RPC not configured')
    }

    console.log('[Contract] Getting record with status:', recordId)

    // Get a dummy account for simulation
    const dummyAccount = new StellarSdk.Account(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5V3VQ',
      '0'
    )

    // Build operation
    const operation = recordsContract.call(
      'get_record_with_status',
      StellarSdk.nativeToScVal(recordId, { type: 'u64' }),
      StellarSdk.Address.fromString(VERIFICATION_CONTRACT_ID).toScVal()
    )

    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(operation)
      .setTimeout(30)
      .build()

    // Simulate
    const result = await server.simulateTransaction(transaction)

    if (StellarSdk.SorobanRpc.Api.isSimulationError(result)) {
      throw new Error(`CONTRACT_READ_FAILED: ${result.error}`)
    }

    // Parse result
    const record = StellarSdk.scValToNative(result.result.retval)
    console.log('[Contract] Record with status retrieved:', record)

    return record
  } catch (error) {
    console.error('[Contract] Get record with status error:', error)
    throw error
  }
}

/**
 * Verify a record (doctor action)
 * @param {string} doctorPublicKey - Doctor's public key
 * @param {number} recordId - Record ID
 * @param {string} status - "verified" or "rejected"
 * @param {string|null} reason - Rejection reason (required if rejected)
 * @returns {Promise<Object>} - { hash: string, success: boolean }
 * @throws {Error} - With appropriate error category
 */
export async function verifyRecord(doctorPublicKey, recordId, status, reason = null) {
  try {
    if (!verificationContract) {
      throw new Error('CONTRACT_READ_FAILED: Verification contract not configured')
    }

    if (!server) {
      throw new Error('CONTRACT_READ_FAILED: Stellar RPC server not configured')
    }

    console.log('[Contract] Verifying record:', { doctorPublicKey, recordId, status, reason })

    // Get account
    const account = await server.getAccount(doctorPublicKey)

    // Build operation
    const statusSymbol = status === 'verified' ? 'verified' : 'rejected'
    const reasonScVal = reason
      ? StellarSdk.nativeToScVal(reason, { type: 'string' })
      : StellarSdk.xdr.ScVal.scvVoid()

    const operation = verificationContract.call(
      'verify_record',
      StellarSdk.Address.fromString(doctorPublicKey).toScVal(),
      StellarSdk.nativeToScVal(recordId, { type: 'u64' }),
      StellarSdk.nativeToScVal(statusSymbol, { type: 'symbol' }),
      reasonScVal
    )

    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(operation)
      .setTimeout(30)
      .build()

    // Execute
    const hash = await executeTransaction(transaction, doctorPublicKey)

    return { hash, success: true }
  } catch (error) {
    console.error('[Contract] Verify record error:', error)
    throw error
  }
}

/**
 * Get verification for a record (read-only)
 * @param {number} recordId - Record ID
 * @returns {Promise<Object|null>} - Verification object or null
 * @throws {Error} - With appropriate error category
 */
export async function getVerification(recordId) {
  try {
    if (!verificationContract || !server) {
      throw new Error('CONTRACT_READ_FAILED: Contract or RPC not configured')
    }

    console.log('[Contract] Getting verification:', recordId)

    // Get a dummy account for simulation
    const dummyAccount = new StellarSdk.Account(
      'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5V3VQ',
      '0'
    )

    // Build operation
    const operation = verificationContract.call(
      'get_verification',
      StellarSdk.nativeToScVal(recordId, { type: 'u64' })
    )

    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(operation)
      .setTimeout(30)
      .build()

    // Simulate
    const result = await server.simulateTransaction(transaction)

    if (StellarSdk.SorobanRpc.Api.isSimulationError(result)) {
      throw new Error(`CONTRACT_READ_FAILED: ${result.error}`)
    }

    // Parse result
    const verification = StellarSdk.scValToNative(result.result.retval)
    console.log('[Contract] Verification retrieved:', verification)

    return verification || null
  } catch (error) {
    console.error('[Contract] Get verification error:', error)
    throw error
  }
}

/**
 * Get verification by hash (CID or record ID)
 * Used by public Verify page
 * @param {string} cipOrHash - Record ID (numeric string) or CID
 * @returns {Promise<Object|null>} - Record with verification status or null
 * @throws {Error} - With appropriate error category
 */
export async function getVerificationByHash(cipOrHash) {
  try {
    console.log('[Contract] Getting verification by hash:', cipOrHash)

    // Check if it's a numeric record ID
    if (/^\d+$/.test(cipOrHash)) {
      const recordId = parseInt(cipOrHash, 10)
      return await getRecordWithStatus(recordId)
    }

    // It's a CID - search for it
    console.log('[Contract] Searching for CID:', cipOrHash)

    const count = await getRecordCount()
    console.log('[Contract] Total records:', count)

    // Search from ID 1 to count
    for (let i = 1; i <= count; i++) {
      try {
        const record = await getRecord(i)
        if (record && record.cid === cipOrHash) {
          console.log('[Contract] Found record with CID:', i)
          return await getRecordWithStatus(i)
        }
      } catch (error) {
        // Continue searching if individual record fetch fails
        console.log(`[Contract] Skipping record ${i}:`, error.message)
      }
    }

    console.log('[Contract] Record not found for CID:', cipOrHash)
    return null
  } catch (error) {
    console.error('[Contract] Get verification by hash error:', error)
    throw error
  }
}
