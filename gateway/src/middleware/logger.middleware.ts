import crypto from 'crypto'

import logger from '@/helper/logger.helper'
import { Request, Response, NextFunction, RequestHandler } from 'express'

export function getLoggerMiddleware(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        const traceId = crypto.randomUUID()

        const body = JSON.stringify(req.body)
        logger.log(`Received ${req.method} request on ${req.url} with body: ${body}`, [traceId])
        next()
    }
}