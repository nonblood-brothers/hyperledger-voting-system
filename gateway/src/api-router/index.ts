import { Contract } from "@hyperledger/fabric-gateway";
import { Router } from "express";

export const getApiRouter = (contract: Contract) => {
    const router = Router()

    router.post('/authenticate')

    router.post('/tx/submit',)
    router.post('/tx/evaluate')

    return router
}