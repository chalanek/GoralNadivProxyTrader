# Crypto Proxy Service

This project is a TypeScript microservice that acts as a proxy for cryptocurrency trading. It receives commands from a Vercel application and processes them through the Binance API.

## Features

- **Trade Execution**: Interact with the Binance API to execute trades.
- **Market Data**: Fetch market data for cryptocurrencies.
- **Authentication**: Middleware for securing endpoints.
- **Error Handling**: Centralized error handling for better debugging and user experience.

## Project Structure

```
crypto-proxy-service
├── src
│   ├── app.ts                # Entry point of the microservice
│   ├── config                # Configuration files
│   │   ├── environment.ts    # Environment variables and API keys
│   │   └── index.ts          # Exports configuration settings
│   ├── controllers           # Controllers for handling requests
│   │   └── tradeController.ts # Trade-related request handling
│   ├── middleware            # Middleware functions
│   │   ├── auth.ts           # Authentication middleware
│   │   └── error.ts          # Error handling middleware
│   ├── routes                # API routes
│   │   └── api.ts            # Defines API routes and links to controllers
│   ├── services              # Business logic and API interaction
│   │   ├── binanceService.ts  # Interacts with the Binance API
│   │   └── tradeService.ts    # Trade processing logic
│   ├── types                 # TypeScript interfaces
│   │   ├── binance.ts         # Interfaces for Binance API data
│   │   └── trade.ts           # Interfaces for trade-related data
│   └── utils                 # Utility functions
│       ├── logger.ts          # Logging utility
│       └── validators.ts      # Data validation utility
├── .env.example               # Example environment variables
├── .gitignore                 # Git ignore file
├── package.json               # NPM configuration
├── tsconfig.json             # TypeScript configuration
├── jest.config.js            # Jest configuration
└── README.md                 # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd crypto-proxy-service
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file and fill in the required environment variables.

4. Start the application:
   ```
   npm run start
   ```

## Usage

- The microservice exposes various endpoints for trading operations. Refer to the API documentation for details on available routes and their usage.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.