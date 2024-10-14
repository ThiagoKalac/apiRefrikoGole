import { NextFunction, Request, Response } from "express";
import "dotenv/config";

const validarTokenFixoMiddleware = async (req: Request, res:Response, next:NextFunction) => {
    
    let token = req.headers.authorization;

    if(!token){
        return res.status(403).json({
            mensagem: "Necessário um token de acesso"
        })
    }

    if(token !== `Bearer ${process.env.TOKEN_SECR_FIX}`){
        return res.status(403).json({ mensagem: 'Token inválido' });
    }

    next()
}

export {validarTokenFixoMiddleware}; 