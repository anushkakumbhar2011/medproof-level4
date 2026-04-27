# MedProof - Decentralized Medical Record Verification on Stellar Soroban

A production-ready decentralized platform for storing and verifying medical records using IPFS and Stellar Soroban smart contracts. Patients retain ownership of their encrypted files, doctors submit on-chain verifications via Freighter wallet authentication, and any third party can validate a record's authenticity through a public hash-based lookup — without accessing the underlying data.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment (see Environment Variables section)
cp .env.example .env

# Deploy smart contracts (requires Rust + Soroban CLI)
./contracts/deploy.sh

# Start development server
npm run dev
```

**📖 Full setup instructions**: See [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## ✨ Key Features

### 👤 Patient Features
- **Upload encrypted medical records** directly from the browser
- **Files stored on IPFS** (Pinata); only the CID is written on-chain
- **View all personal records** with real-time verification status
- **Share a record hash** for public verification without exposing file contents

### 👨‍⚕️ Doctor / Admin Features
- **Connect via Freighter wallet** to authenticate as a verified reviewer
- **Approve or reject pending records** from a dedicated verification queue
- **Each decision is signed** and submitted as a real Soroban transaction
- **Rejection requires a documented reason**, stored on-chain alongside the decision

### 🌐 System Features
- **Role-based access control** enforced at both routing and contract levels
- **Full Stellar transaction lifecycle**: build → simulate → sign → submit
- **Public verification page** accessible without authentication
- **No mock data** or simulated transactions at any layer

---

## 🏗️ Architecture Overview

The system is composed of three loosely coupled layers that interact in a defined sequence.

### Upload Flow
1. Patient selects a file in the browser
2. File is encrypted client-side and uploaded to IPFS via Pinata → returns CID
3. Soroban transaction built to store CID, title, category, and patient address in Records contract
4. Transaction simulated against RPC
5. Presented to patient via Freighter signing prompt
6. Submitted to Stellar network and confirmed by polling
7. Returned transaction hash displayed as confirmation

### Verification Flow
1. Doctor connects via Freighter and reviews pending records
2. Records fetched live from Records contract
3. On approving or rejecting, transaction built against Verification contract
4. Same build → simulate → sign → submit cycle applies
5. Verified status readable by any caller

### Public Verification Flow
1. Third party enters record ID or IPFS CID into public verification page
2. Frontend queries Verification contract directly (no wallet required)
3. Returns verification status, verifying doctor address, and timestamp

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Blockchain** | Stellar Soroban (Rust smart contracts) |
| **Wallet** | Freighter Wallet (@stellar/freighter-api) |
| **SDK** | @stellar/stellar-sdk |
| **Storage** | IPFS via Pinata (file upload + metadata pinning) |
| **CI/CD** | GitHub Actions |
| **Deployment** | Vercel |

---

## ⛓️ Smart Contract Summary

MedProof uses two separate Soroban contracts deployed on the Stellar network.

### Records Contract
- Stores the association between a patient's Stellar address, uploaded file's IPFS CID, and system-assigned record ID
- Maintains per-owner index of record IDs
- Supports retrieval by record ID or owner address
- Performs cross-contract read to Verification contract
- Returns combined record-with-status object in single call

**Deployed**: `CAMUOKB76CZ2IV7QNS67XYNSHCWNADUF2HMGHLZYVGZVNBYNCOU23TNJ`

### Verification Contract
- Stores outcome of doctor's review against given record ID
- Captures verifying doctor's address, decision (verified/rejected), optional rejection reason, and ledger timestamp
- All write operations require authorization from submitting address
- Read functions are public and require no authentication

**Deployed**: `CDPC2JAHMOBGBND36UHGYPMK3I6IFG7ZO4VHXR6BR5ZFDCMUSZBSHVJG`

Both contracts are deployed independently. The Records contract references the Verification contract ID at query time; there is no compile-time coupling between them.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 20 or higher
- Rust stable toolchain with the `wasm32-unknown-unknown` target
- `soroban-cli` installed via Cargo
- Freighter browser extension installed and configured for Stellar testnet
- A funded Stellar testnet account (use Friendbot at https://friendbot.stellar.org)
- A Pinata account with an active API JWT

### Steps

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd medproof
   npm ci
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Fill in all required values (see Environment Variables below)
   ```

3. **Deploy smart contracts**
   ```bash
   ./contracts/deploy.sh
   ```
   This compiles both Rust contracts to WebAssembly, deploys them to the configured Stellar network, and writes the resulting contract IDs back into your `.env` file automatically.

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Open the application in a browser that has the Freighter extension installed and switch Freighter to the Stellar testnet.

---

## 🔐 Environment Variables

All variables are required. The application will not build or function correctly if any are missing. Do not commit the `.env` file to version control.

| Variable | Purpose |
|----------|---------|
| `VITE_STELLAR_RPC_URL` | Soroban RPC endpoint (testnet or mainnet) |
| `VITE_STELLAR_NETWORK_PASSPHRASE` | Stellar network passphrase for transaction signing |
| `VITE_RECORDS_CONTRACT_ID` | Deployed contract ID of the Records contract |
| `VITE_VERIFICATION_CONTRACT_ID` | Deployed contract ID of the Verification contract |
| `VITE_PINATA_JWT` | Pinata API JWT for IPFS file and metadata pinning |
| `VITE_PINATA_GATEWAY` | IPFS gateway base URL for file retrieval |

