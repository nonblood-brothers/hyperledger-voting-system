import config from './config'

import { getApiRouter } from '@/router/api.router'

import { Contract } from '@hyperledger/fabric-gateway'
import express from 'express'
import { getLoggerMiddleware } from '@/middleware/logger.middleware'
import { getAuthMiddleware } from '@/middleware/auth.middleware'
import { JWT_SECRET_KEY } from '@/constant/env.constant'
import { getEnv } from '@/util/get-env';
import { getProtectedMethodsMiddleware } from '@/middleware/protected-methods.middleware';
import { PROTECTED_METHODS } from '@/constant/protected-methods.constant';
import { getExceptionFilterMiddleware } from '@/middleware/exception-filter.middleware';

export function server(contract: Contract) {
    const app = express()

    app.use(express.json())

    app.use(getLoggerMiddleware())
    app.use(getProtectedMethodsMiddleware(PROTECTED_METHODS))
    app.use(getAuthMiddleware(getEnv(JWT_SECRET_KEY)))

    app.use('/api', getApiRouter(contract, getEnv(JWT_SECRET_KEY)))

    app.get('/', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.status(403).send({ message: 'You shall not pass!' })
    })

    app.use(getExceptionFilterMiddleware())

    app.listen(config.port, (err) => {
        if (err) {
            throw new Error('Failed to start server: ', err)
        }

        console.log('Successfully started gateway on port', config.port)
    })
}