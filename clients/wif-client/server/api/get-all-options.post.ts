import type { Contract, Network } from '@hyperledger/fabric-gateway';

const channelName = envOrDefault('CHANNEL_NAME', 'evoting-channel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'evoting-chaincode');
const chaincodeFunction = 'getAllOptions';
const utf8Decoder = new TextDecoder();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const gateway = await getGateway(body.user);
    const network: Network = gateway.getNetwork(channelName);
    const contract: Contract = network.getContract(chaincodeName);
  
    console.log('\n--> Evaluate Transaction: getAllOptions function returns all the current options on the ledger');
    const resultBytes = await contract.evaluateTransaction(chaincodeFunction);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
    
    gateway.close();
    return result
})