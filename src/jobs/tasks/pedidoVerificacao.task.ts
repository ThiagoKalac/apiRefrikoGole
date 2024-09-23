import cron, { ScheduledTask } from "node-cron";
import { Logging } from "../../log/loggin";
import { ILog, tipoLog } from "../../interface/log.interface";
import { AppError } from "../../error/appError";
import { DataLiquidaApp, DataSourceOracle, DataSupabase } from "../../data-source";
import { enumStatusPedidoSupabase, IPedidosSupabase, IProdutosSituacaoSaib, ISituacaoPedidoSaib } from "../../interface/pedido.interface";
import { Mensageiro } from "../../utils/enviarMsgWhatsapp";
import { IProdutosNaoAtendidosDetalhes, TipoMensagemEnum } from "../../interface/mensageiro.interface";
import { FormatadorDeData } from "../../utils/formatadorDeData";


class PedidoVerificacao {
    private dia:number;
    private codEmpresa:number;
    private cronTask: ScheduledTask | null = null;

    constructor(dia:number, codEmpresa:number){
        this.dia = dia;
        this.codEmpresa = codEmpresa;
    }

    private async buscarPedidosEmProcessamentoSupabase():Promise<IPedidosSupabase[]>{
        const {data, error} = await DataSupabase
            .from('pedidos')
            .select(`
                *,
                usuario!inner (
                    nome,
                    sobrenome,
                    cod_empresa,
                    whatsapp,
                    credito
                ),
                pedido_produtos(
                    *,
                    produto(
                        pr_cod,
                        pr_descricao
                    )
                )
            `)
            .eq('ped_status', enumStatusPedidoSupabase.PROCESSAMENTO)
            .eq('usuario.cod_empresa', this.codEmpresa);
    
        const pedidos = data as IPedidosSupabase[];
        
        if(error){
            throw new AppError('Linha 42| Classe PedidoVerificacao buscarPedidosEmProcessamentoSupabase: ' + error.message);
        }

        return pedidos;
    
    }

    async verificarSituacaoDePedidosSaib(listaPedidos:IPedidosSupabase[]):Promise<{
        pedidosAtendidos:IPedidosSupabase[],
        pedidosNaoAtendidos:IPedidosSupabase[],
        liquidacao: number 
    }>{
        // esse método irá iterar sobre a lista de pedidos que foi pegada no supabase
        // e irá fazer requisições no oracle(saib) para saber se o pedido foi atendido (faturado)
        // se a situação for 1 = Faturado, 0 = Não foi faturado
        // por fim retorna as listas.
        let pedidosAtendidos:IPedidosSupabase[] = []
        let pedidosNaoAtendidos:IPedidosSupabase[] = []
       
    
        for(let pedido of listaPedidos){
            const pedidoSaib:ISituacaoPedidoSaib = await DataSourceOracle
                .createQueryBuilder()
                .select([`
                    PC.PEDC_NR_PEDIDO AS PED_COLETOR,
                    PC.PEDC_CLI_ID AS COD_CLIENTE,
                    PC.PEDC_CLI_EMP_ID AS COD_EMP_CLIENTE,
                    PC.PEDC_SITUACAO AS SITUACAO,
                    PC.PEDC_PEDF_ID AS PED_NOTA,
                    PF.PEDF_LIQU_ID AS LIQUIDACAO,
                    PF.PEDF_ID AS NUMERO_PED_FAT
                `])
                .from('PEDIDO_COL', 'PC')
                .innerJoin('PEDIDO_FAT', 'PF', 'PF.PEDF_EMP_ID = PC.PEDC_PEDF_EMP_ID AND PF.PEDF_ID = PEDC_PEDF_ID')
                .where('PC.PEDC_NR_PEDIDO = :numeroPedido', {numeroPedido: pedido.numero_pedido_saib})
                .andWhere('PC.PEDC_CLI_ID = :codCliente', {codCliente: pedido.ped_usr_cod_saib})
                .andWhere('PC.PEDC_CLI_EMP_ID = :codEmpresa', {codEmpresa: pedido.usuario.cod_empresa})
                .getRawOne()
            

            if(pedidoSaib.SITUACAO == 1){
                pedido.liquidacao_id = pedidoSaib.LIQUIDACAO
                pedido.pedido_fat_saib = pedidoSaib.NUMERO_PED_FAT
                pedidosAtendidos.push(pedido)
            }else{
                pedidosNaoAtendidos.push(pedido)
            }

        }
        const liquidacao = pedidosAtendidos[0].liquidacao_id;

        return {pedidosAtendidos, pedidosNaoAtendidos, liquidacao}
    }

