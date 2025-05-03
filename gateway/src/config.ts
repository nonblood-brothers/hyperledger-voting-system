import * as path from 'path';
import { envOrDefault } from './util/env-or-default';

const testNetworkPath = envOrDefault('TEST_NETWORK_PATH', path.resolve(__dirname, '..', '..', 'network', 'test-network'))
const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve(testNetworkPath, 'organizations', 'peerOrganizations', 'org1.example.com'));

export default {
    port: envOrDefault('APP_PORT', '3000'),
    channelName: envOrDefault('CHANNEL_NAME', 'vs'),
    chaincodeName: envOrDefault('CHAINCODE_NAME', 'voting_system'),
    mspId: envOrDefault('MSP_ID', 'Org1MSP'),
    keyDirectoryPath: envOrDefault('KEY_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore')),
    certDirectoryPath: envOrDefault('CERT_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts')),
    tlsCertPath: envOrDefault('TLS_CERT_PATH', path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt')),
    peerEndpoint: envOrDefault('PEER_ENDPOINT', 'localhost:7051'),
    peerHostAlias: envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com'),
    cryptoPath
}