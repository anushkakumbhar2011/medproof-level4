# MedProof - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 20+
- Freighter wallet (https://freighter.app)
- Pinata account (https://pinata.cloud)

### Step 1: Clone & Install
```bash
git clone <repo-url>
cd medproof
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add:
```env
VITE_PINATA_JWT=your_pinata_jwt_here
```

### Step 3: Start Dev Server
```bash
npm run dev
```

Open http://localhost:5174/

### Step 4: Get Testnet XLM
1. Open https://friendbot.stellar.org
2. Paste your Freighter wallet address
3. Receive 10,000 XLM

### Step 5: Test the App
1. Click "Connect Wallet" on Auth page
2. Approve in Freighter popup
3. Select "Patient" role
4. Upload a test file
5. Watch it get stored on blockchain!

---

## 📋 Common Tasks

### Connect Wallet
```javascript
import { connectWallet } from './services/stellarWallet'

const publicKey = await connectWallet()
console.log('Connected:', publicKey)
```

### Upload Record
```javascript
import { storeRecord } from './services/stellarContract'

const result = await storeRecord(
  walletAddress,
  ipfsCID,
  'Blood Test',
  'haematology'
)
console.log('Transaction hash:', result.hash)
```

### Verify Record
```javascript
import { verifyRecord } from './services/stellarContract'

const result = await verifyRecord(
  doctorAddress,
  recordId,
  'verified',
  null
)
console.log('Verified:', result.hash)
```

### Upload to IPFS
```javascript
import { uploadFileToPinata } from './services/ipfsUpload'

const cid = await uploadFileToPinata(file)
console.log('IPFS CID:', cid)
```

---

## 🔍 Debugging

### Check Console Logs
```javascript
// All operations log to console with [Service] prefix
// [Wallet] - Wallet operations
// [Contract] - Blockchain operations
// [Upload] - File upload operations
// [Auth] - Authentication operations
```

### View Transaction
```javascript
// Get transaction hash from console
// Visit: https://stellar.expert/explorer/testnet/tx/{hash}
```

### Check IPFS File
```javascript
// Get CID from console
// Visit: https://gateway.pinata.cloud/ipfs/{cid}
```

---

## 🛠️ Build & Deploy

### Build for Production
```bash
npm run build
```

Output: `dist/` folder

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## 📊 Project Structure

```
medproof/
├── src/
│   ├── pages/           # Page components
│   ├── components/      # Reusable components
│   ├── services/        # Blockchain & IPFS integration
│   ├── context/         # State management
│   ├── layouts/         # Layout components
│   ├── guards/          # Route guards
│   ├── data/            # Mock data
│   ├── App.jsx          # Main app
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── contracts/
│   ├── records/         # Records contract
│   ├── verification/    # Verification contract
│   └── deploy.sh        # Deployment script
├── .env                 # Environment variables
├── package.json         # Dependencies
├── vite.config.js       # Vite config
├── tailwind.config.js   # Tailwind config
└── eslint.config.js     # ESLint config
```

---

## 🔐 Environment Variables

```env
# Stellar Network (Testnet)
VITE_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
VITE_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# Smart Contracts (Deployed)
VITE_RECORDS_CONTRACT_ID=CAMUOKB76CZ2IV7QNS67XYNSHCWNADUF2HMGHLZYVGZVNBYNCOU23TNJ
VITE_VERIFICATION_CONTRACT_ID=CDPC2JAHMOBGBND36UHGYPMK3I6IFG7ZO4VHXR6BR5ZFDCMUSZBSHVJG

# IPFS (Pinata)
VITE_PINATA_JWT=your_jwt_token_here
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

---

## 🧪 Test Scenarios

### Scenario 1: Patient Upload
1. Connect as patient
2. Upload PDF file
3. Fill in title and category
4. Click "Submit for verification"
5. Approve in Freighter
6. Wait for confirmation
7. See record in dashboard

### Scenario 2: Doctor Verification
1. Connect as doctor
2. Go to Doctor Dashboard
3. See pending records
4. Click record to view
5. Click "Approve" or "Reject"
6. Enter reason (if rejecting)
7. Approve in Freighter
8. See status updated

### Scenario 3: Public Verification
1. Go to /verify page
2. Enter record CID (from patient)
3. See verification status
4. View doctor details
5. See timestamp

---

## ⚠️ Common Issues

### "Freighter wallet not found"
- Install Freighter: https://freighter.app
- Refresh page
- Check browser extensions

### "Wrong network selected"
- Open Freighter
- Switch to Stellar Testnet
- Refresh page

### "No XLM balance"
- Go to https://friendbot.stellar.org
- Paste wallet address
- Receive 10,000 XLM

### "File upload failed"
- Check Pinata JWT is valid
- Check file size < 25 MB
- Check internet connection

### "Transaction timeout"
- Wait 30 seconds
- Check Stellar Explorer
- Retry if needed

---

## 📞 Getting Help

1. **Check Logs**: Open browser console (F12)
2. **Read Docs**: See README.md and SETUP_GUIDE.md
3. **Check Explorer**: https://stellar.expert/explorer/testnet
4. **Verify IPFS**: https://gateway.pinata.cloud/ipfs/{cid}
5. **Test Wallet**: https://freighter.app

---

## 🎯 Next Steps

- [ ] Test patient upload flow
- [ ] Test doctor verification flow
- [ ] Test public verification
- [ ] Check transaction on Stellar Explorer
- [ ] Verify file on IPFS gateway
- [ ] Deploy to production
- [ ] Share with users

---

**Happy building! 🚀**