    private async tratativaPedidosNaoAtendidos(listaPedidos:IPedidosSupabase[]):Promise<void>{
       // Os pedidos que não foram atendidos, precisam ser cancelados no app 
       // E avisar(notificar) o usuario

       // para eventuais loggins futuros lista para inserção
       let listaPedidosParaCriarLoggins: ILog[] = [];

       try{

           for(const pedido of listaPedidos){
               // atualizando a o pedido para cancelado
               const {error} = await DataSupabase
                   .from('pedidos')
                   .update({
                       ped_status: enumStatusPedidoSupabase.CANCELADO,
                       observacao: `Pedido não pode ser atendido, verificar na recepção o motivo do não atendimento. Número do pedido app: ${pedido.id} | coletor saib: ${pedido.numero_pedido_saib} | pedido saib: ${pedido.pedido_fat_saib}` 
                   })
                   .eq('id', pedido.id)
                   .eq('id_usuario', pedido.id_usuario)
   
               if(error){
                   throw new AppError("Erro na classe PedidoVerificação, método tratativaPedidosNaoAtendido, cancelamento do pedido no supabase",500)
               }
   
               // o valor do pedido que foi cancelado volta como crédito ao usuario
               // soma-se o valor que ele tem em crédito no momento mais o valor do pedido cancelado
               // em seguida atualiza o credito dele na tabela usuario.
          
               const novoCredito = pedido.ped_valor_total + pedido.usuario.credito
               
               const {error: creditoUsuarioError} = await DataSupabase
                   .from('usuario')
                   .update({credito: novoCredito})
                   .eq('id',pedido.id_usuario)
               
               if(creditoUsuarioError){
                    throw new AppError(
                        "Erro na classe PedidoVerificação, método tratativaPedidosNaoAtendido, atualização do credito supabase"
                        ,500
                    );
               }
               
               // depois de cancelar o pedido no supabase e voltar o credito do usuario
               // é enviando uma mensagem/notificação para o usuario

               const nomeUsuario = pedido.usuario.nome.charAt(0).toUpperCase()+pedido.usuario.nome.substring(1)
               const sobrenomeUsuario = pedido.usuario.sobrenome.split(" ")[0].charAt(0).toUpperCase() + pedido.usuario.sobrenome.substring(1)
               const usuario = `${nomeUsuario} ${sobrenomeUsuario}`
   
               const mensageiro = new Mensageiro(usuario, pedido.usuario.whatsapp, null, null, pedido.id)
               await mensageiro.enviar(TipoMensagemEnum.PEDIDO_NAO_ATENDIDO) 
               
               listaPedidosParaCriarLoggins.push({
                    mensagem: `Pedido não atendido do: ${pedido.ped_usr_cod_saib} - ${pedido.usuario.nome} ${pedido.usuario.sobrenome}`,
                    stack_trace: null,
                    usuario: null,
                    stack: 'back-end',
                    dados_adicionais: `Pedido app: ${pedido.id}, pedido saib: ${pedido.numero_pedido_saib}, pedido_fat: ${pedido.pedido_fat_saib} e quantidade de produtos ${pedido.ped_qtd_itens}`,
                    tipo_log: tipoLog.INFO
               })

            }

            Logging.registrarLog({
                mensagem: 'realizada a tratativa de pedidos não atendidos',
                stack_trace: null,
                usuario: null,
                stack: 'back-end',
                dados_adicionais: `Total de pedidos não faturados: ${listaPedidos.length}, no dia ${FormatadorDeData.formatarData(new Date, 'dd/mm/aaaa')}`,
                tipo_log: tipoLog.INFO
            });

            Logging.registrarLog(listaPedidosParaCriarLoggins);

       }catch(error){
          console.log(error);
       
            // Log de erro
            Logging.registrarLog({
                mensagem: 'Erro na tratativa Pedidos nao Atendidos', 
                stack_trace: Logging.formatarObjStackTraceErro(error),
                usuario: null,
                stack: 'back-end',
                dados_adicionais: null,
                tipo_log: tipoLog.ERRO
            });

            throw new AppError("Erro na classe PedidoVerificação, método tratativaPedidosNaoAtendidos",500)
       }

    }

