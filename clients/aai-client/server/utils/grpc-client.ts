/** 
 * Create a gRPC-Client instance
 * Use Singleton pattern to ensure only one gRPC connection will be used in the application
 */ 
import * as grpc from '@grpc/grpc-js';
import { promises as fs } from 'fs';
import * as path from 'path';

// Path to crypto materials.
const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve('test-network', 'organizations', 'peerOrganizations', 'org3.example.com'));

// Path to peer tls certificate.
const tlsCertPath = envOrDefault('TLS_CERT_PATH', path.resolve(cryptoPath, 'peers', 'peer0.org3.example.com', 'tls', 'ca.crt'));

// Gateway peer endpoint.
const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'inf-evoting.inf.fh-rosenheim.de:11051');

// Gateway peer SSL host name override.
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org3.example.com');

let clientInstance: grpc.Client | null = null;

export async function getGrpcClient(): Promise<grpc.Client> {
    if (!clientInstance) {
        clientInstance = await newGrpcConnection();
    }
    return clientInstance;
}

async function newGrpcConnection(): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

function envOrDefault(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}