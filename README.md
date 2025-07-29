# Leaky Vault - Private Storage Exploit

This project demonstrates a vulnerability in Solidity smart contracts where private storage variables can be read directly from the blockchain.

## Contract Overview

The `Vault` contract contains:

- A private `salt` variable (initialized with `block.timestamp`)
- A private `hiddenPassword` variable (initialized with `123_456_789`)
- A `claim` function that requires the correct password to withdraw funds

## Vulnerability

The contract's private variables are stored in predictable storage slots and can be read directly from the blockchain using `eth_getStorageAt`. This allows an attacker to:

1. Read the private `salt` and `hiddenPassword` values
2. Compute the correct password using the same logic as the contract
3. Claim all funds from the vault

## Setup and Usage

### 1. Install Dependencies

```bash
npm install
```

### 2. Compile Contracts

```bash
npm run compile
```

### 3. Start Local Hardhat Network

```bash
npm run node
```

### 4. Deploy the Vault Contract

In a new terminal:

```bash
npm run deploy
```

This will:

- Deploy the Vault contract with 1 ETH
- Use initial seed of 42
- Output the contract address

### 5. Update Attack Script

Edit `scripts/attack.ts` and replace the `vaultAddress` variable with the actual deployed contract address from step 4.

### 6. Execute the Attack

```bash
npm run attack
```

This will:

- Read the private storage slots
- Compute the correct password
- Claim all funds from the vault

### Alternative: Run Complete Demo

## How the Attack Works

1. **Storage Layout**: Solidity stores variables in sequential 32-byte slots

   - Slot 0: `salt` (uint256)
   - Slot 1: `hiddenPassword` (uint256)

2. **Password Computation**: The contract computes the password as:

   ```solidity
   keccak256(abi.encode(hiddenPassword + salt))
   ```

3. **Attack Steps**:
   - Read storage slot 0 to get `salt`
   - Read storage slot 1 to get `hiddenPassword`
   - Compute `hiddenPassword + salt`
   - Hash the result using `keccak256(abi.encode(...))`
   - Call `claim()` with the computed password

## Security Lesson

Private variables in Solidity are not truly private - they are just not accessible from within the contract. Anyone can read storage slots directly from the blockchain. Sensitive data should never be stored on-chain, even in private variables.

## Files

- `contracts/Vault.sol` - The vulnerable vault contract
- `scripts/deploy.ts` - Deployment script that sends 1 ETH to the vault
- `scripts/attack.ts` - Attack script that exploits the private storage vulnerability
