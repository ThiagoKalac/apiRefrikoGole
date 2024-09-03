import { Request, Response } from "express";
import { infoProdutoService } from "../../services/produto/infoProduto.service";


const infoProdutoController = async (req:Request, res:Response) =>{
    const codigo:string = req.params.codigo;
    const idUsuario:string = req.usuario.id;
    const produto = await infoProdutoService(+codigo, idUsuario);
    return res.status(200).json(produto)
}

export {infoProdutoController};