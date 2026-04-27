#!/bin/bash

set -e

echo "🚀 Building Soroban contracts..."

# Build Records contract
echo "📦 Building Records contract..."
cd contracts/records
soroban contract build
cd ../..

# Build Verification contract
echo "📦 Building Verification contract..."
cd contracts/verification
soroban contract build
cd ../..

echo "✅ Contracts built successfully"

# Check if SOROBAN_ACCOUNT is set
if [ -z "$SOROBAN_ACCOUNT" ]; then
    echo "⚠️  SOROBAN_ACCOUNT environment variable not set"
    echo "Please set it to your Stellar account name:"
    echo "export SOROBAN_ACCOUNT=your-account-name"
    exit 1
fi

echo "🌐 Deploying to Stellar Testnet..."

# Deploy Records contract
echo "📤 Deploying Records contract..."
RECORDS_CONTRACT_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/medproof_records.wasm \
    --source $SOROBAN_ACCOUNT \
    --network testnet)

echo "✅ Records contract deployed: $RECORDS_CONTRACT_ID"

# Deploy Verification contract
echo "📤 Deploying Verification contract..."
VERIFICATION_CONTRACT_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/medproof_verification.wasm \
    --source $SOROBAN_ACCOUNT \
    --network testnet)

echo "✅ Verification contract deployed: $VERIFICATION_CONTRACT_ID"

# Update .env file
echo "📝 Updating .env file..."

# Create temp file
TEMP_FILE=$(mktemp)

# Read .env and update contract IDs
while IFS= read -r line; do
    if [[ $line == VITE_RECORDS_CONTRACT_ID=* ]]; then
        echo "VITE_RECORDS_CONTRACT_ID=$RECORDS_CONTRACT_ID" >> "$TEMP_FILE"
    elif [[ $line == VITE_VERIFICATION_CONTRACT_ID=* ]]; then
        echo "VITE_VERIFICATION_CONTRACT_ID=$VERIFICATION_CONTRACT_ID" >> "$TEMP_FILE"
    else
        echo "$line" >> "$TEMP_FILE"
    fi
done < .env

# Replace .env with updated version
mv "$TEMP_FILE" .env

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Contract IDs:"
echo "  Records:      $RECORDS_CONTRACT_ID"
echo "  Verification: $VERIFICATION_CONTRACT_ID"
echo ""
echo "✅ .env file updated with contract IDs"
