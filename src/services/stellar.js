import * as StellarSdk from '@stellar/stellar-sdk'
import { isConnected, getAddress, signTransaction } from '@stellar/freighter-api'

// Environment configuration
const RPC_URL = import.meta.env.VITE_STELLAR_RPC_URL
const NETWORK_PASSPHRASE = import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE
const RECORDS_CONTRACT_ID = import.meta.env.VITE_RECORDS_CONTRACT_ID
const VERIFICATION_CONTRACT_ID = import.meta.env.VITE_VERIFICATION_CONTRACT_ID

console.log('Stellar Config:', {
  RPC_URL,
  NETWORK_PASSPHRASE,
  RECORDS_CONTRACT_ID,
  VERIFICATION_CONTRACT_ID
})

// Initialize Soroban server
let server = null
if (RPC_URL) {
  server = new StellarSdk.SorobanRpc.Server(RPC_URL)
}

/**
 * Check if Freighter wallet is installed and connected
 */
export async function checkFreighterConnection() {
  try {
    const connected = await isConnected()
    console.log('Freighter connected:', connected)
    return connected
  } catch (error) {
    console.error('Error checking Freighter connection:', error)
    return false
  }
}

/**
 * Connect to Freighter wallet and get public key
 */
export async function connectFreighter() {
  try {
    const connected = await isConnected()
    if (!connected) {
      throw new Error('Freighter wallet is not installed or not connected')
    }

    const publicKey = await getAddress()
    console.log('Connected wallet:', publicKey)
    return { success: true, publicKey }
  } catch (error) {
    console.error('Error connecting to Freighter:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Build, simulate, sign, and submit a transaction
 */
async function buildAndSubmitTransaction(sourceAccount, operation) {
  try {
    if (!server) {
      throw new Error('Stellar RPC server not configured')
    }

    // Load account
    const account = await server.getAccount(sourceAccount)
    console.log('Account loaded:', account.accountId())

    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(operation)
      .setTimeout(30)
      .build()

    console.log('Transaction built')

    // Simulate transaction
    const simulatedTx = await server.simulateTransaction(transaction)
    console.log('Transaction simulated:', simulatedTx)

    if (StellarSdk.SorobanRpc.Api.isSimulationError(simulatedTx)) {
      throw new Error(`Simulation failed: ${simulatedTx.error}`)
    }

    // Prepare transaction
    const preparedTx = StellarSdk.SorobanRpc.assembleTransaction(
      transaction,
      simulatedTx
    ).build()

    console.log('Transaction prepared for signing')

    // Sign with Freighter
    const signedXDR = await signTransaction(preparedTx.toXDR(), {
      network: NETWORK_PASSPHRASE,
      accountToSign: sourceAccount
    })

    console.log('Transaction signed')

    // Submit transaction
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(
      signedXDR,
      NETWORK_PASSPHRASE
    )

    const result = await server.sendTransaction(signedTx)
    console.log('Transaction submitted:', result)

    // Wait for confirmation
    let status = result.status
    let attempts = 0
    const maxAttempts = 30

    while (status === 'PENDING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const txResult = await server.getTransaction(result.hash)
      status = txResult.status
      attempts++
      console.log(`Checking transaction status (${attempts}/${maxAttempts}):`, status)
    }

    if (status === 'SUCCESS') {
      console.log('Transaction confirmed:', result.hash)
      return { success: true, hash: result.hash }
    } else {
      throw new Error(`Transaction failed with status: ${status}`)
    }
  } catch (error) {
    console.error('Transaction error:', error)
    throw error
  }
}

/**
 * Store a medical record on-chain
 */
export async function storeRecord(ownerAddress, cid, title, category) {
  try {
    console.log('Storing record:', { ownerAddress, cid, title, category })

    if (!RECORDS_CONTRACT_ID) {
      throw new Error('Records contract ID not configured')
    }

    const contract = new StellarSdk.Contract(RECORDS_CONTRACT_ID)

    const operation = contract.call(
      'store_record',
      StellarSdk.Address.fromString(ownerAddress).toScVal(),
      StellarSdk.nativeToScVal(cid, { type: 'string' }),
      StellarSdk.nativeToScVal(title, { type: 'string' }),
      StellarSdk.nativeToScVal(category, { type: 'string' })
    )

    const result = await buildAndSubmitTransaction(ownerAddress, operation)
    
    // Parse record ID from result
    // Note: In production, you'd parse the actual return value from the transaction
    console.log('Record stored successfully:', result)
    
    return {
      success: true,
      hash: result.hash,
      recordId: Date.now() // Temporary - should parse from transaction result
    }
  } catch (error) {
    console.error('Error storing record:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get a single record by ID
 */
export async function getRecord(recordId) {
  try {
    console.log('Getting record:', recordId)

    if (!server || !RECORDS_CONTRACT_ID) {
      throw new Error('Stellar configuration incomplete')
    }

    const contract = new StellarSdk.Contract(RECORDS_CONTRACT_ID)
    
    const operation = contract.call(
      'get_record',
      StellarSdk.nativeToScVal(recordId, { type: 'u64' })
    )

    // For read-only operations, we can simulate without signing
    const account = await server.getAccount(await getAddress())
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(operation)
      .setTimeout(30)
      .build()

    const result = await server.simulateTransaction(transaction)
    
    if (StellarSdk.SorobanRpc.Api.isSimulationError(result)) {
      throw new Error(`Simulation failed: ${result.error}`)
    }

    // Parse result
    const parsedResult = StellarSdk.scValToNative(result.result.retval)
    console.log('Record retrieved:', parsedResult)
    
    return { success: true, record: parsedResult }
  } catch (error) {
    console.error('Error getting record:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all records for an owner
 */
export async function getRecordsByOwner(ownerAddress) {
  try {
    console.log('Getting records for owner:', ownerAddress)

    if (!server || !RECORDS_CONTRACT_ID) {
      throw new Error('Stellar configuration incomplete')
    }

    const contract = new StellarSdk.Contract(RECORDS_CONTRACT_ID)
    
    const operation = contract.call(
      'get_records_by_owner',
      StellarSdk.Address.fromString(ownerAddress).toScVal()
    )

    const account = await server.getAccount(ownerAddress)
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(operation)
      .setTimeout(30)
      .build()

    const result = await server.simulateTransaction(transaction)
    
    if (StellarSdk.SorobanRpc.Api.isSimulationError(result)) {
      throw new Error(`Simulation failed: ${result.error}`)
    }

    const parsedResult = StellarSdk.scValToNative(result.result.retval)
    console.log('Records retrieved:', parsedResult)
    
    return { success: true, records: parsedResult || [] }
  } catch (error) {
    console.error('Error getting records:', error)
    return { success: false, error: error.message, records: [] }
  }
}

/**
 * Verify a record (doctor action)
 */
export async function verifyRecord(doctorAddress, recordId, status, reason = null) {
  try {
    console.log('Verifying record:', { doctorAddress, recordId, status, reason })

    if (!VERIFICATION_CONTRACT_ID) {
      throw new Error('Verification contract ID not configured')
    }

    const contract = new StellarSdk.Contract(VERIFICATION_CONTRACT_ID)

    const operation = contract.call(
      'verify_record',
      StellarSdk.Address.fromString(doctorAddress).toScVal(),
      StellarSdk.nativeToScVal(recordId, { type: 'u64' }),
      StellarSdk.nativeToScVal(status, { type: 'symbol' }),
      reason ? StellarSdk.nativeToScVal(reason, { type: 'string' }) : StellarSdk.xdr.ScVal.scvVoid()
    )

    const result = await buildAndSubmitTransaction(doctorAddress, operation)
    
    console.log('Record verified successfully:', result)
    
    return { success: true, hash: result.hash }
  } catch (error) {
    console.error('Error verifying record:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get verification status for a record
 */
export async function getVerification(recordId) {
  try {
    console.log('Getting verification for record:', recordId)

    if (!server || !VERIFICATION_CONTRACT_ID) {
      throw new Error('Stellar configuration incomplete')
    }

    const contract = new StellarSdk.Contract(VERIFICATION_CONTRACT_ID)
    
    const operation = contract.call(
      'get_verification',
      StellarSdk.nativeToScVal(recordId, { type: 'u64' })
    )

    const account = await server.getAccount(await getAddress())
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE
    })
      .addOperation(operation)
      .setTimeout(30)
      .build()

    const result = await server.simulateTransaction(transaction)
    
    if (StellarSdk.SorobanRpc.Api.isSimulationError(result)) {
      throw new Error(`Simulation failed: ${result.error}`)
    }

    const parsedResult = StellarSdk.scValToNative(result.result.retval)
    console.log('Verification retrieved:', parsedResult)
    
    return { success: true, verification: parsedResult }
  } catch (error) {
    console.error('Error getting verification:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Check if a record is verified
 */
export async function isRecordVerified(recordId) {
  try {
    const result = await getVerification(recordId)
    if (result.success && result.verification) {
      return result.verification.status === 'verified'
    }
    return false
  } catch (error) {
    console.error('Error checking verification:', error)
    return false
  }
}
