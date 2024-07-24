import { IProdutoRespFormatada } from "../../interface/produto.interface";
import { ProdutoServico } from "../../utils/buscarProdutoSaib";


const infoProdutoService = async (codigo:number):Promise<IProdutoRespFormatada> => {
    const produtoSaib:IProdutoRespFormatada = await ProdutoServico.buscarProduto(codigo);
    
    return produtoSaib;
}

export {infoProdutoService};








