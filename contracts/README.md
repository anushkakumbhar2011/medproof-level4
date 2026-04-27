# MedProof Soroban Smart Contracts

This directory contains the Stellar Soroban smart contracts for MedProof's decentralized medical record verification system.

## Contracts

### 1. Records Contract (`contracts/records/`)
Manages medical record storage on-chain, linking IPFS CIDs to patient addresses.

**Functions:**
- `store_record(owner, cid, title, category)` → Returns record_id
- `get_record(record_id)` → Returns Record struct
- `get_records_by_owner(owner)` → Returns Vec<Record>
- `get_record_count()` → Returns u64
- `get_record_with_status(record_id, verification_contract_id)` → Returns RecordWithStatus

### 2. Verification Contract (`contracts/verification/`)
Manages doctor verification decisions for medical records.

**Functions:**
- `verify_record(doctor, record_id, status, reason)` → Returns bool
- `get_verification(record_id)` → Returns Option<Verification>
- `is_verified(record_id)` → Returns bool
- `get_verifier(record_id)` → Returns Option<Address>

## Prerequisites

### 1. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown
```

### 2. Install Soroban CLI
```bash
cargo install --locked soroban-cli
```

### 3. Configure Stellar Account

Create a new Stellar account for testnet:
```bash
soroban keys generate --global my-account --network testnet
```

Fund your account using Friendbot:
```bash
soroban keys address my-account
# Copy the address and visit: https://friendbot.stellar.org
# Or use curl:
curl "https://friendbot.stellar.org?addr=$(soroban keys address my-account)"
```

Set your account as the deployment source:
```bash
export SOROBAN_ACCOUNT=my-account
```

### 4. Configure Network
```bash
soroban network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"
```

## Deployment

### Automated Deployment
Run the deployment script from the project root:

```bash
./contracts/deploy.sh
```

This will:
1. Build both contracts
2. Deploy to Stellar testnet
3. Print contract IDs
4. Automatically update `.env` file with contract IDs

### Manual Deployment

#### Build Contracts
```bash
# Build Records contract
cd contracts/records
soroban contract build
cd ../..

# Build Verification contract
cd contracts/verification
soroban contract build
cd ../..
```

#### Deploy Contracts
```bash
# Deploy Records contract
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/medproof_records.wasm \
  --source $SOROBAN_ACCOUNT \
  --network testnet

# Deploy Verification contract
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/medproof_verification.wasm \
  --source $SOROBAN_ACCOUNT \
  --network testnet
```

Copy the returned contract IDs and update your `.env` file:
```
VITE_RECORDS_CONTRACT_ID=<records_contract_id>
VITE_VERIFICATION_CONTRACT_ID=<verification_contract_id>
```

## Manual Contract Invocation

### Records Contract

#### Store a Record
```bash
soroban contract invoke \
  --id <RECORDS_CONTRACT_ID> \
  --source $SOROBAN_ACCOUNT \
  --network testnet \
  -- \
  store_record \
  --owner <STELLAR_ADDRESS> \
  --cid "QmExampleCID123" \
  --title "Blood Test Results" \
  --category "Haematology"
```

#### Get a Record
```bash
soroban contract invoke \
  --id <RECORDS_CONTRACT_ID> \
  --network testnet \
  -- \
  get_record \
  --record_id 1
```

#### Get Records by Owner
```bash
soroban contract invoke \
  --id <RECORDS_CONTRACT_ID> \
  --network testnet \
  -- \
  get_records_by_owner \
  --owner <STELLAR_ADDRESS>
```

#### Get Record Count
```bash
soroban contract invoke \
  --id <RECORDS_CONTRACT_ID> \
  --network testnet \
  -- \
  get_record_count
```

### Verification Contract

#### Verify a Record
```bash
soroban contract invoke \
  --id <VERIFICATION_CONTRACT_ID> \
  --source $SOROBAN_ACCOUNT \
  --network testnet \
  -- \
  verify_record \
  --doctor <DOCTOR_STELLAR_ADDRESS> \
  --record_id 1 \
  --status verified \
  --reason null
```

#### Reject a Record
```bash
soroban contract invoke \
  --id <VERIFICATION_CONTRACT_ID> \
  --source $SOROBAN_ACCOUNT \
  --network testnet \
  -- \
  verify_record \
  --doctor <DOCTOR_STELLAR_ADDRESS> \
  --record_id 1 \
  --status rejected \
  --reason "Incomplete documentation"
```

#### Get Verification Status
```bash
soroban contract invoke \
  --id <VERIFICATION_CONTRACT_ID> \
  --network testnet \
  -- \
  get_verification \
  --record_id 1
```

#### Check if Verified
```bash
soroban contract invoke \
  --id <VERIFICATION_CONTRACT_ID> \
  --network testnet \
  -- \
  is_verified \
  --record_id 1
```

## Testing

Run contract tests:

```bash
# Test Records contract
cd contracts/records
cargo test

# Test Verification contract
cd contracts/verification
cargo test
```

## Storage Schema

### Records Contract

**Keys:**
- `RECORD_{record_id}` → Record struct
- `RECORDS_OWNER_{stellar_address}` → Vec<u64> (list of record IDs)
- `RECORD_COUNTER` → u64 (auto-incrementing counter)

**Record Struct:**
```rust
{
    record_id: u64,
    cid: String,
    owner: Address,
    timestamp: u64,
    title: String,
    category: String,
}
```

### Verification Contract

**Keys:**
- `VERIFICATION_{record_id}` → Verification struct

**Verification Struct:**
```rust
{
    record_id: u64,
    status: Symbol, // "verified" or "rejected"
    doctor: Address,
    timestamp: u64,
    reason: Option<String>,
}
```

## Troubleshooting

### "Account not found" Error
Your account needs testnet XLM. Fund it using Friendbot:
```bash
curl "https://friendbot.stellar.org?addr=$(soroban keys address $SOROBAN_ACCOUNT)"
```

### "Contract not found" Error
Ensure you've deployed the contracts and updated the `.env` file with the correct contract IDs.

### Build Errors
Ensure you have the correct Rust toolchain:
```bash
rustup update
rustup target add wasm32-unknown-unknown
```

## Production Deployment

For mainnet deployment:

1. Update `.env` with mainnet configuration:
```
VITE_STELLAR_RPC_URL=https://soroban-mainnet.stellar.org
VITE_STELLAR_NETWORK_PASSPHRASE=Public Global Stellar Network ; September 2015
```

2. Configure mainnet network:
```bash
soroban network add \
  --global mainnet \
  --rpc-url https://soroban-mainnet.stellar.org \
  --network-passphrase "Public Global Stellar Network ; September 2015"
```

3. Deploy using `--network mainnet` flag instead of `--network testnet`

⚠️ **Warning:** Mainnet deployment requires real XLM and is irreversible. Test thoroughly on testnet first.

## Resources

- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar Friendbot (Testnet Faucet)](https://friendbot.stellar.org)
- [Stellar Laboratory](https://laboratory.stellar.org)
- [Soroban CLI Reference](https://soroban.stellar.org/docs/reference/soroban-cli)
