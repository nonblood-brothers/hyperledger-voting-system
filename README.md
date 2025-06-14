# Electronic Voting System

## 1. Introduction

### 1.1 The System's Purpose and Objectives
The Electronic Voting System is a blockchain-based application designed to provide secure, transparent, and tamper-proof voting capabilities. Built on Hyperledger Fabric, the system enables authorized users to create polls, vote on them, and view results with the assurance that votes cannot be altered or deleted once cast.

The core functions of the system include:
- User registration and authentication
- KYC (Know Your Customer) verification for users
- Poll creation, management, and voting
- Role-based access control
- Secure vote recording on the blockchain

![Blockchain Architecture](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nonblood-brothers/hyperledger-voting-system/refs/heads/main/blockchain-architecture.puml)

### 1.2 System Architecture Overview
The system follows a modular architecture with four main components:

1. **Network**: The Hyperledger Fabric blockchain network that provides the distributed ledger infrastructure. It consists of peer nodes, ordering service, and certificate authorities.

2. **Chaincode**: Smart contracts written in TypeScript that implement the business logic of the voting system. The chaincode is deployed to the blockchain network and executed in a secure container environment.

3. **Gateway**: An API server that provides a REST interface for clients to interact with the blockchain network. It handles authentication, request routing, and transaction submission.

4. **Frontend**: A web-based user interface that allows users to interact with the system (excluded from this guide as per requirements).

### 1.3 Key Technologies
The system utilizes the following technologies:

- **Hyperledger Fabric**: An enterprise-grade permissioned blockchain platform that provides the foundation for the system.
- **Node.js**: The runtime environment for both the chaincode and the gateway.
- **TypeScript**: The programming language used for developing the chaincode and gateway.
- **Express.js**: A web framework used for building the API gateway.
- **Docker**: Used for containerization of the blockchain network components and chaincode.
- **JWT (JSON Web Tokens)**: Used for authentication and session management.
- **gRPC**: Used for communication between the gateway and the blockchain network.

## 2. Development Environment Setup

### 2.1 Environment Requirements
To work with the Electronic Voting System, you need the following software and tools:

#### Operating System
- Linux (Ubuntu 20.04 or later recommended)
- macOS (10.15 or later)
- Windows 10 with WSL2 (Windows Subsystem for Linux)

#### Software Dependencies
- Docker Engine (20.10.x or later)
- Docker Compose (2.x or later)
- Node.js (18.x or later)
- npm (8.x or later)
- Git (2.x or later)

#### Hyperledger Fabric Dependencies
- Hyperledger Fabric binaries (2.5.x)
- Hyperledger Fabric CA (Certificate Authority)
- Hyperledger Fabric peer and orderer binaries

#### Hardware Requirements
- Minimum 4GB RAM (8GB recommended)
- 50GB free disk space
- Dual-core processor or better

### 2.2 Installation and Configuration

#### Step 1: Install Docker and Docker Compose
Follow the official Docker documentation to install Docker Engine and Docker Compose for your operating system:
- https://docs.docker.com/engine/install/
- https://docs.docker.com/compose/install/

#### Step 2: Install Node.js and npm
Install Node.js and npm using NVM (Node Version Manager):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### Step 3: Clone the Repository
```bash
git clone https://github.com/nonblood-brothers/hyperledger-voting-system.git
cd hyperledger-voting-system
```

#### Step 4: Install Hyperledger Fabric Binaries
```bash
cd network
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.0 1.5.5
```

#### Step 5: Install Project Dependencies
```bash
# Install chaincode dependencies
cd chaincode
npm install

# Install gateway dependencies
cd ../gateway
npm install
```

### 2.3 Configuration Files

#### Hyperledger Fabric Configuration
- **network/test-network/configtx/configtx.yaml**: Defines the network configuration, including organizations, capabilities, and channel profiles.
- **network/test-network/organizations**: Contains the cryptographic material for organizations, including certificates and keys.
- **network/test-network/compose**: Contains Docker Compose files for starting the network components.

