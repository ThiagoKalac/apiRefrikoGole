import { AppError } from "../../error/appError";
import { tipoLog } from "../../interface/log.interface";
import { IProdutoRespFormatada } from "../../interface/produto.interface";
import { Logging } from "../../log/loggin";
import { ProdutoServico } from "../../utils/buscarProdutoSaib";


const infoProdutoService = async (codigo:number, idUsuario:string):Promise<IProdutoRespFormatada> => {
    try {
        const produtoSaib:IProdutoRespFormatada = await ProdutoServico.buscarProduto(codigo);
        
         // Log de sucesso
         Logging.registrarLog({
            mensagem: `Informações do produto com código ${codigo} obtidas com sucesso`,
            stack_trace: null,
            usuario: idUsuario,
            stack: 'back-end',
            dados_adicionais: `Produto: ${produtoSaib.nome}`,
            tipo_log: tipoLog.INFO
        });

        return produtoSaib;
    } catch (error) {
        console.log(error);
        //log de erro
        Logging.registrarLog({
            mensagem: `Erro ao buscar informações do produto com código ${codigo}`,
            stack_trace: Logging.formatarObjStackTraceErro(error),
            usuario: idUsuario,
            stack: 'back-end',
            dados_adicionais: null,
            tipo_log: tipoLog.CRITICO
        });

        throw new AppError(`Erro ao buscar informações do produto: ${error.message}`, 500);
    }
}

export {infoProdutoService};








