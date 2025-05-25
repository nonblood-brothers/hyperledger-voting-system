import config from './config'

import { getApiRouter } from '@/router/api.router'

import { Contract } from '@hyperledger/fabric-gateway'
import express from 'express'
import * as path from 'path'
import { getLoggerMiddleware } from '@/middleware/logger.middleware'
import { getAuthMiddleware } from '@/middleware/auth.middleware'
import { JWT_SECRET_KEY } from '@/constant/env.constant'
import { getEnv } from '@/util/get-env';
import { getProtectedMethodsMiddleware } from '@/middleware/protected-methods.middleware';
import { PROTECTED_METHODS } from '@/constant/protected-methods.constant';
import { getExceptionFilterMiddleware } from '@/middleware/exception-filter.middleware';
// Note: You need to install the cors package: npm install cors @types/cors
import cors from 'cors';

export function server(contract: Contract) {
    const app = express()

    // Enable CORS for all routes
    app.use(cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }))

    app.use(express.json())

    app.use(getLoggerMiddleware())
    app.use(getProtectedMethodsMiddleware(PROTECTED_METHODS))
    app.use(getAuthMiddleware(getEnv(JWT_SECRET_KEY)))

    app.use('/api', getApiRouter(contract, getEnv(JWT_SECRET_KEY)))

    // Serve static files from the frontend build directory
    const frontendBuildPath = path.join(__dirname, '../../frontend/build');
    app.use(express.static(frontendBuildPath));

    // Serve index.html for all routes except /api
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(frontendBuildPath, 'index.html'));
        }
    })

    app.use(getExceptionFilterMiddleware())

    app.listen(config.port, (err) => {
        if (err) {
            throw new Error('Failed to start server: ', err)
        }

        console.log('Successfully started gateway on port', config.port)
    })
}
