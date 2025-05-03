import crypto from 'crypto'
import logger from '@helper/logger.helper'
import { Request, Response, NextFunction, RequestHandler } from 'express'

export function getLoggerMiddleware(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        const traceId = crypto.randomUUID()

        logger.log(`Received ${req.method} request on ${req.url} with body: ${req.body.toString()}`, [traceId])
        next()
        logger.log(`Completed ${req.method} request on ${req.url}`, [traceId])
    }
}