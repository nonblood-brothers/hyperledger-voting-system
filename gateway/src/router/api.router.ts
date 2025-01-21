import { Contract } from "@hyperledger/fabric-gateway";
import { Router, json as jsonBodyParser } from "express";
import { getAuthHandler } from "../handler/auth.handler";
import { getEvaluateTransactionHandler, getSubmitTransactionHandler } from "../handler/tx.handler";

export const getApiRouter = (contract: Contract) => {
    const router = Router()
    router.use(jsonBodyParser())

    router.post('/authenticate', getAuthHandler(contract))

    router.post('/tx/submit', getSubmitTransactionHandler(contract))
    router.post('/tx/evaluate', getEvaluateTransactionHandler(contract))

    return router
}