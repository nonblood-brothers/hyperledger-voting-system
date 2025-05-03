import crypto from 'crypto'

import { BadRequestException } from '@/exception/bad-request.exception'
import { evaluateTransactionAndGetResult } from '@/util/evaluate-transaction';

import { Contract } from '@hyperledger/fabric-gateway';
import { Request, RequestHandler, Response } from 'express';
import { sign } from 'jsonwebtoken'
import { TokenPayload } from '@/interface/token-payload.interface';

export function getAuthHandler(contract: Contract, jwtKey: string): RequestHandler {
    return async (req: Request, res: Response) => {
        const { username, password, secretKey } = req.body as { username: string; password: string; secretKey: string; };

        const user = await evaluateTransactionAndGetResult<{ passwordHash: string; secretKeyHash: string; }>(contract, 'GetExistingUser', username)
        const passwordHash = crypto.createHash('sha3').update(password).digest().toString()
        const secretKeyHash = crypto.createHash('sha3').update(secretKey).digest().toString()

        if (user.passwordHash !== passwordHash || user.secretKeyHash !== secretKeyHash) {
            throw new BadRequestException('Wrong password or secret key!')
        }

        const token = sign({ username } satisfies TokenPayload as object, jwtKey)

        res.sendStatus(200).send({ token })
    }
}