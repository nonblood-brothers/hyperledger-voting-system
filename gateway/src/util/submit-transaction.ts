import { Contract } from "@hyperledger/fabric-gateway";
import { decodeAndParseUtf8Json } from "./decode-utf8-json";

export async function submitTransactionAndGetResult<T = unknown>(contract: Contract, methodName: string, ...args: string[]): Promise<T> {
    const resultBytes = await contract.submitTransaction(methodName, ...args);
    return decodeAndParseUtf8Json(resultBytes)
}