import { Request, Response, NextFunction } from 'express'

export async function getAuthMiddleware(jwtKey: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    }
}