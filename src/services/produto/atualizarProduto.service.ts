import { DataSupabase } from "../../data-source";
import { AppError } from "../../error/appError";
import { tipoLog } from "../../interface/log.interface";
import { IProdutoAtualizar, IProdutoRespFormatada } from "../../interface/produto.interface";
import { Logging } from "../../log/loggin";
import { ProdutoServico} from "../../utils/buscarProdutoSaib"

const atualizarProdutoService = async (codigo:number, dadosAtualizar:IProdutoAtualizar, idUsuario:string):Promise<void> => {
    try {
        const {nome, teor_alcoolico, rotulo, pais_fabricacao, urlFoto} = dadosAtualizar;
        const produtoSaib:IProdutoRespFormatada = await ProdutoServico.buscarProduto(codigo);
        const nomeFormatado = nome ? ProdutoServico.formatarNome(nome) : produtoSaib.nome;
        const {empresas, ...produto} = produtoSaib;
        produto.nome = nomeFormatado;

        const {error:AtualizaçãoProduto} = await DataSupabase
            .from('produto')
            .update({
                pr_descricao: produto.nome,
                pr_categoria: produto.id_categoria,
                pr_qtd_por_cx: produto.fd_cx,
                pr_litragem: produto.litragem,
                pr_pais_fabricacao: pais_fabricacao,
                pr_teor_alcoolico: teor_alcoolico,
                pr_rotulo: rotulo,
                pr_sub_categoria: produto.sub_categoria,
                pr_foto: urlFoto
            })
            .eq('pr_cod', codigo)

        if(AtualizaçãoProduto){
            throw new AppError(`Erro ao atualizar produto: ${AtualizaçãoProduto.message} | Contate o suporte!`, 500);
        }

        for(const empresa of empresas){
            const {data: combinacaoExistente, error: erroBusca} = await DataSupabase
                .from('produto_empresa')
                .select('*')
                .eq('produto_id', codigo)
                .eq('empresa_id', empresa.cod_emp)
                .maybeSingle()
        
                if(erroBusca){
                    throw new AppError(`Erro ao buscar empresa para atualização: ${erroBusca.message} | Contate o suporte!`, 500);
                }
        
                if(combinacaoExistente){
                    const { error: erroAtualizacao } = await DataSupabase
                    .from('produto_empresa')
                    .update({
                        pr_ativo: empresa.data_valida,
                        pr_valor: empresa.valor
                    })
                    .eq('produto_id', codigo)
                    .eq('empresa_id', empresa.cod_emp);
        
                    if (erroAtualizacao) {
                        throw new AppError(`Erro ao atualizar produto_empresa: ${erroAtualizacao.message} | Contate o suporte!`, 500);
                    }
                }else{
                    const { error: erroInsercao } = await DataSupabase
                    .from('produto_empresa')
                    .insert({
                        produto_id: codigo,
                        empresa_id: empresa.cod_emp,
                        pr_ativo: empresa.data_valida,
                        pr_valor: empresa.valor,
                        pr_promocao: false,
                        pr_valor_promocao: 0,
                        pr_descont_porcent: 0
                    });
        
                    if (erroInsercao) {
                        throw new AppError(`Erro ao inserir novo produto_empresa: ${erroInsercao.message} | Contate o suporte!`, 500);
                    }
                }
        }

         // Log de sucesso
        Logging.registrarLog({
            mensagem: `Produto com código ${codigo} atualizado com sucesso`,
            stack_trace: null,
            usuario: idUsuario,
            stack: 'back-end',
            dados_adicionais: `Produto atualizado: ${produto.nome}`,
            tipo_log: tipoLog.INFO
        });

    } catch (error) {
        Logging.registrarLog({
            mensagem: `Erro ao atualizar produto com código ${codigo}`,
            stack_trace: Logging.formatarObjStackTraceErro(error),
            usuario: idUsuario,
            stack: 'back-end',
            dados_adicionais: `Dados para atualização: ${JSON.stringify(dadosAtualizar)}`,
            tipo_log: tipoLog.CRITICO
        });

        console.log(error);
        throw new AppError(`Erro ao atualizar produto: ${error.message}`, 500);
    }
   
    


   
}

export {atualizarProdutoService}