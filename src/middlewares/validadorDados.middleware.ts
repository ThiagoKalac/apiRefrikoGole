import { NextFunction, Request, Response } from "express";
import { AnySchema } from "yup";

const validadorDadosMiddleware = (schema: AnySchema) =>async (req:Request, res: Response, next:NextFunction) => {
    try{
        const validado = await schema.validate(req.body, {
            stripUnknown: true,
            abortEarly: false
        })
        
        req.body = validado
        return next()

    }catch (error){
        return res.status(400).json({
            message: error.errors
        })
    }
}

export {validadorDadosMiddleware}