#### Gateway Configuration
- **gateway/src/config.ts**: Contains configuration for the API gateway, including port, JWT secret, and connection parameters.
- **gateway/.env**: Environment variables for the gateway (create this file based on your environment).

#### Chaincode Configuration
- **chaincode/package.json**: Defines the dependencies and scripts for the chaincode.
- **chaincode/tsconfig.json**: TypeScript configuration for the chaincode.

## 3. System Management and Deployment

### 3.1 Deployment Process

#### Deploying the Blockchain Network
1. Start the Hyperledger Fabric test network:
```bash
cd network/test-network
./network.sh up createChannel -c votingchannel
```

2. Package and deploy the chaincode:
```bash
cd network/test-network
./network.sh deployCC -ccn votingsystem -ccp ../../chaincode -ccl typescript
```

#### Deploying the Gateway
1. Build the gateway:
```bash
cd gateway
npm run build
```

2. Start the gateway:
```bash
npm start
```

### 3.2 Network Interaction Setup

#### Configuring the Gateway to Connect to the Blockchain Network
1. Ensure the gateway has access to the organization's cryptographic material:
```bash
cd gateway
mkdir -p wallet
cp -r ../network/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/* wallet/
cp -r ../network/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/* wallet/
```

2. Update the gateway configuration in `gateway/src/config.ts` with the correct connection parameters:
```typescript
export default {
  port: process.env.PORT || 3000,
  channelName: 'votingchannel',
  chaincodeName: 'votingsystem',
  mspId: 'Org1MSP',
  cryptoPath: '../network/test-network/organizations/peerOrganizations/org1.example.com',
  peerEndpoint: 'localhost:7051',
  peerHostAlias: 'peer0.org1.example.com'
}
```

### 3.3 Blockchain State Management

#### Starting and Stopping the Network
- To start the network: `./network.sh up`
- To stop the network: `./network.sh down`
- To restart the network: `./network.sh down && ./network.sh up`

#### Monitoring the Blockchain State
1. Use the Hyperledger Fabric peer commands to query the ledger:
```bash
# Set environment variables
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${PWD}/configtx
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# Query the ledger
peer chaincode query -C votingchannel -n votingsystem -c '{"Args":["GetActivePolls", "admin"]}'
```

2. Use the monitordocker.sh script to monitor Docker containers:
```bash
./monitordocker.sh
```

## 4. Working with Code and Smart Contracts

### 4.1 Development Process

