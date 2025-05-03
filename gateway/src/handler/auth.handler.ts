import { BadRequestException } from '@exception/bad-request.exception'
import { evaluateTransactionAndGetResult } from "@util/evaluate-transaction";
import { getEnv } from "@helper/env.helper";
import { JWT_SECRET_KEY } from "@constant/env.constant";

import { Contract } from "@hyperledger/fabric-gateway";
import { RequestHandler } from "express";
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

export function getAuthHandler(contract: Contract, jwtKey: string): RequestHandler {
    return async (req, res) => {
        const { username, password, secretKey } = req.body;

        const user = await evaluateTransactionAndGetResult<{ passwordHash: string; secretKeyHash: string; }>(contract, 'GetExistingUser', username)
        const passwordHash = crypto.createHash('sha3').update(password).digest().toString()
        const secretKeyHash = crypto.createHash('sha3').update(secretKey).digest().toString()

        if (user.passwordHash !== passwordHash || user.secretKeyHash !== secretKeyHash) {
            throw new BadRequestException('Wrong password or secret key!')
        }

        const token = jwt.sign({ username }, jwtKey)

        res.sendStatus(200).send({ token })
    }
}