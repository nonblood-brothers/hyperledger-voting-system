import { Contract } from '@hyperledger/fabric-gateway';
import { Router } from 'express';
import { getAuthHandler } from '@/handler/auth.handler';
import { getEvaluateTransactionHandler, getSubmitTransactionHandler } from '@/handler/tx.handler';
import { asyncWrapHandler } from '@/helper/async-wrap-handler.helper';

export const getApiRouter = (contract: Contract, jwtKey: string) => {
    const router = Router()

    router.post('/authenticate', asyncWrapHandler(getAuthHandler(contract, jwtKey)))

    router.post('/tx/submit', asyncWrapHandler(getSubmitTransactionHandler(contract)))
    router.post('/tx/evaluate', asyncWrapHandler(getEvaluateTransactionHandler(contract)))

    return router
}