#### Chaincode Development
The chaincode is written in TypeScript and follows a modular structure:
- **src/votingSystem.contract.ts**: The main contract file that implements the business logic.
- **src/object/**: Domain objects that represent the data model.
- **src/repository/**: Repositories that handle data access to the ledger.
- **src/enum/**: Enumerations for statuses and roles.
- **src/decorator/**: Decorators for method protection and logging.

To develop new features or modify existing ones:
1. Make changes to the relevant files in the chaincode/src directory.
2. Build the chaincode with `npm run build`.
3. Test your changes locally.
4. Deploy the updated chaincode to the network.

#### Gateway Development
The gateway is also written in TypeScript and follows a modular structure:
- **src/server.ts**: Sets up the Express server and middleware.
- **src/router/**: Defines the API routes.
- **src/handler/**: Implements the request handlers.
- **src/middleware/**: Implements middleware for authentication, logging, etc.
- **src/util/**: Utility functions for interacting with the blockchain.

### 4.2 Deploying and Updating Smart Contracts

#### Initial Deployment
```bash
cd network/test-network
./network.sh deployCC -ccn votingsystem -ccp ../../chaincode -ccl typescript
```

#### Updating Deployed Chaincode
1. Update the chaincode version in chaincode/package.json.
2. Build the chaincode: `cd chaincode && npm run build`.
3. Package the chaincode:
```bash
cd network/test-network
peer lifecycle chaincode package votingsystem.tar.gz --path ../../chaincode --lang node --label votingsystem_1.1
```

4. Install the new chaincode package:
```bash
peer lifecycle chaincode install votingsystem.tar.gz
```

5. Approve and commit the chaincode definition:
```bash
# Get the package ID
peer lifecycle chaincode queryinstalled

# Approve for Org1
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID votingchannel --name votingsystem --version 1.1 --package-id <PACKAGE_ID> --sequence 2 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Check commit readiness
peer lifecycle chaincode checkcommitreadiness --channelID votingchannel --name votingsystem --version 1.1 --sequence 2 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --output json

# Commit the chaincode definition
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID votingchannel --name votingsystem --version 1.1 --sequence 2 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
```

### 4.3 Debugging and Testing

#### Debugging Chaincode
1. Use console.log statements in your chaincode for debugging.
2. Start the chaincode in debug mode:
```bash
cd chaincode
DEBUG=true npm run start:server-debug
```

3. Attach a debugger to the chaincode process (e.g., using VS Code).

#### Testing
1. Write unit tests for your chaincode using a testing framework like Jest.
2. Create test scripts that interact with the deployed chaincode through the gateway.
3. Use the Hyperledger Fabric peer CLI to test chaincode functions directly:
```bash
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C votingchannel -n votingsystem --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"InitLedger","Args":[]}'
```

## 5. Monitoring and Support

### 5.1 Monitoring Tools

#### Docker Container Monitoring
Use the monitordocker.sh script to monitor Docker containers:
```bash
cd network/test-network
./monitordocker.sh
```

#### Prometheus and Grafana
The network includes Prometheus and Grafana for monitoring:
1. Start the monitoring tools:
```bash
cd network/test-network/prometheus-grafana
docker-compose up -d
```

2. Access Grafana at http://localhost:3000 (default credentials: admin/admin).
3. Import the Hyperledger Fabric dashboard to monitor network metrics.

#### API Gateway Monitoring
The gateway includes logging middleware that logs all requests. You can extend this to include metrics collection using tools like Prometheus client for Node.js.

### 5.2 Errors and Logs

#### Chaincode Logs
View chaincode logs using Docker:
```bash
docker logs -f $(docker ps -q --filter name=chaincode)
```

#### Gateway Logs
The gateway logs to the console by default. You can redirect these logs to a file:
```bash
npm start > gateway.log 2>&1
```

#### Network Logs
View logs for network components:
```bash
# Peer logs
docker logs peer0.org1.example.com

# Orderer logs
docker logs orderer.example.com

# CA logs
docker logs ca_org1
```

### 5.3 System Updates

#### Updating Chaincode
Follow the process described in section 4.2 to update the chaincode.

#### Updating the Gateway
1. Pull the latest code: `git pull`
2. Install dependencies: `npm install`
3. Build the application: `npm run build`
4. Restart the gateway: `npm start`

#### Updating Hyperledger Fabric
1. Stop the network: `./network.sh down`
2. Update the Fabric binaries:
```bash
cd network
curl -sSL https://bit.ly/2ysbOFE | bash -s -- <new-version> 1.5.5
```
3. Start the network again: `./network.sh up`

## 6. Security

### 6.1 Data Protection

#### Cryptographic Security
The system uses Hyperledger Fabric's built-in cryptographic mechanisms:
- TLS for secure communication between components
- X.509 certificates for identity management
- MSP (Membership Service Provider) for access control
- Chaincode encryption for sensitive data

#### Authentication
The system uses JWT (JSON Web Tokens) for authentication:
1. Users authenticate with their student ID and password.
2. The gateway verifies credentials and issues a JWT.
3. Subsequent requests include the JWT in the Authorization header.
4. The auth middleware verifies the JWT and extracts the user's identity.

#### Data Privacy
- Sensitive data like password hashes are stored securely on the blockchain.
- The chaincode implements access control to ensure users can only access authorized data.
- KYC verification adds an additional layer of identity verification.

### 6.2 Roles and Permissions

The system implements role-based access control with two main roles:

#### Admin Role
Administrators can:
- Review and approve/decline polls
- Manage KYC applications
- Access all polls and their results

#### Student Role
Students can:
- Register and complete KYC verification
- Create and manage their own polls
- Vote in active polls
- View poll results

The @ProtectedMethod decorator in the chaincode enforces these permissions by checking the user's role and KYC status before allowing access to protected functions.

### 6.3 Ensuring Fault Tolerance

#### Blockchain Redundancy
Hyperledger Fabric provides fault tolerance through:
- Multiple peer nodes that maintain copies of the ledger
- Consensus mechanism that ensures agreement on the state of the ledger
- Ordering service that ensures transaction ordering

#### Gateway Redundancy
For production deployments, implement:
- Multiple gateway instances behind a load balancer
- Health checks to detect and replace failed instances
- Database replication for any off-chain data

#### Backup and Recovery
1. Regularly backup the network's cryptographic material and configuration.
2. Document procedures for recovering from different failure scenarios.
3. Implement monitoring to detect failures early.

## 7. Troubleshooting

### 7.1 Common Errors and Their Resolution

#### Network Startup Issues
- **Error**: "Failed to bring up orderer"
  **Solution**: Check Docker logs for the orderer container. Ensure ports are not in use by other applications.

- **Error**: "Error connecting to peer"
  **Solution**: Verify that the peer container is running and that TLS certificates are correctly configured.

#### Chaincode Deployment Issues
- **Error**: "Error installing chaincode"
  **Solution**: Check that the chaincode package is correctly formatted and that the peer has sufficient resources.

- **Error**: "Error instantiating chaincode"
  **Solution**: Verify that the chaincode can be built and that all dependencies are installed.

#### Gateway Connection Issues
- **Error**: "Failed to connect to the gateway"
  **Solution**: Check that the network is running and that the gateway configuration points to the correct endpoints.

- **Error**: "Failed to evaluate transaction"
  **Solution**: Verify that the chaincode is correctly installed and instantiated, and that the user has the necessary permissions.

### 7.2 Frequently Asked Questions (FAQ)

#### General Questions
- **Q**: How do I reset the network to its initial state?
  **A**: Run `./network.sh down` to stop the network and remove all containers, then run `./network.sh up createChannel -c votingchannel` to start it again.

- **Q**: How can I add a new organization to the network?
  **A**: Use the `./network.sh addOrg3` script as a template to add a new organization.

#### Chaincode Questions
- **Q**: How do I update the chaincode without losing data?
  **A**: Follow the chaincode update process in section 4.2. The ledger data will be preserved.

- **Q**: How can I debug chaincode execution?
  **A**: Use console.log statements in your chaincode and view the logs using `docker logs`.

#### Gateway Questions
- **Q**: How do I secure the gateway API?
  **A**: The gateway already implements JWT authentication. For additional security, consider adding rate limiting, HTTPS, and API key validation.

- **Q**: How can I monitor API usage?
  **A**: Extend the logger middleware to collect metrics and integrate with a monitoring system like Prometheus.

## 8. Appendices

### 8.1 Additional Materials

#### Documentation
- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [Hyperledger Fabric SDK for Node.js](https://hyperledger.github.io/fabric-sdk-node/)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

#### Code Examples
- [Hyperledger Fabric Samples](https://github.com/hyperledger/fabric-samples)
- [Chaincode Examples](https://github.com/hyperledger/fabric-samples/tree/main/chaincode)
- [Gateway Examples](https://github.com/hyperledger/fabric-samples/tree/main/asset-transfer-basic/application-gateway-typescript)

#### Configuration Templates
- [Network Configuration Template](https://github.com/hyperledger/fabric-samples/blob/main/test-network/configtx/configtx.yaml)
- [Docker Compose Template](https://github.com/hyperledger/fabric-samples/blob/main/test-network/compose/docker-compose-test-net.yaml)

### 8.2 Support Contacts

For support with the Electronic Voting System, contact:
- Technical Support: support@votingsystem.example.com
- Development Team: dev@votingsystem.example.com
- System Administrator: admin@votingsystem.example.com

For Hyperledger Fabric support:
- [Hyperledger Fabric Chat](https://chat.hyperledger.org/channel/fabric)
- [Hyperledger Fabric Mailing List](https://lists.hyperledger.org/g/fabric)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/hyperledger-fabric)
