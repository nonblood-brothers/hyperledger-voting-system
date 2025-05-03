import { NextFunction, Request, RequestHandler, Response } from 'express';

export const asyncWrapHandler = (handler: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const fnReturn = handler(req, res, next)
        try {
            await fnReturn;
            return;
        } catch (err) {
            next(err);
        }
    }
}