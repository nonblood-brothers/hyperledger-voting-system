import { decodeAndParseUtf8Json } from '@/util/decode-utf8-json';

import { Contract } from '@hyperledger/fabric-gateway';

export async function evaluateTransactionAndGetResult<T = unknown>(contract: Contract, methodName: string, ...args: string[]): Promise<T> {
    const resultBytes = await contract.evaluateTransaction(methodName, ...args);
    return decodeAndParseUtf8Json(resultBytes)
}