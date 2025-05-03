import { evaluateTransactionAndGetResult } from '@/util/evaluate-transaction'
import { submitTransactionAndGetResult } from '@/util/submit-transaction';
import { Contract } from '@hyperledger/fabric-gateway'
import { RequestHandler } from 'express'

export function getSubmitTransactionHandler(contract: Contract): RequestHandler {
    return async (req, res) => {
        const { method, args } = req.body as { method: string, args: string[] };

        const result = await submitTransactionAndGetResult(contract, method, ...args)

        res.set('Content-Type', 'application/json; charset=utf-8')
            .send({ status: 'OK', submitted: true, result })
    }
}

export function getEvaluateTransactionHandler(contract: Contract): RequestHandler {
    return async (req, res) => {
        const { method, args } = req.body as { method: string, args: string[] };

        const result = await evaluateTransactionAndGetResult(contract, method, ...args)

        res.set('Content-Type', 'application/json; charset=utf-8')
            .status(200)
            .send({ status: 'OK', submitted: false, result })
    }
}