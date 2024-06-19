import { NextFunction, Request, Response } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import "dotenv/config";

const validarTokenMiddleware = async (req: Request, res:Response, next:NextFunction) => {
    
    let token = req.headers.authorization;

    if(!token){
        return res.status(403).json({
            message: "Necessário um token de acesso"
        })
    }

    token = token.split(" ")[1];
    
    jwt.verify(token, process.env.SECRET_KEY, async (error:VerifyErrors | null, decode: any) => {
        if(error){
            if(error.name === "TokenExpiredError"){
                res.status(401).json({ message: 'Token Expirado' });
            }else {
                res.status(403).json({ message: 'Token invalido' });
            }
        }else{
            req.usuario = {
                id: decode.sub,
                admin: decode.admin
            }
           
            return next()
        }
    })
}

export {validarTokenMiddleware}; 