# Blockchain Integration Guide - MedProof

## 🎯 Overview

This guide documents the complete blockchain integration for MedProof, including:
- Real Stellar wallet connection via Freighter
- IPFS file uploads via Pinata
- Smart contract interactions for records and verification
- Complete error handling with categorized error messages

## 📦 New Service Files

### 1. `src/services/ipfsUpload.js`
Handles all IPFS/Pinata interactions with real CIDs.

**Functions:**
- `uploadFileToPinata(file)` - Upload file, returns real CID
- `uploadMetadataToPinata(metadata)` - Upload JSON metadata, returns CID
- `getFileUrl(cid)` - Construct gateway URL
- `unpinFromPinata(cid)` - Cleanup orphaned files

**Key Features:**
- No mock CIDs - all uploads return real Pinata responses
- Proper error handling with `IPFS_UPLOAD_FAILED` prefix
- FormData construction for multipart uploads
- JSON uploads for metadata

### 2. `src/services/stellarWallet.js`
Handles Freighter wallet detection, connection, and signing.

**Functions:**
- `isFreighterInstalled()` - Check if extension is available
- `connectWallet()` - Trigger connection prompt, return public key
- `getConnectedPublicKey()` - Get key without new prompt
- `signTransactionWithFreighter(xdr, passphrase)` - Sign transaction
- `getNetworkDetailsFromFreighter()` - Get network info
- `checkNetworkMatch(passphrase)` - Verify correct network

**Key Features:**
- Real wallet connection only - no simulation
- Proper error categories (WALLET_NOT_FOUND, WALLET_CONNECTION_REJECTED, NETWORK_MISMATCH)
- User rejection detection
- Network verification

### 3. `src/services/stellarContract.js`
Complete Soroban contract interaction layer.

**Write Functions (require signing):**
- `storeRecord(publicKey, cid, title, category)` - Store record on-chain
- `verifyRecord(doctorPublicKey, recordId, status, reason)` - Verify record

**Read Functions (simulation only):**
- `getRecord(recordId)` - Get single record
- `getRecordsByOwner(ownerPublicKey)` - Get all records for owner
- `getRecordCount()` - Get total record count
- `getRecordWithStatus(recordId)` - Get record with verification status
- `getVerification(recordId)` - Get verification details
- `getVerificationByHash(cipOrHash)` - Search by CID or record ID

**Transaction Flow:**
1. Build transaction with operation
2. Simulate via RPC
3. Prepare from simulation result
4. Sign with Freighter
5. Submit to network
6. Poll for confirmation (up to 30 attempts)
7. Return real transaction hash

**Error Categories:**
- `CONTRACT_READ_FAILED` - Configuration or read errors
- `TRANSACTION_SIMULATION_FAILED` - Simulation errors
- `TRANSACTION_REJECTED_BY_USER` - User rejection
- `TRANSACTION_SUBMISSION_FAILED` - RPC submission errors
- `TRANSACTION_TIMEOUT` - Confirmation timeout

## 🔄 Updated Components

### AuthContext (`src/context/AuthContext.jsx`)
**Changes:**
- Real Freighter wallet connection
- Session restoration with verification
- `hasFreighter` boolean for UI
- Proper error state management

**State:**
```javascript
{
  isConnected: boolean,
  walletAddress: string | null,
  role: 'patient' | 'doctor' | null,
  isLoading: boolean,
  error: string | null,
  hasFreighter: boolean
}
```

### RecordsContext (`src/context/RecordsContext.jsx`)
**Changes:**
- Removed mock data
- Real blockchain fetching
- `fetchRecords(ownerAddress)` - Fetch from contract
- `fetchSingleRecord(recordId)` - Fetch single record
- Loading and error states

**New Methods:**
- `fetchRecords()` - Async blockchain fetch
- `fetchSingleRecord()` - Single record fetch

### Auth Page (`src/pages/Auth.jsx`)
**Changes:**
- Network match verification
- Freighter installation check
- Error display for wallet issues
- Loading state during connection

**Error Handling:**
- Shows "Freighter not found" if extension missing
- Shows network mismatch errors
- Shows connection rejection errors

### Upload Page (`src/pages/UploadPage.jsx`)
**Changes:**
- Real IPFS upload via Pinata
- Real blockchain storage
- Proper progress tracking (0-40% IPFS, 40-65% metadata, 65-90% blockchain, 90-100% UI)
- Orphaned file cleanup on failure

**Steps:**
1. Validate form (title, category, file)
2. Upload file to IPFS → get CID
3. Upload metadata to IPFS → get metadata CID
4. Store CID on blockchain via contract
5. Update UI and refresh records

### Record Details Page (`src/pages/RecordDetails.jsx`)
**Changes:**
- Fetch record from blockchain on mount
- Real verification actions
- Proper error handling
- Loading state

**Doctor Actions:**
- Approve: Call `verifyRecord()` with status "verified"
- Reject: Call `verifyRecord()` with status "rejected" + reason

## 🔐 Error Handling Standards

All errors follow a categorized format: `CATEGORY: Message`

