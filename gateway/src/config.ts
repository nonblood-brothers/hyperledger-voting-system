import * as path from 'node:path';

import { getEnv } from '@/util/get-env';

const testNetworkPath = getEnv('TEST_NETWORK_PATH', path.resolve(__dirname, '..', '..', 'network', 'test-network'))
const cryptoPath = getEnv('CRYPTO_PATH', path.resolve(testNetworkPath, 'organizations', 'peerOrganizations', 'org1.example.com'));

export default {
    port: getEnv('APP_PORT', '3000'),
    channelName: getEnv('CHANNEL_NAME', 'vs'),
    chaincodeName: getEnv('CHAINCODE_NAME', 'voting_system'),
    mspId: getEnv('MSP_ID', 'Org1MSP'),
    keyDirectoryPath: getEnv('KEY_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore')),
    certDirectoryPath: getEnv('CERT_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts')),
    tlsCertPath: getEnv('TLS_CERT_PATH', path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt')),
    peerEndpoint: getEnv('PEER_ENDPOINT', 'localhost:7051'),
    peerHostAlias: getEnv('PEER_HOST_ALIAS', 'peer0.org1.example.com'),
    cryptoPath
}