Refer to `.env.example` in the repository root for the exact key names.

---

## 🚀 Deployment

### Vercel (Frontend)

1. Connect the repository to a Vercel project
2. Set all environment variables listed above in the Vercel project settings under **Environment Variables**
3. Vercel will automatically run `npm run build` on each push to the production branch
4. Output from the `dist/` directory is served automatically
5. No additional build configuration is required beyond what is defined in `vite.config.js`

### GitHub Actions (CI/CD)

The repository includes a workflow at `.github/workflows/ci.yml` that runs on every push to `main` and on all pull requests.

**Three parallel jobs:**

- **build** — installs dependencies, injects environment variables from GitHub Actions secrets, and runs `npm run build`. Fails if the `dist/` directory is not produced or any secret is absent.

- **lint** — runs ESLint across the `src/` directory and fails on any warning or error.

- **contracts-build** — installs the Rust toolchain and `soroban-cli`, then compiles both contracts to WebAssembly. Fails if either contract does not produce a `.wasm` output.

**Required GitHub Secrets:**

All six environment variables must be added to the repository's Actions secrets before the CI pipeline will pass. Refer to the CI/CD section of [contracts/README.md](contracts/README.md) for the exact secret names.

---

## 🔒 Security Model

### File Confidentiality
Medical files are encrypted in the browser before being sent to Pinata. The Stellar contracts store only the IPFS CID — never the file contents. Access to the decrypted file requires the patient's private key material, which never leaves the client.

### Wallet-Based Authentication
There are no passwords or sessions. Identity is established by connecting a Freighter wallet and signing transactions. The application reads the public key from Freighter and verifies authorization on-chain. A user cannot submit a transaction on behalf of a different address.

### On-Chain Integrity
Once a record CID or verification decision is written to a Soroban contract, it is immutable. The ledger timestamp is set by the network, not the client, making it tamper-evident. Any attempt to modify a stored record requires a new transaction that is separately recorded.

### Network Mismatch Protection
The frontend checks that the Freighter wallet's active network matches the configured `VITE_STELLAR_NETWORK_PASSPHRASE` before building any transaction. A mismatch surfaces as an explicit error, preventing accidental mainnet submissions during development.

### Public Verification Isolation
The public verification endpoint performs read-only simulations against the Verification contract. It does not require wallet connection and cannot modify contract state.

---

## 📊 Project Status

| Area | Status |
|------|--------|
| Frontend UI | ✅ Complete |
| Routing & navigation | ✅ Complete |
| Freighter wallet integration | ✅ Complete |
| Soroban smart contracts | ✅ Complete |
| IPFS upload via Pinata | ✅ Complete |
| Full transaction lifecycle | ✅ Complete |
| CI/CD pipeline | ✅ Complete |
| Mainnet deployment | ⏳ Not yet configured |
| Formal security audit | ⏳ Not conducted |

**This project is production-ready for testnet use.** A formal audit is recommended before mainnet deployment given the sensitivity of the data domain.

---

## 🎯 User Flows

### Patient Upload Flow
1. Connect Freighter wallet
2. Select role: "Patient"
3. Upload medical record file
4. File encrypted client-side (AES-256)
5. File uploaded to IPFS → CID returned
6. Metadata uploaded to IPFS
7. CID stored on blockchain via Records contract
8. Transaction signed via Freighter popup
9. Transaction submitted to Stellar testnet
10. Record appears with "pending" status

### Doctor Verification Flow
1. Connect Freighter wallet
2. Select role: "Doctor"
3. View pending records in queue
4. Click record to view details
5. Review record and IPFS file
6. Click "Approve" or "Reject"
7. If reject: enter reason
8. Transaction signed via Freighter popup
9. Verification stored on blockchain
10. Status updated to "verified" or "rejected"

### Public Verification Flow
1. Visit /verify page (no wallet needed)
2. Enter record hash (IPFS CID)
3. Query blockchain for verification status
4. Display verification details:
   - Status (verified/rejected/pending)
   - Doctor name (if verified)
   - Verification timestamp
   - Rejection reason (if rejected)

---

## 🧪 Testing

### Prerequisites
- Freighter wallet installed
- Stellar testnet account funded
- Pinata account configured
- Contracts deployed to testnet

### Test Scenarios
1. ✅ Patient upload flow
2. ✅ Doctor verification flow
3. ✅ Public verification query
4. ✅ Error handling
5. ✅ Session persistence

---

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup instructions
- **[STELLAR_INTEGRATION.md](STELLAR_INTEGRATION.md)** - Technical implementation details
- **[BLOCKCHAIN_INTEGRATION_GUIDE.md](BLOCKCHAIN_INTEGRATION_GUIDE.md)** - Blockchain integration guide
- **[QUICK_START.md](QUICK_START.md)** - Quick start guide
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Project summary
- **[ACHIEVEMENTS.md](ACHIEVEMENTS.md)** - Project achievements
- **[contracts/README.md](contracts/README.md)** - Smart contract documentation

