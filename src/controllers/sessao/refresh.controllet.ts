import { Request, Response } from "express";
import { refreshService } from "../../services/sessao/refresh.service";
import { IAutorizacaoResponse } from "../../interface/sessao.interface";


const refreshController = async (req:Request, res:Response) => {
    const token:string = req.headers.authorization;
    const novoToken:IAutorizacaoResponse = await refreshService(token);
    res.status(200).json(novoToken);
}

export {refreshController};