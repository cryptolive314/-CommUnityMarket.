# CommUnity Market

A decentralized marketplace for community goods, services, and ideas built with React Native, Expo, and WalletConnect.

## Features

- Decentralized escrow system for secure transactions
- Community proposal voting system
- User reputation tracking
- Integration with Songbird Canary-Network
- Mobile-first design with React Native

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- A WalletConnect Project ID (get one at https://cloud.walletconnect.com/)

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `REACT_APP_WALLETCONNECT_PROJECT_ID` with your WalletConnect Project ID
   - Update other environment variables as needed

4. Start the development server:
```bash
npm start
```

## Environment Variables

The following environment variables are required:

```env
# Contract Configuration
REACT_APP_ESCROW_CONTRACT=        # Escrow contract address
REACT_APP_ARBITER_WALLET=         # Arbiter wallet address

# Blockchain Network Configuration
REACT_APP_NETWORK_NAME=           # Network name (e.g., Songbird Canary-Network)
REACT_APP_NETWORK_ID=             # Network ID (e.g., 19 for Songbird)
REACT_APP_RPC_URL=                # RPC URL for the network

# WalletConnect Configuration
REACT_APP_WALLETCONNECT_PROJECT_ID= # Your WalletConnect Project ID
REACT_APP_WALLETCONNECT_RELAY_URL=  # WalletConnect relay URL

# Platform Configuration
REACT_APP_PLATFORM_FEE_PERCENTAGE=   # Platform fee percentage
REACT_APP_MAX_PLATFORM_FEE_PERCENTAGE= # Maximum platform fee percentage
```

## Project Structure

```
CommUnityMarket/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   └── _layout.tsx        # Root layout configuration
├── src/
│   ├── services/          # Service layer (BlockchainService, etc.)
│   ├── hooks/             # Custom React hooks
│   └── contracts/         # Smart contract ABIs
├── components/            # Shared UI components
└── constants/             # App constants and configuration
```

## Security

- Rate limiting on wallet connections
- Transaction timeout protection
- Network validation
- Signature verification for wallet ownership
- Secure environment variable handling

## License

MIT License

## Support

For support, email support@communitymarket.com
