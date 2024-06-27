import { NextFunction, Request, Response } from "express";


const validarAdminMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    const {admin} = req.usuario 

   
    if(!admin){
        res.status(403).json({mensagem: "Rota apenas para admins"})
    }
    
    return next()
    
}

export {validarAdminMiddleware};