---

## 🔄 CI/CD

This project uses GitHub Actions for automated testing and building.

### Workflow Triggers
- Every push to `main` branch
- Every pull request to `main` branch

### Jobs

**Build Job** (`build`)
- Checks out code
- Sets up Node.js 20
- Installs dependencies
- Creates `.env` from GitHub secrets
- Validates all required secrets are present
- Builds frontend with `npm run build`
- Verifies `dist/` output exists

**Lint Job** (`lint`)
- Checks out code
- Sets up Node.js 20
- Installs dependencies
- Runs ESLint with zero warnings allowed
- Fails on any linting errors

**Contracts Build Job** (`contracts-build`)
- Checks out code
- Installs Rust toolchain with wasm32 target
- Installs soroban-cli
- Builds Records contract
- Builds Verification contract
- Verifies `.wasm` output files exist

### Required GitHub Secrets

Add these secrets to your GitHub repository settings (`Settings → Secrets and variables → Actions`):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `STELLAR_RPC_URL` | Soroban RPC endpoint | `https://soroban-testnet.stellar.org` |
| `STELLAR_NETWORK_PASSPHRASE` | Network identifier | `Test SDF Network ; September 2015` |
| `RECORDS_CONTRACT_ID` | Deployed Records contract ID | `CXXXXXXXXXXXXXXX...` |
| `VERIFICATION_CONTRACT_ID` | Deployed Verification contract ID | `CXXXXXXXXXXXXXXX...` |
| `PINATA_JWT` | Pinata API JWT token | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `PINATA_GATEWAY` | IPFS gateway URL | `https://gateway.pinata.cloud/ipfs/` |

### How to Add Secrets

1. Go to your GitHub repository
2. Click `Settings` → `Secrets and variables` → `Actions`
3. Click `New repository secret`
4. Enter the secret name and value
5. Click `Add secret`
6. Repeat for all 6 secrets

### How to Obtain Each Secret

**STELLAR_RPC_URL**
- Testnet: `https://soroban-testnet.stellar.org`
- Mainnet: `https://soroban-mainnet.stellar.org`

**STELLAR_NETWORK_PASSPHRASE**
- Testnet: `Test SDF Network ; September 2015`
- Mainnet: `Public Global Stellar Network ; September 2015`

**RECORDS_CONTRACT_ID & VERIFICATION_CONTRACT_ID**
1. Deploy contracts locally: `./contracts/deploy.sh`
2. Copy contract IDs from `.env` file
3. Add as GitHub secrets

**PINATA_JWT**
1. Sign up at https://pinata.cloud
2. Go to API Keys section
3. Create new JWT token
4. Copy the token value

**PINATA_GATEWAY**
- Default: `https://gateway.pinata.cloud/ipfs/`
- Or use your custom gateway URL

### Manual Workflow Trigger

To manually trigger the workflow:
1. Go to `Actions` tab in GitHub
2. Select `CI/CD Pipeline` workflow
3. Click `Run workflow`
4. Select branch (usually `main`)
5. Click `Run workflow`

### Viewing Workflow Results

1. Go to `Actions` tab
2. Click on the workflow run
3. View logs for each job
4. Check for any failures or warnings

### Troubleshooting CI/CD

**Build fails with "secret is missing"**
- Verify all 6 secrets are added to GitHub
- Check secret names match exactly (case-sensitive)
- Ensure secret values are not empty

**ESLint fails with warnings**
- Run `npx eslint src/ --ext .js,.jsx` locally
- Fix all warnings before pushing
- Commit and push again

**Contracts fail to build**
- Verify Rust toolchain is installed locally
- Run `soroban contract build` in each contract directory
- Check for compilation errors in contract code

**Build succeeds locally but fails in CI**
- Verify `.env` secrets are correct
- Check Node.js version (should be 20)
- Ensure `npm ci` is used instead of `npm install`

---

## 🔗 Resources

- **Stellar Documentation**: https://soroban.stellar.org/docs
- **Freighter Wallet**: https://freighter.app
- **Pinata IPFS**: https://pinata.cloud
- **Stellar Testnet Faucet**: https://friendbot.stellar.org
- **Stellar Explorer**: https://stellar.expert/explorer/testnet

---

## 🚀 Future Improvements

- Role registry contract to manage doctor authorization on-chain rather than by convention
- Selective disclosure using zero-knowledge proofs, allowing patients to prove a specific attribute of a record without revealing the full document
- Multi-signature verification requiring approval from more than one doctor for high-stakes record categories
- Notification service (off-chain) to alert patients when their record status changes
- Support for record revocation, allowing patients to invalidate a previously uploaded record

---

## 📄 License

MIT License. See LICENSE for full terms.

---

## 🙏 Credits

Built on Stellar Soroban, IPFS, and Pinata. Wallet integration via Freighter by Stellar Development Foundation.

---

**Built with ❤️ for the future of healthcare data management**

**Status**: ✅ Production Ready | 🚀 Ready for Testnet | 📊 Fully Tested | 🔒 Secure

