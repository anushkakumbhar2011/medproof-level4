# Quick Reference - Blockchain Integration

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure .env
cp .env.example .env
# Edit .env with Pinata JWT and contract IDs

# 3. Deploy contracts
./contracts/deploy.sh

# 4. Start dev server
npm run dev

# 5. Test in browser
# Visit http://localhost:5173
```

## 📁 New Files

| File | Purpose |
|------|---------|
| `src/services/ipfsUpload.js` | IPFS/Pinata file uploads |
| `src/services/stellarWallet.js` | Freighter wallet integration |
| `src/services/stellarContract.js` | Soroban contract calls |

## 🔧 Service Functions

### IPFS Upload
```javascript
import { uploadFileToPinata, getFileUrl, unpinFromPinata } from './services/ipfsUpload'

// Upload file
const cid = await uploadFileToPinata(file)

// Get URL
const url = getFileUrl(cid)

// Cleanup
await unpinFromPinata(cid)
```

### Wallet
```javascript
import { 
  isFreighterInstalled, 
  connectWallet, 
  checkNetworkMatch 
} from './services/stellarWallet'

// Check installed
const installed = await isFreighterInstalled()

// Connect
const publicKey = await connectWallet()

// Verify network
await checkNetworkMatch(networkPassphrase)
```

### Contract
```javascript
import { 
  storeRecord, 
  verifyRecord, 
  getRecordsByOwner,
  getRecordWithStatus 
} from './services/stellarContract'

// Store record
const { hash, recordId } = await storeRecord(publicKey, cid, title, category)

// Verify record
const { hash, success } = await verifyRecord(doctorKey, recordId, 'verified', null)

// Get records
const records = await getRecordsByOwner(publicKey)

// Get with status
const record = await getRecordWithStatus(recordId)
```

## 🎯 Common Tasks

### Upload a Record
```javascript
// 1. Upload file to IPFS
const fileCID = await uploadFileToPinata(file)

// 2. Upload metadata
const metadataCID = await uploadMetadataToPinata({
  title, category, description, uploadedBy, timestamp
})

// 3. Store on blockchain
const { hash } = await storeRecord(publicKey, fileCID, title, category)
```

### Verify a Record
```javascript
// 1. Approve
const { hash } = await verifyRecord(doctorKey, recordId, 'verified', null)

// 2. Reject
const { hash } = await verifyRecord(doctorKey, recordId, 'rejected', 'Incomplete')
```

### Fetch Records
```javascript
// Get all records for owner
const records = await getRecordsByOwner(publicKey)

// Get single record with status
const record = await getRecordWithStatus(recordId)

// Get verification details
const verification = await getVerification(recordId)
```

## ⚠️ Error Handling

```javascript
try {
  const cid = await uploadFileToPinata(file)
} catch (error) {
  // Error format: "CATEGORY: Message"
  if (error.message.includes('IPFS_UPLOAD_FAILED')) {
    // Handle IPFS error
  }
}
```

**Error Categories:**
- `WALLET_NOT_FOUND` - Freighter missing
- `WALLET_CONNECTION_REJECTED` - User rejected
- `NETWORK_MISMATCH` - Wrong network
- `TRANSACTION_SIMULATION_FAILED` - Simulation error
- `TRANSACTION_REJECTED_BY_USER` - User rejected signing
- `TRANSACTION_SUBMISSION_FAILED` - RPC error
- `TRANSACTION_TIMEOUT` - Confirmation timeout
- `IPFS_UPLOAD_FAILED` - IPFS error
- `CONTRACT_READ_FAILED` - Read error

## 🔍 Debugging

### Enable Logs
All services log with prefixes:
- `[IPFS]` - IPFS operations
- `[Wallet]` - Wallet operations
- `[Contract]` - Contract operations

Open browser console to see logs.

### Check Wallet
```javascript
import { getConnectedPublicKey } from './services/stellarWallet'
const key = await getConnectedPublicKey()
console.log(key) // 'GXXXXXX...' or null
```

### Check Network
```javascript
import { getNetworkDetailsFromFreighter } from './services/stellarWallet'
const details = await getNetworkDetailsFromFreighter()
console.log(details)
```

### Test Contract
```javascript
import { getRecordCount } from './services/stellarContract'
const count = await getRecordCount()
console.log('Total records:', count)
```

## 📋 Environment Variables

```env
# Stellar Network
VITE_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
VITE_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# Contracts (populate after deployment)
VITE_RECORDS_CONTRACT_ID=
VITE_VERIFICATION_CONTRACT_ID=

# IPFS
VITE_PINATA_JWT=
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

## 🧪 Testing

### Test Patient Upload
1. Connect wallet as Patient
2. Select file
3. Fill form
4. Click "Submit for verification"
5. Approve in Freighter
6. Wait for confirmation
7. Check dashboard

### Test Doctor Verification
1. Connect wallet as Doctor
2. View pending records
3. Click record
4. Click "Approve" or "Reject"
5. If reject, enter reason
6. Approve in Freighter
7. Wait for confirmation

### Test Public Verification
1. Go to Verify page
2. Enter record hash (CID)
3. View verification status

## 🔗 Useful Links

- **Stellar Expert**: https://stellar.expert/
- **Pinata Dashboard**: https://pinata.cloud/
- **Freighter**: https://freighter.app/
- **Stellar Docs**: https://soroban.stellar.org/docs

## 💡 Tips

1. **Always check Freighter is installed** before connecting
2. **Verify network** before submitting transactions
3. **Save transaction hashes** for audit trail
4. **Check IPFS gateway** for file accessibility
5. **Use Stellar Expert** to verify transactions
6. **Enable console logs** for debugging
7. **Test on testnet first** before mainnet

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| "Freighter not found" | Install extension from freighter.app |
| "Network mismatch" | Switch Freighter to correct network |
| "Transaction rejected" | User clicked reject in Freighter |
| "IPFS upload failed" | Check Pinata JWT in .env |
| "Contract not found" | Verify contract IDs in .env |
| "Simulation failed" | Check contract parameters |

## 📞 Support

1. Check browser console for `[Service]` logs
2. Verify `.env` configuration
3. Check Freighter wallet connection
4. Verify testnet account has XLM
5. Review error message category
6. Check Stellar Expert for transaction status

---

**Last Updated**: 2026-04-27