    private async tratativaPedidosAtendidos (listaPedidos:IPedidosSupabase[]){
        // para os pedidos atendidos, precisa verificar se todos os produtos solicitados pelo usuarios
        // foram faturados e não teve nenhum curte.
        
        let listaPedidosAtendidosLoggins: ILog[] = [];
        let listaPedidosAtendidosParcialLoggins: ILog[] = [];

       try {
        
        for(const pedido of listaPedidos){
            
            const listaProdutosSaib:IProdutosSituacaoSaib[] = await this.verficarProdutosFaturadosSaib(pedido.numero_pedido_saib, pedido.usuario.cod_empresa)
            
            const quantidadeDeProdutosDoPedido = pedido.ped_qtd_itens; 
            const produtosAtendidos = listaProdutosSaib.filter(produto => produto.SITUACAO === 1);
            
          
            if(produtosAtendidos.length === quantidadeDeProdutosDoPedido){
                await this.pedidoAtendido(pedido)

                listaPedidosAtendidosLoggins.push({
                    mensagem: `Pedido atendido do: ${pedido.ped_usr_cod_saib} - ${pedido.usuario.nome} ${pedido.usuario.sobrenome}`,
                    stack_trace: null,
                    usuario: null,
                    stack: 'back-end',
                    dados_adicionais: `Pedido app: ${pedido.id}, pedido saib: ${pedido.numero_pedido_saib}, pedido_fat: ${pedido.pedido_fat_saib} e quantidade de produtos ${pedido.ped_qtd_itens}`,
                    tipo_log: tipoLog.INFO
                })
            }else{
                const produtosNaoAtendidos = listaProdutosSaib.filter(produto => produto.SITUACAO !== 1);
                await this.pedidoAtendidoParcial(produtosNaoAtendidos, pedido)
                
                listaPedidosAtendidosParcialLoggins.push({
                    mensagem: `Pedido atendido parcial: ${pedido.ped_usr_cod_saib} - ${pedido.usuario.nome} ${pedido.usuario.sobrenome}`,
                    stack_trace: null,
                    usuario: null,
                    stack: 'back-end',
                    dados_adicionais: `Pedido app: ${pedido.id}, pedido saib: ${pedido.numero_pedido_saib}, pedido_fat: ${pedido.pedido_fat_saib} e quantidade de produtos ${pedido.ped_qtd_itens}`,
                    tipo_log: tipoLog.INFO
                })
            }
        }

        if(listaPedidosAtendidosLoggins.length > 0){
            await Logging.registrarLog(listaPedidosAtendidosLoggins);
        }

        if(listaPedidosAtendidosParcialLoggins.length > 0){
           await Logging.registrarLog(listaPedidosAtendidosParcialLoggins)
        }

       } catch (error) {
            console.log(error)
            // Log de erro
           await Logging.registrarLog({
                mensagem: 'Erro na tratativa Pedidos Atendidos', 
                stack_trace: Logging.formatarObjStackTraceErro(error),
                usuario: null,
                stack: 'back-end',
                dados_adicionais: null,
                tipo_log: tipoLog.ERRO
            });

            throw new AppError("Erro na classe PedidoVerificação, método tratativaPedidosAtendidos",500)
       }
        
    }

    private async verficarProdutosFaturadosSaib(numeroPedidoSaib:number, codEmp:number):Promise<IProdutosSituacaoSaib[]>{
        const produtos:IProdutosSituacaoSaib[] = await DataSourceOracle
            .createQueryBuilder()
            .select([`
                PCP.PEDC_PEDC_NR_PEDIDO AS PEDIDO_COLETOR,
                PCP.PEDC_PROD_EMP_ID AS COD_EMP,
                PCP.PEDC_PROD_ID AS COD_PRODUTO,
                PCP.PEDC_SITUACAO AS SITUACAO ,
                PCP.PEDC_VLR_UNIT AS VALOR_UN
            `])
            .from('PEDIDO_COL_P', 'PCP')
            .where('PCP.PEDC_PEDC_EMP_ID = :codEmp',{codEmp})
            .andWhere('PCP.PEDC_PEDC_NR_PEDIDO = :numeroPedido', {numeroPedido: numeroPedidoSaib})
            .getRawMany()

        return produtos;
    }   

