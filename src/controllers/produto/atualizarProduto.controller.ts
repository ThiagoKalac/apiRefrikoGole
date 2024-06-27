import { Request, Response } from "express"
import { atualizarProdutoService } from "../../services/produto/atualizarProduto.service";
import { IProdutoAtualizar } from "../../interface/produto.interface";


const atualizarProdutoController = async (req: Request, res: Response) => {
    const codigo:string = req.params.codigo;
    const dadosAtualizar:IProdutoAtualizar = req.body;
    await atualizarProdutoService(+codigo, dadosAtualizar);
    return res.status(200).json({mensagem: 'Produto Atualizado com sucesso'})
}

export {atualizarProdutoController}