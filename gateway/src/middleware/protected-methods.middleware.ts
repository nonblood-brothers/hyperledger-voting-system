import { NextFunction, Request, RequestHandler, Response } from 'express'

export function getProtectedMethodsMiddleware(protectedMethods: string[]): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.url.startsWith('/api/tx')) {
            req.skipAuth = true;
            next();
            return;
        }

        const { method } = req.body as { method: string | undefined };

        if (method && !protectedMethods.includes(method)) {
            req.skipAuth = true
            next();
            return;
        }

        req.protectedMethod = true;
        next()
    }
}