    private async pedidoAtendido(pedido:IPedidosSupabase):Promise<void>{
        const {error} = await DataSupabase
                .from('pedidos')
                .update({
                    ped_status: enumStatusPedidoSupabase.FATURADO,
                    liquidacao_id: pedido.liquidacao_id,
                    pedido_fat_saib: pedido.pedido_fat_saib
                })
                .eq('id', pedido.id)
                .eq('id_usuario', pedido.id_usuario)

        if(error){
            throw new AppError(
                "Erro na classe PedidoVerificação, método pedidoAtendido, atualização do pedido atendido supabase"
                ,500
            );
        }
    }

    private async pedidoAtendidoParcial(listaProdutoNaoAtendido:IProdutosSituacaoSaib[], pedido:IPedidosSupabase):Promise<void>{
        
        const valorASerCreditado = listaProdutoNaoAtendido.reduce((acc, valor) => acc + valor.VALOR_UN , 0)
        const novoCredito = valorASerCreditado + pedido.usuario.credito;
        const novoValorPedido = pedido.ped_valor_total - valorASerCreditado;
        const listaProdutosNaoAtendidosDetalhes: IProdutosNaoAtendidosDetalhes[] = [];

        for (const pedido_produto of pedido.pedido_produtos){
            const produtoNaoAtendido = listaProdutoNaoAtendido.find(prod => prod.COD_PRODUTO === pedido_produto.id_produto);
        
            if(produtoNaoAtendido){ 
                const {error: erroAtualarPedidoProdutos} = await DataSupabase
                    .from('pedido_produtos')
                    .update({
                        atendido: false,
                        motivo_nao_atendimento: 'Produto sem estoque'
                    })
                    .eq('id', pedido_produto.id)

                if(erroAtualarPedidoProdutos){
                    throw new AppError('Erro au atualizar a tabela pedido_produtos, classe pedido verificacao', 500)
                }

                listaProdutosNaoAtendidosDetalhes.push({cod_produto: pedido_produto.id_produto, nome: pedido_produto.produto.pr_descricao})
            }   
        }

        const {error: erroAtualizarCreditoUsuario} = await DataSupabase
            .from('usuario')
            .update({credito: novoCredito})
            .eq('id', pedido.id_usuario)

        if(erroAtualizarCreditoUsuario){
            throw new AppError('Erro au atualizar a tabela usuario, credito usuario, classe pedido verificacao, método pedidoAtendidoParcial', 500)
        }
        
        const {error: errorAtualizarPedido} = await DataSupabase
            .from('pedidos')
            .update({
                ped_status: enumStatusPedidoSupabase.FATURADO,
                ped_valor_total: novoValorPedido,
                observacao: 'Pedido atendido parcialmente',
                liquidacao_id: pedido.liquidacao_id,
                pedido_fat_saib: pedido.pedido_fat_saib
            })
            .eq('id', pedido.id)
        
        if(errorAtualizarPedido){
            throw new AppError('Erro au atualizar a tabela pedido, classe pedido verificacao, método pedidoAtendidoParcial', 500)
        }

        const nomeUsuario = pedido.usuario.nome.charAt(0).toUpperCase()+pedido.usuario.nome.substring(1)
        const sobrenomeUsuario = pedido.usuario.sobrenome.split(" ")[0].charAt(0).toUpperCase() + pedido.usuario.sobrenome.substring(1)
        const usuario = `${nomeUsuario} ${sobrenomeUsuario}`

        // Construindo a lista de produtos cortados diretamente
        
        
        const mensageiro = new Mensageiro(usuario, pedido.usuario.whatsapp, null, listaProdutosNaoAtendidosDetalhes, pedido.id)
        await mensageiro.enviar(TipoMensagemEnum.PEDIDO_PARCIAL) 
        
    }

