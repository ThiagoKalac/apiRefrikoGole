import { Response, Request } from "express";

const validarCpfController = async (req:Request, res:Response) => {
    const cpf = req.body.cpf
    console.log(cpf)
    return res.status(200).json('chegou no controller')
}

export {validarCpfController};