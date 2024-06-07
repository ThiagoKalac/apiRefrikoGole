import { Request, Response } from "express"
import { ILogin, IAutorizacaoResponse } from "../../interface/sessao.interface"
import { loginService } from "../../services/sessao/login.service"


const loginController = async(req:Request, res:Response) => {
    const dadosLogin:ILogin = req.body ;
    const sessaoIniciada:IAutorizacaoResponse = await loginService(dadosLogin);
    return res.status(200).json(sessaoIniciada);
}

export {loginController}