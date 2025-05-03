import { Request, Response, NextFunction, RequestHandler } from 'express'

export function getAuthMiddleware(jwtKey: string): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    }
}