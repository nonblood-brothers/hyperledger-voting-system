import { NextFunction, Request, RequestHandler, Response } from 'express'
import jwt from 'jsonwebtoken'
import { TokenPayload } from '@/interface/token-payload.interface';

export function getAuthMiddleware(jwtKey: string): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (req.skipAuth) { next(); return; }

        const authorizationHeader = req.get('authorization');
        const token = authorizationHeader?.split(' ').at(1)

        try {
            const tokenInfo = jwt.verify(token || '', jwtKey) as TokenPayload
            req.studentIdNumber = tokenInfo.studentIdNumber
        } catch (e) {
            res.status(401).send({ status: 'UNAUTHORIZED' })
            return
        }

        next()
    }
}