import { decodeAndParseUtf8Json } from '@/util/decode-utf8-json';

import { Contract } from '@hyperledger/fabric-gateway';

export async function submitTransactionAndGetResult<T = unknown>(contract: Contract, methodName: string, ...args: string[]): Promise<T> {
    const resultBytes = await contract.submitTransaction(methodName, ...args);
    return decodeAndParseUtf8Json(resultBytes)
}