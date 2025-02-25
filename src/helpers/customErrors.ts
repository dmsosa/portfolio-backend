import { NextFunction, Request, Response } from "express";

class CustomError extends Error {
    status: number;
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        this.status = 500;
    }
}
interface ErrorResponse {
    errors: {
        status: number,
        message: string,
        error: CustomError,
    }
}
export class NotFoundError extends CustomError {
    constructor(entity: string, message: string="") {
        super(`${entity} not found ${message}`)
        this.status = 404;
    }
} 

export class AlreadyExistsError extends CustomError {
    constructor(entity: string, message: string="") {
        super(`${entity} already exists with ${message}`)
        this.status = 409;

    }
} 
export class FieldError extends CustomError {
    constructor(entity: string, message: string="") {
        super(`Field error for ${entity}:  ${message}`)
        this.status = 422;
    }
} 
export function handleErrorProduction(err: CustomError, req: Request, res: Response, next: NextFunction): void {
    res.status(err.status);
    res.json({
        errors: {
            status: err.status,
            message: err.message,
            error: err,
        }
    } as ErrorResponse);
    next(err);
}
export function handleErrorDevelopment(err: CustomError, req: Request, res: Response, next: NextFunction): void {
   
    console.error(err?.stack);
    console.log(err, typeof err);
    
    res.status(err.status ?? 500);
    res.json({
        errors: {
            status: err.status,
            message: err.message,
            error: err,
        }
    } as ErrorResponse);
    next(err);

}