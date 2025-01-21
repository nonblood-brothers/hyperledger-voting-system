import { Contract } from "@hyperledger/fabric-gateway"
import { RequestHandler } from "express"

// TODO: implement submitting transaction handler
export function getSubmitTransactionHandler(contract: Contract): RequestHandler {
    return async (req, res) => {

    }
}

// TODO: implement evaluating transaction handler
export function getEvaluateTransactionHandler(contract: Contract): RequestHandler {
    return async (req, res) => {

    }
} 