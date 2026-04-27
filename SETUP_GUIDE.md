# MedProof Setup Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- Stellar account with testnet XLM
- Freighter wallet extension installed
- Pinata account (free tier)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Stellar Network (Testnet)
VITE_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
VITE_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# Contract IDs (will be populated after deployment)
VITE_RECORDS_CONTRACT_ID=
VITE_VERIFICATION_CONTRACT_ID=

# Pinata Configuration
VITE_PINATA_JWT=your_jwt_token_here
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### Step 3: Get Pinata JWT
1. Go to https://pinata.cloud
2. Sign up for free account
3. Navigate to API Keys section
4. Create new JWT token
5. Copy and paste into `.env`

### Step 4: Deploy Smart Contracts

#### Install Rust and Soroban CLI
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Install Soroban CLI
cargo install --locked soroban-cli
```

#### Configure Stellar Account
```bash
# Generate new account
soroban keys generate --global medproof-deployer --network testnet

# Get your address
soroban keys address medproof-deployer

# Fund account with testnet XLM
curl "https://friendbot.stellar.org?addr=$(soroban keys address medproof-deployer)"
```

#### Deploy Contracts
```bash
# Make deploy script executable
chmod +x contracts/deploy.sh

# Deploy both contracts
./contracts/deploy.sh
```

The script will automatically update your `.env` file with contract IDs.

### Step 5: Install Freighter Wallet
1. Install extension: https://freighter.app
2. Create new wallet or import existing
3. Switch to Testnet network
4. Fund your account: https://friendbot.stellar.org

### Step 6: Start Development Server
```bash
npm run dev
```

Visit http://localhost:5173

## Testing the Application

### Test as Patient
1. Click "Connect Wallet" in navbar
2. Select "Patient" role
3. Click "Connect Freighter Wallet"
4. Approve connection in Freighter popup
5. You'll be redirected to Patient Dashboard
6. Click "Upload record"
7. Drag & drop a PDF or image file
8. Fill in title and category
9. Click "Submit for verification"
10. Approve transaction in Freighter
11. Wait for confirmation (IPFS upload + blockchain storage)
12. Record appears in dashboard with "pending" status

### Test as Doctor
1. Disconnect current wallet (if connected)
2. Click "Connect Wallet"
3. Select "Doctor / Admin" role
4. Connect Freighter wallet
5. View pending records in verification queue
6. Click on a record to review
7. Click "Approve record" or "Reject record"
8. If rejecting, provide a reason
9. Approve transaction in Freighter
10. Record status updates on-chain

### Test Public Verification
1. Go to "Verify" page from navbar
2. Enter a record hash (CID from IPFS)
3. View verification status without authentication

## Troubleshooting

### "Freighter wallet is not installed"
- Install Freighter extension from https://freighter.app
- Refresh the page after installation

### "Account not found" during deployment
- Fund your account using Friendbot
- Wait 5-10 seconds and try again
- Check account balance: `soroban keys address medproof-deployer`

### "Failed to upload to IPFS"
- Verify VITE_PINATA_JWT is correct
- Check Pinata dashboard for API key status
- Ensure file size is under 25MB

### "Simulation failed" during transaction
- Check contract IDs are correct in `.env`
- Verify wallet has sufficient XLM balance
- Check Stellar testnet status

### "Transaction failed with status: FAILED"
- Check browser console for detailed error
- Verify contract function parameters
- Ensure wallet has authorization

### Build warnings about chunk size
- This is normal for development
- For production, consider code splitting
- The app will still work correctly

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_STELLAR_RPC_URL` | Soroban RPC endpoint | `https://soroban-testnet.stellar.org` |
| `VITE_STELLAR_NETWORK_PASSPHRASE` | Network identifier | `Test SDF Network ; September 2015` |
| `VITE_RECORDS_CONTRACT_ID` | Deployed Records contract | `CXXXXXXXXXXXXXXX...` |
| `VITE_VERIFICATION_CONTRACT_ID` | Deployed Verification contract | `CXXXXXXXXXXXXXXX...` |
| `VITE_PINATA_JWT` | Pinata API authentication | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_PINATA_GATEWAY` | IPFS gateway URL | `https://gateway.pinata.cloud/ipfs/` |

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Build contracts
cd contracts/records && soroban contract build
cd contracts/verification && soroban contract build

# Run contract tests
cd contracts/records && cargo test
cd contracts/verification && cargo test
```

## Project Structure

```
medproof/
├── contracts/              # Soroban smart contracts
│   ├── records/           # Records contract
│   ├── verification/      # Verification contract
│   ├── deploy.sh         # Deployment script
│   └── README.md         # Contract documentation
├── src/
│   ├── services/         # Service layers
│   │   ├── stellar.js   # Blockchain interactions
│   │   └── ipfs.js      # IPFS/Pinata integration
│   ├── context/         # React contexts
│   │   ├── AuthContext.jsx
│   │   └── RecordsContext.jsx
│   ├── pages/           # Page components
│   ├── components/      # Reusable components
│   └── main.jsx        # App entry point
├── .env                 # Environment configuration
├── .env.example        # Environment template
└── package.json        # Dependencies
```

## Next Steps

1. ✅ Complete setup steps above
2. ✅ Test patient upload flow
3. ✅ Test doctor verification flow
4. ✅ Test public verification
5. 📝 Review `STELLAR_INTEGRATION.md` for implementation details
6. 📝 Review `contracts/README.md` for contract documentation
7. 🚀 Deploy to mainnet when ready (see Production Deployment below)

## Production Deployment

### Update Environment for Mainnet
```env
VITE_STELLAR_RPC_URL=https://soroban-mainnet.stellar.org
VITE_STELLAR_NETWORK_PASSPHRASE=Public Global Stellar Network ; September 2015
```

### Deploy Contracts to Mainnet
```bash
# Configure mainnet network
soroban network add \
  --global mainnet \
  --rpc-url https://soroban-mainnet.stellar.org \
  --network-passphrase "Public Global Stellar Network ; September 2015"

# Deploy (requires real XLM)
./contracts/deploy.sh --network mainnet
```

### Build and Deploy Frontend
```bash
# Build optimized production bundle
npm run build

# Deploy dist/ folder to your hosting service
# (Vercel, Netlify, AWS S3, etc.)
```

## Support

- **Stellar Discord**: https://discord.gg/stellar
- **Soroban Docs**: https://soroban.stellar.org/docs
- **Freighter Support**: https://discord.gg/freighter
- **Pinata Support**: https://docs.pinata.cloud/

---

**Ready to build the future of medical records! 🚀**
