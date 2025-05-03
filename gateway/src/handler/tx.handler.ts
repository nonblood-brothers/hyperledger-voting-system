import { Contract } from "@hyperledger/fabric-gateway"
import { RequestHandler } from "express"
import { evaluateTransactionAndGetResult } from '../util/evaluate-transaction'
import { submitTransactionAndGetResult } from "../util/submit-transaction";

export function getSubmitTransactionHandler(contract: Contract): RequestHandler {
    return async (req, res) => {
        const { method, args } = req.body;

        const result = await submitTransactionAndGetResult(contract, method, args)

        res.sendStatus(200)
            .header('Content-Type', 'application/json')
            .send({ status: 'OK', executed: true, result })
    }
}

export function getEvaluateTransactionHandler(contract: Contract): RequestHandler {
    return async (req, res) => {
        const { method, args } = req.body;

        const result = await evaluateTransactionAndGetResult(contract, method, args)

        res.sendStatus(200)
            .header('Content-Type', 'application/json')
            .send({ status: 'OK', executed: false, result })
    }
}