    private async conferirLiquidacaoSeparada(liquidacao:number){
        // esse método vai ser para verificar no app da liquidacao, se a liquidacao dos funcionarios já foi separada
        // como o app ainda não está em total funcionamento, vou deixar a logica pronta
        // porém, nesse momento sempre vai alterar o status do pedido para separado, depois precisa retirar
        // como é automatizado esse processo, a logica é fazer a verificação 3 vezes, enquanto o status nao muda.
            
        // quando o projeto liquidacao, tiver rodando certinho, apagar tudo que tiver com comentario //liquidaApp        
        let contador = 0 //liquidaApp
        const taskLiquidacao:ScheduledTask = cron.schedule(`0 8,10,14 ${this.dia} * *`,
            async () => {
                const {data, error} = await DataLiquidaApp
                    .from('liquidacao')
                    .select('liqu_id, status_liq_id')
                    .eq('liqu_id', liquidacao)
                    .eq('liqu_emp', this.codEmpresa)
                    .maybeSingle()
            
                if(error){
                    throw new AppError('Erro ao tentar obter informações do app de liquidacao', 500)
                }   

                if(data.status_liq_id === 3){
                    const {error:atualizacaoPedidosErro} = await DataSupabase
                        .from('pedidos')
                        .update({
                            ped_status: "Em separação"
                        })
                        .eq('liquidacao_id', liquidacao)
    
                    if(atualizacaoPedidosErro){
                        throw new AppError('Erro ao tentar atualizar o status dos pedidos, método conferirLiquidacaoSeparada', 500)
                    }

                    taskLiquidacao.stop()
                }else{
                    Logging.registrarLog({
                        mensagem: 'Verificaçao da separação da liquidação',
                        stack_trace: null,
                        usuario: null,
                        stack: 'back-end',
                        dados_adicionais: `Liquidação: ${liquidacao} não separada ainda`,
                        tipo_log: tipoLog.ERRO
                    });

                    contador++ //liquidaApp
                }

                if(contador === 3){ //liquidaApp
                    const {error:atualizacaoPedidosErro} = await DataSupabase
                        .from('pedidos')
                        .update({
                            ped_status: "Em separação"
                        })
                        .eq('liquidacao_id', liquidacao)
    
                    if(atualizacaoPedidosErro){
                        throw new AppError('Erro ao tentar atualizar o status dos pedidos, método conferirLiquidacaoSeparada', 500)
                    }

                    taskLiquidacao.stop()
                }

            }, {
                scheduled: true,
                timezone: "America/Sao_Paulo"
            });
          
        
    }

    async executar(){
        try {
            const listaDePedidosSupabase:IPedidosSupabase[] = await this.buscarPedidosEmProcessamentoSupabase();
            const {pedidosAtendidos, pedidosNaoAtendidos, liquidacao} = await this.verificarSituacaoDePedidosSaib(listaDePedidosSupabase);
       
            if(pedidosAtendidos.length > 0){
                await this.tratativaPedidosAtendidos(pedidosAtendidos);
            }

            if(pedidosNaoAtendidos.length > 0){
                await this.tratativaPedidosNaoAtendidos(pedidosNaoAtendidos);
            }

            this.conferirLiquidacaoSeparada(liquidacao)
            
            Logging.registrarLog({
                mensagem: 'Sucesso na verificação dos pedidos - classe PedidoVerificacao',
                stack_trace: null,
                usuario: null,
                stack: 'back-end',
                dados_adicionais: `Pedidos verificado na empresa ${this.codEmpresa}, liquidacao: ${liquidacao}, pedidos atendido: ${pedidosAtendidos.length}, não atendidos: ${pedidosNaoAtendidos.length}`,
                tipo_log: tipoLog.ERRO
            });
        } catch (error) {
            console.log(error);
            //log de erro
            Logging.registrarLog({
                mensagem: 'Erro ao executar verificação de pedidos - classe PedidoVerificacao',
                stack_trace: Logging.formatarObjStackTraceErro(error),
                usuario: null,
                stack: 'back-end',
                dados_adicionais: `Erro na empresa ${this.codEmpresa}`,
                tipo_log: tipoLog.ERRO
            });

            throw new AppError(`Erro ao executar a verificação de pedidos: ${error.message}`, 500);
        }
    }

    agendar(){

        if(this.cronTask){
            this.cronTask.stop()
        }
        // agendado para o proximo dia depois do faturamento as 6h 
        this.cronTask = cron.schedule(`0 6 ${this.dia} * *`, async () => {
             await this.executar()    
        }, {
            scheduled: true,
            timezone: "America/Sao_Paulo"
        });
    }



}



export {PedidoVerificacao};