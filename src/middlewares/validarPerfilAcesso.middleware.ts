import { NextFunction, Request, Response } from "express";


const validarPerfilAcessoMiddleware = (perfisPermitidos: string[]) => async (req:Request, res:Response, next:NextFunction) => {
    const {admin , perfil} = req.usuario;


    if (admin || perfisPermitidos.includes(perfil)) {
        return next();
    }else {
        return res.status(403).json({ mensagem: 'Acesso negado: permissão insuficiente.' });
    }

    
}

export {validarPerfilAcessoMiddleware};