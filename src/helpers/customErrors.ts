import { NextFunction, Request, Response } from "express";

export class CustomError extends Error {
    status: number;
    cause: string;
    constructor(message: string, status: number = 500, name: string = "CustomError") {
        super(message);
        this.cause = message;
        this.name = name;
        this.status = status;
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
            status: err.status,
            message: err.message,
            cause: err.cause,
            error: err,
    });
    next(err);
}
export function handleErrorDevelopment(err: CustomError, req: Request, res: Response, next: NextFunction): void {
   
    console.error(err?.stack);
    console.log(err, typeof err);
    
    res.status(err.status ?? 500);
    res.json({
            status: err.status,
            message: err.message,
            cause: err.cause,
            error: err,
    });
    next(err);
}