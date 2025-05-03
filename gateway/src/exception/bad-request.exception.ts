import { HttpException } from './http.exception'

export class BadRequestException extends HttpException {
    public statusCode = 400;
}