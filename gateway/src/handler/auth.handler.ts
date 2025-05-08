import crypto from 'crypto'

import { BadRequestException } from '@/exception/bad-request.exception'
import { evaluateTransactionAndGetResult } from '@/util/evaluate-transaction';

import { Contract } from '@hyperledger/fabric-gateway';
import { Request, RequestHandler, Response } from 'express';
import { sign } from 'jsonwebtoken'
import { TokenPayload } from '@/interface/token-payload.interface';

export function getAuthHandler(contract: Contract, jwtKey: string): RequestHandler {
    return async (req: Request, res: Response) => {
        const { studentIdNumber, password, secretKey } = req.body as { studentIdNumber: string; password: string; secretKey: string; };

        const user = await evaluateTransactionAndGetResult<{ passwordHash: string; secretKeyHash: string; }>(contract, 'GetExistingUser', studentIdNumber)
        const passwordHash = crypto.createHash('sha256').update(password).digest().toString('hex')
        const secretKeyHash = crypto.createHash('sha256').update(secretKey).digest().toString('hex')

        if (user.passwordHash !== passwordHash || user.secretKeyHash !== secretKeyHash) {
            throw new BadRequestException('Wrong password or secret key!')
        }

        const token = sign({ studentIdNumber } satisfies TokenPayload as object, jwtKey)

        res.status(200).send({ token })
    }
}