declare module Express {
    export interface Request {
        skipAuth?: boolean
        protectedMethod?: boolean
        username?: string
    }
}