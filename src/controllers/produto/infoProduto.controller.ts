import { Request, Response } from "express";
import { infoProdutoService } from "../../services/produto/infoProduto.service";


const infoProdutoController = async (req:Request, res:Response) =>{
    const codigo:string = req.params.codigo;
    const produto = await infoProdutoService(+codigo);
    return res.status(200).json(produto)
}

export {infoProdutoController};