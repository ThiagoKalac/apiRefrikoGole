import { NextFunction, Request, Response } from "express";


const validarControleAcessoMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    const idRequest:string = req.params.id
    const {admin, id} = req.usuario 

    if(idRequest !== id){
        if(admin){
            return next()
        }
        res.status(403).json({mensagem: "Apenas Administradores podem alterar dados de outros usuários"})
    }

    return next()
}

export {validarControleAcessoMiddleware};