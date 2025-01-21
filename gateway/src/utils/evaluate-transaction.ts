import { Contract } from "@hyperledger/fabric-gateway";
import { decodeAndParseUtf8Json } from "./decode-utf8-json";

export async function evaluateTransactionAndGetResult(contract: Contract, methodName: string, ...args: string[]): Promise<unknown> {
    const resultBytes = await contract.evaluateTransaction(methodName, ...args);
    return decodeAndParseUtf8Json(resultBytes)
}