**Categories:**
- `WALLET_NOT_FOUND` - Freighter not installed
- `WALLET_CONNECTION_REJECTED` - User rejected connection
- `NETWORK_MISMATCH` - Wrong Stellar network
- `TRANSACTION_SIMULATION_FAILED` - Simulation error
- `TRANSACTION_REJECTED_BY_USER` - User rejected signing
- `TRANSACTION_SUBMISSION_FAILED` - RPC submission error
- `TRANSACTION_TIMEOUT` - Confirmation timeout
- `IPFS_UPLOAD_FAILED` - IPFS/Pinata error
- `CONTRACT_READ_FAILED` - Contract read error
- `RECORD_NOT_FOUND` - Record doesn't exist

**UI Display:**
- Extract category from error message
- Show user-friendly message
- Provide actionable next steps
- Never swallow errors silently

## 🚀 Transaction Flow Example

### Patient Upload Flow
```
1. User selects file and fills form
2. Click "Submit for verification"
3. Validate form inputs
4. Upload file to IPFS
   - POST to https://api.pinata.cloud/pinning/pinFileToIPFS
   - Get CID from response
5. Upload metadata to IPFS
   - POST to https://api.pinata.cloud/pinning/pinJSONToIPFS
   - Get metadata CID
6. Build Soroban transaction
   - Operation: store_record(owner, cid, title, category)
   - Network: Testnet
   - Fee: BASE_FEE
7. Simulate transaction
   - Check for errors
   - Get simulation result
8. Prepare transaction
   - Assemble from simulation result
9. Sign with Freighter
   - User sees signing prompt
   - User approves/rejects
10. Submit to network
    - Get transaction hash
11. Poll for confirmation
    - Check status every 1 second
    - Up to 30 attempts
12. On success
    - Show transaction hash
    - Update UI
    - Refresh records
    - Navigate to dashboard
```

### Doctor Verification Flow
```
1. Doctor views pending record
2. Click "Approve" or "Reject"
3. If reject: enter reason
4. Build Soroban transaction
   - Operation: verify_record(doctor, recordId, status, reason)
5. Simulate → Prepare → Sign → Submit → Poll
6. On success
   - Show transaction hash
   - Update record status
   - Remove from pending queue
```

## 🔍 Debugging

### Enable Logging
All services use `console.log` with `[Service]` prefix:
- `[IPFS]` - IPFS operations
- `[Wallet]` - Wallet operations
- `[Contract]` - Contract operations
- `[Auth]` - Auth context
- `[Records]` - Records context
- `[Upload]` - Upload page
- `[RecordDetails]` - Record details page

### Check Network
```javascript
import { getNetworkDetailsFromFreighter } from './services/stellarWallet'

const details = await getNetworkDetailsFromFreighter()
console.log(details)
// { network: 'testnet', networkPassphrase: '...', networkUrl: '...' }
```

### Check Wallet Connection
```javascript
import { getConnectedPublicKey } from './services/stellarWallet'

const key = await getConnectedPublicKey()
console.log(key) // 'GXXXXXX...' or null
```

### Test Contract Read
```javascript
import { getRecordCount } from './services/stellarContract'

const count = await getRecordCount()
console.log('Total records:', count)
```

## 📋 Checklist Before Deployment

- [ ] Pinata JWT configured in `.env`
- [ ] Stellar RPC URL configured
- [ ] Network passphrase configured
- [ ] Contract IDs populated after deployment
- [ ] Freighter wallet installed in browser
- [ ] Testnet account funded with XLM
- [ ] Test patient upload flow
- [ ] Test doctor verification flow
- [ ] Test error scenarios
- [ ] Verify transaction hashes on Stellar Expert
- [ ] Check IPFS files accessible via gateway
- [ ] Test session persistence
- [ ] Test mobile responsiveness

## 🎯 Key Implementation Details

### No Mock Data
- All CIDs come from Pinata API
- All transaction hashes are real
- All records fetched from blockchain
- No placeholder values

### Real Transaction Flow
- Every write operation: build → simulate → sign → submit → poll
- Proper error handling at each step
- User sees Freighter signing prompt
- Transaction confirmation polling

### Proper Error Handling
- Categorized error messages
- User-friendly error display
- Actionable error messages
- No silent failures

### Session Management
- Wallet address stored in localStorage
- Role stored in localStorage
- Session restored on page reload
- Verification of stored session

## 🔗 Resources

- **Stellar SDK**: https://stellar.github.io/js-stellar-sdk/
- **Soroban Docs**: https://soroban.stellar.org/docs
- **Freighter API**: https://docs.freighter.app/
- **Pinata API**: https://docs.pinata.cloud/
- **Stellar Expert**: https://stellar.expert/

## 📞 Support

For issues:
1. Check browser console for `[Service]` logs
2. Verify environment variables in `.env`
3. Check Freighter wallet connection
4. Verify testnet account has XLM
5. Check contract IDs are correct
6. Review error message category for context

---

**Status**: ✅ Complete - Ready for Testing
**Last Updated**: 2026-04-27
