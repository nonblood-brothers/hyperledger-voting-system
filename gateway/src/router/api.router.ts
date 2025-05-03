import { Contract } from '@hyperledger/fabric-gateway';
import { Router } from 'express';
import { getAuthHandler } from '@/handler/auth.handler';
import { getEvaluateTransactionHandler, getSubmitTransactionHandler } from '@/handler/tx.handler';

export const getApiRouter = (contract: Contract, jwtKey: string) => {
    const router = Router()

    router.post('/authenticate', getAuthHandler(contract, jwtKey))

    router.post('/tx/submit', getSubmitTransactionHandler(contract))
    router.post('/tx/evaluate', getEvaluateTransactionHandler(contract))

    return router
}