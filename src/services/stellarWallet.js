/**
 * Stellar Wallet Service - Freighter Integration
 * Handles wallet detection, connection, and transaction signing
 * All public keys come from the real Freighter extension
 */

import { isConnected, requestAccess, getAddress, signTransaction, getNetworkDetails } from '@stellar/freighter-api'

console.log('[Wallet] Service initialized')

/**
 * Check if Freighter wallet is installed in the browser
 * @returns {boolean} - True if Freighter is available
 */
export async function isFreighterInstalled() {
  try {
    const installed = await isConnected()
    console.log('[Wallet] Freighter installed:', installed)
    return installed
  } catch (error) {
    console.log('[Wallet] Freighter not installed:', error.message)
    return false
  }
}

/**
 * Connect to Freighter wallet and get public key
 * Triggers the Freighter connection prompt in the browser
 * @returns {Promise<string>} - Stellar public key (G... address)
 * @throws {Error} - With WALLET_* error category
 */
export async function connectWallet() {
  try {
    console.log('[Wallet] Checking if Freighter is installed...')
    const installed = await isConnected()
    
    if (!installed) {
      throw new Error('WALLET_NOT_FOUND: Freighter wallet extension not found. Visit freighter.app to install it.')
    }

    console.log('[Wallet] Freighter installed, requesting access...')
    
    // Request access - this triggers the popup
    const accessResult = await requestAccess()
    console.log('[Wallet] requestAccess result:', accessResult)
    
    if (accessResult?.error) {
      throw new Error('WALLET_CONNECTION_REJECTED: Wallet connection was declined. Please approve the connection in Freighter.')
    }

    console.log('[Wallet] Access granted, getting address...')
    const result = await getAddress()
    console.log('[Wallet] getAddress result:', result, typeof result)

    // getAddress returns an object with address property
    const publicKey = typeof result === 'string' ? result : result?.address

    if (!publicKey || (typeof publicKey === 'string' && publicKey.trim() === '')) {
      throw new Error('WALLET_CONNECTION_REJECTED: Unable to retrieve wallet address.')
    }

    console.log('[Wallet] Connected successfully:', publicKey)
    return publicKey
  } catch (error) {
    console.error('[Wallet] Connection error:', error)
    throw error
  }
}

/**
 * Get the currently connected public key without triggering a new prompt
 * @returns {Promise<string|null>} - Public key if connected, null otherwise
 */
export async function getConnectedPublicKey() {
  try {
    console.log('[Wallet] Getting connected public key...')
    const result = await getAddress()
    console.log('[Wallet] getAddress result:', result, typeof result)

    // getAddress returns an object with address property
    const publicKey = typeof result === 'string' ? result : result?.address

    if (publicKey && (typeof publicKey === 'string' && publicKey.trim() !== '')) {
      console.log('[Wallet] Retrieved connected key:', publicKey)
      return publicKey
    }
    console.log('[Wallet] No connected wallet')
    return null
  } catch (error) {
    console.log('[Wallet] Error getting connected key:', error.message)
    return null
  }
}

/**
 * Sign a transaction with Freighter
 * Presents the signing prompt to the user
 * @param {string} transactionXdr - Transaction XDR string
 * @param {string} networkPassphrase - Stellar network passphrase
 * @returns {Promise<string>} - Signed transaction XDR
 * @throws {Error} - With TRANSACTION_REJECTED_BY_USER if user rejects
 */
export async function signTransactionWithFreighter(transactionXdr, networkPassphrase) {
  try {
    console.log('[Wallet] Requesting transaction signature...')

    const signedXdr = await signTransaction(transactionXdr, {
      networkPassphrase
    })

    if (!signedXdr) {
      throw new Error('TRANSACTION_REJECTED_BY_USER: Transaction was rejected. No changes were made on-chain.')
    }

    console.log('[Wallet] Transaction signed successfully')
    return signedXdr
  } catch (error) {
    console.error('[Wallet] Signing error:', error)

    // Check if this is a user rejection
    if (error.message?.includes('rejected') || error.message?.includes('cancelled')) {
      throw new Error('TRANSACTION_REJECTED_BY_USER: Transaction was rejected. No changes were made on-chain.')
    }

    throw error
  }
}

/**
 * Get network details from Freighter
 * @returns {Promise<Object>} - Network details object
 * @throws {Error} - If unable to retrieve network details
 */
export async function getNetworkDetailsFromFreighter() {
  try {
    console.log('[Wallet] Fetching network details...')
    const details = await getNetworkDetails()
    console.log('[Wallet] Network details:', details)
    return details
  } catch (error) {
    console.error('[Wallet] Error getting network details:', error)
    throw new Error(`NETWORK_MISMATCH: Unable to verify network: ${error.message}`)
  }
}

/**
 * Verify that Freighter is connected to the correct network
 * @param {string} expectedNetworkPassphrase - Expected network passphrase from .env
 * @returns {Promise<boolean>} - True if network matches
 * @throws {Error} - With NETWORK_MISMATCH if networks don't match
 */
export async function checkNetworkMatch(expectedNetworkPassphrase) {
  try {
    const details = await getNetworkDetailsFromFreighter()

    if (details.networkPassphrase !== expectedNetworkPassphrase) {
      const networkName = expectedNetworkPassphrase.includes('Test') ? 'Testnet' : 'Mainnet'
      throw new Error(
        `NETWORK_MISMATCH: Wrong network selected in Freighter. Switch to ${networkName} and try again.`
      )
    }

    console.log('[Wallet] Network match verified')
    return true
  } catch (error) {
    console.error('[Wallet] Network check error:', error)
    throw error
  }
}
