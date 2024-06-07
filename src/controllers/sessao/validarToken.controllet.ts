import { Request, Response } from "express";

const validarTokenController = async (req:Request, res:Response) => {
    return res.status(200).json({mensagem: 'token valido'});
}

export {validarTokenController};