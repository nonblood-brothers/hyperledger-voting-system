import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { HttpException } from '@/exception/http.exception';
import { EndorseError } from '@hyperledger/fabric-gateway';

export function getExceptionFilterMiddleware(): ErrorRequestHandler {
    return (err: HttpException | Error, req: Request, res: Response, next: NextFunction): void => {
        console.error(err)

        if (err instanceof HttpException) {
            res.status(err.statusCode).send({ message: err.message || 'Bad request' })
            return;
        }

        if (err instanceof EndorseError) {
            res.status(400).send({ message: err.details[0]?.message.split(', ').slice(1).join(', ') })
            return;
        }

        res.status(500).send({ message: 'Internal server error' })
        return;
    }
}