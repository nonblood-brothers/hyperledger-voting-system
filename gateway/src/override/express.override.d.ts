declare module Express {
    export interface Request {
        skipAuth?: boolean
        username?: string
    }
}