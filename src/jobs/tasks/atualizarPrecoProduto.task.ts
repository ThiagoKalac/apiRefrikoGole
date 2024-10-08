import cron from 'node-cron';
import { DataSupabase } from '../../data-source';
import { Logging } from '../../log/loggin';
import { tipoLog } from '../../interface/log.interface';
import { ProdutoServico } from '../../utils/buscarProdutoSaib';

class AtualizarPrecoProduto {
    
    private static async  executar(){
        let produtoAtual = null;

        try {
            const {data:listaProdutosParaAtualizar, error: listaProdutoErro} = await DataSupabase
                .from('produto')
                .select('pr_cod, pr_descricao')
            
                if(listaProdutoErro){
                    throw listaProdutoErro
                }

            for(const produto of listaProdutosParaAtualizar){
                produtoAtual = produto;
                // produto atualizado
                const produtoDetalhes  = await ProdutoServico.buscarProduto(produto.pr_cod)

                let empresasAtualizadas = []; // Armazena as empresas atualizadas


                for(const empresaProduto  of produtoDetalhes.empresas){
                    const {error} = await DataSupabase
                        .from('produto_empresa')
                        .update({
                            pr_valor: empresaProduto .valor
                        })
                        .eq('produto_id', produto.pr_cod)
                        .eq('empresa_id', empresaProduto .cod_emp)

                    if(error){
                        throw error;
                    }

                    empresasAtualizadas.push({
                        empresa_id: empresaProduto.cod_emp,
                        nome: empresaProduto.nome,
                        valor: empresaProduto.valor
                    });
                }

                   // Log de sucesso após todas as empresas do produto serem atualizadas
                   Logging.registrarLog({
                    mensagem: `Atualização de preço realizada com sucesso`,
                    stack: 'back-end',
                    tipo_log: tipoLog.INFO,
                    usuario: null,
                    stack_trace: null,
                    dados_adicionais: `Produto ID: ${produto.pr_cod}, nome: ${produtoAtual.pr_descricao}, empresas atualizadas: ${JSON.stringify(empresasAtualizadas)}`
                });
            
            }

        } catch (error) {
            Logging.registrarLog({
                mensagem: 'Erro na cron job de atualizar o valor dos produtos',
                stack: 'back-end',
                tipo_log: tipoLog.CRITICO,
                usuario: null,
                stack_trace: Logging.formatarObjStackTraceErro(error),
                dados_adicionais: produtoAtual 
                    ? `Erro ao atualizar o produto ID: ${produtoAtual.pr_cod}, nome: ${produtoAtual.nome}. Erro: ${error.message}`
                    : `Erro geral: ${error.message}`
            })
        }
    }
    
    static agendar(){
        // agendado para executar todos os dias à 00:00, 8:00, 12:00 e 15:00. '0,8,12,15 '
      cron.schedule('0 0,12 * * *', async () => {
         await this.executar()    
      }, {
          scheduled: true,
          timezone: "America/Sao_Paulo"
      });
  }
}

export {AtualizarPrecoProduto};