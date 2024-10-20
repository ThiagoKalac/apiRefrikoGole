import { QueryRunner } from "typeorm";
import { DataSourceOracle, DataSupabase } from "../../data-source";
import { AppError } from "../../error/appError";
import { ICriarPedidoRequest, IPedidoCriado, IPedidosSupabase, IRetornoPedidoCriado } from "../../interface/pedido.interface";
import { FormatadorDeData } from "../../utils/formatadorDeData";
import { ProdutoServico } from "../../utils/buscarProdutoSaib";
import { Logging } from "../../log/loggin";
import { ILog, tipoLog } from "../../interface/log.interface";
import { PedidoVerificacao } from "../../jobs/tasks/pedidoVerificacao.task";

const criarPedidoService = async (dadosPedidos: ICriarPedidoRequest):Promise<IRetornoPedidoCriado> => {
    // desconstrução dos dados para extrair os pedidos do supabase
    const { dataInicio, dataFim, cod_empresa, uuidUsuario } = dadosPedidos;

    // formatando as datas para puxar os pedidos
    const dataSupabaseInicio = FormatadorDeData.converterData(dataInicio, 'supabase', 'inicio');
    const dataFiltroInicio = FormatadorDeData.subtrairUmDia(dataSupabaseInicio.toString())
    const dataFiltroFim = FormatadorDeData.converterData(dataFim, 'supabase', 'fim');
    const dataPedidoOracle = FormatadorDeData.formatarData(new Date(), 'dd/mm/aaaa'); // data atual
    
   
    // quantificar quantos pedidos foram gerados e os pedidos que vão ser criados;
    let quantidadePedidos:number;
    let pedidosCriados: IPedidoCriado[] = [];
    let pedidosParaCriarLoggins: ILog[] = [];

    // fazendo a query no supabase na tabela "pedidos", fazendo inner join nas tabelas "usuario","pedido_produtos" e "produto"
    const { data, error } = await DataSupabase
        .from("pedidos")
        .select(`
            *,
            usuario!inner (
                nome,
                sobrenome,
                cod_empresa
            ),
            pedido_produtos(
                *,
                produto(
                    pr_cod,
                    pr_descricao
                )
            )
        `)
        .eq('ped_status','Pendente')
        .gte('ped_data', dataFiltroInicio)
        .lte('ped_data', dataFiltroFim)
        .eq('usuario.cod_empresa', cod_empresa);

    const pedidos = data as IPedidosSupabase[];
         
    if (error) {
        console.log(error)
        throw new AppError('Erro ao buscar pedidos: ' + error.message);
    }

    quantidadePedidos = pedidos.length;

    if (quantidadePedidos === 0) {
        Logging.registrarLog({
            mensagem: 'Sem pedidos para inserir no SAIB',
            stack_trace: null,
            usuario: uuidUsuario,
            stack: 'back-end',
            dados_adicionais: `Pedidos filtrados na data de ${dataInicio} à data de ${dataFim}`,
            tipo_log: tipoLog.INFO
        });

        throw new AppError('Não tem pedidos para serem gerados no período selecionado', 200);
    }

    // Inserir um novo pedido no oracle
    const queryRunner: QueryRunner = DataSourceOracle.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        //para cada pedido encontrado, irá criar um pedido no saib
        for (const pedido of pedidos) {
            //descontrução das infomrações do pedido
            const { id, ped_data, ped_valor_total, ped_usr_cod_saib, pedido_produtos } = pedido;
            const numeroPedidoSaib = 90000000 + id;
            const dataPedidoConvertida = FormatadorDeData.converterData(ped_data, 'oracle');

            //criando sql de inserção do novo pedido
            const insertPedidoSql = `
                INSERT INTO SAIB2000.PEDIDO_COL(
                    PEDC_GEN_ID, -- CODIGO DA ROTA do funcionario
                    PEDC_GEN_TGEN_ID, -- Rota Generica, deixar 920
                    PEDC_GEN_EMP_ID, -- codigo da empresa
                    PEDC_EMP_ID,  -- codigo da empresa
                    PEDC_DTA_VIS, -- data do pedido
                    PEDC_NR_PEDIDO, -- numero do pedido, numero fixo de 90 Milhões mais o ID gerado no supabase, para gerar um pedido FIXO
                    PEDC_NR_PED_PORTAL, -- numero do pedido, igual da coluna de cima
                    PEDC_GEN_ID_CIDADE_DE, -- cidade do cliente
                    PEDC_GEN_TGEN_ID_CIDADE_DE, -- cod da cidade generica
                    PEDC_GEN_EMP_ID_CIDADE_DE, -- Empresa da cidade, manter 0
                    PEDC_GEN_ID_ZONA_DE, -- manter 1
                    PEDC_GEN_TGEN_ID_ZONA_DE, -- manter 909
                    PEDC_GEN_EMP_ID_ZONA_DE,  -- codigo da empresa que será faturado
                    PEDC_USR_ID, -- usuario que inseriu o pedido (COLOCAR 689 USUARIO APISAIB2000)
                    PEDC_CLI_ID, -- codigo do cliente
                    PEDC_CLI_EMP_ID, -- empresa que o usuario está cadastrado 
                    PEDC_DTA_ENTR, -- DATA DO PEDIDO (COLOCAR SYSDATE PARA PEGAR A DATA DO DIA QUE O PEDIDO ESTA CAINDO NO SISTEMA),
                    PEDC_DTA_COLE_I, -- data que foi gerado o pedido no app
                    PEDC_DTA_COLE_F, -- data que foi gerado o pedido no app
                    PEDC_ESTOQUE, -- Deixar N
                    PEDC_PREFERENCIAL, -- Deixar N
                    PEDC_ALOCACAO, -- Deixar N
                    PEDC_FATURAMENTO, -- Deixar N
                    PEDC_SITUACAO, -- Deixar 0
                    PEDC_DTA_CAD, -- deixar sysdate em string
                    PEDC_DTA_PROG, -- deixar sysdate
                    PEDC_REPO_INI, -- deixar sysdate
                    PEDC_REPO_FIM, -- deixar sysdate
                    PEDC_VLR_PEDIDO, -- valor do pedido
                    PEDC_LIB_ANALISTA, -- deixar S
                    PEDC_VDA_FUT, -- deixar N
                    PEDC_DTA_PED, -- deixar sysdate
                    PEDC_FLG_RETIRA, -- deixar N
                    PEDC_PED_ESPECIAL -- deixar N
                )
                VALUES(
                    ${rotaFuncionario(cod_empresa)}, -- CODIGO DA ROTA do funcionario
                    920,  -- Rota Generica, deixar 920
                    ${cod_empresa}, -- codigo da empresa
                    ${cod_empresa}, -- codigo da empresa
                    TRUNC(SYSDATE), -- data do pedido
                    ${numeroPedidoSaib}, -- numero do pedido, numero fixo de 90 Milhões mais o ID gerado no supabase, para gerar um pedido FIXO
                    ${numeroPedidoSaib}, -- numero do pedido, igual da coluna de cima
                    ${cidadeFuncionario(cod_empresa)}, -- cidade do cliente
                    5001, -- cod da cidade generica 
                    0, -- Empresa da cidade, manter 0
                    1, -- manter 1
                    909, -- manter 909
                    ${cod_empresa}, -- codigo da empresa que será faturado
                    689, -- usuario que inseriu o pedido (COLOCAR 689 USUARIO APISAIB2000)
                    ${ped_usr_cod_saib}, -- codigo do cliente
                    ${cod_empresa}, -- empresa que o usuario está cadastrado 
                    TRUNC(SYSDATE), -- DATA DO PEDIDO (COLOCAR SYSDATE PARA PEGAR A DATA DO DIA QUE O PEDIDO ESTA CAINDO NO SISTEMA),
                    TO_DATE('${dataPedidoConvertida}', 'DD/MM/YYYY'), -- data que foi gerado o pedido no app
                    TO_DATE('${dataPedidoConvertida}', 'DD/MM/YYYY'), -- data que foi gerado o pedido no app
                    'N', -- Deixar N
                    'N', -- Deixar N
                    'N', -- Deixar N
                    'N', -- Deixar N
                    0, -- Deixar 0
                    SYSDATE, -- deixar sysdate em string
                    TRUNC(SYSDATE), -- deixar sysdate 
                    TRUNC(SYSDATE), -- deixar sysdate 
                    TRUNC(SYSDATE), -- deixar sysdate 
                    ${ped_valor_total}, -- valor do pedido
                    'S', -- deixar S
                    'N', -- deixar N
                    TRUNC(SYSDATE), -- deixar sysdate
                    'N', -- deixar N
                    'N' -- deixar N
                )
            `;
            
            // executa a query, mas não persiste no banco.    
            await queryRunner.query(insertPedidoSql);
            
            //ID sequencial de acordo com o numero de produtos, começando em 0 
            let idTabelaSaib = 0
            
            //agora adicionando cada produto ao pedido criado
            for(const produto of pedido_produtos){
                //descontrução das infomrações do produto
                const {id_produto, quantidade , valor_unitario} = produto;
                
                // pegando a data de vigencia do produto
                const dataVigencia = await ProdutoServico.buscarDataVigenciaProduto(id_produto,cod_empresa);
                const dataVigenciaConvertida = FormatadorDeData.formatarData(new Date(dataVigencia), 'dd/mm/aaaa')
          
                //criando sql de inserção do produto
                const insertProdutosSql = `
                    INSERT INTO SAIB2000.PEDIDO_COL_P(
                        PEDC_ID, -- ID sequencial de acordo com o numero de produtos, começando em 0            
                        PEDC_USR_ID, -- USUARIO QUE INSERIU O PEDIDO (COLOCAR 689 USUARIO APISAIB2000)      
                        PEDC_DTA_CAD, -- dATA DO PEDIDO (COLOCAR SYSDATE PARA PEGAR A DATA DO DIA QUE O PEDIDO ESTA CAINDO NO SISTEMA)      
                        PEDC_SITUACAO, -- DEIXAR 0 - NORMAL       
                        PEDC_ORIGEM, -- DEIXAR 1 - PEDIDO COLETOR        
                        PEDC_STATUS, -- DEIXAR 0 - NORMAL      
                        PEDC_PEDC_DTA_VIS, -- DATA QUE O PEDIDO PEDIDO ESTA CAINDO NO SISTEMA  
                        PEDC_PEDC_EMP_ID,  -- CODIGO DA EMPRESA,  
                        PEDC_PEDC_NR_PEDIDO,  -- NUMERO DO PEDIDO (MESMO NUMERO DA TABELA PEDIDO_COL - PEDC_NR_PEDIDO)  
                        PEDC_PEDC_GEN_TGEN_ID, -- GENERICA ROTA, DEIXAR 920  
                        PEDC_PEDC_GEN_EMP_ID, -- CODIGO DA EMPRESA
                        PEDC_PEDC_GEN_ID,  -- CODIGO DA ROTA
                        PEDC_PROD_EMP_ID,  -- CODIGO DA EMPRESA    
                        PEDC_PROD_ID,    -- CODIGO DO PRODUTO  
                        PEDC_OPERC_EMP_ID,   -- CODIGO DA EMPRESA   
                        PEDC_OPERC_ID,     -- 1551
                        PEDC_TPRC_EMP_ID,  -- CODIGO DA EMPRESA (TRAZER ESSAS DADOS DA TABELA DE PREÇO)
                        PEDC_TPRC_GEN_TGEN_ID,  -- DEIXAR 902 (TRAZER ESSAS DADOS DA TABELA DE PREÇO)
                        PEDC_TPRC_GEN_EMP_ID,   -- CODIGO DA EMPRESA (TRAZER ESSAS DADOS DA TABELA DE PREÇO)
                        PEDC_TPRC_GEN_ID,       -- CODIGO DA TABELA DE PREÇO (TRAZER ESSAS DADOS DA TABELA DE PREÇO)
                        PEDC_TPRC_PROD_EMP_ID,  --CODIGO DA EMPRESA (TRAZER ESSAS DADOS DA TABELA DE PREÇO)
                        PEDC_TPRC_PROD_ID,      --CODIGO DO PRODUTO NA TABELA DE PREÇO (TRAZER ESSAS DADOS DA TABELA DE PREÇO)
                        PEDC_TPRC_DTA_VIGENCIA, -- DATA DA VIGENCIA DA TABELA DE PREÇO (TRAZER ESSAS DADOS DA TABELA DE PREÇO)
                        PEDC_DESC,              -- DEIXAR 0.0000
                        PEDC_DESC_ORIGINAL,     -- DEIXAR NULL
                        PEDC_VLR_UNIT,          -- TRAZER ESSES DADOS DA TABELA DE PREÇO)
                        PEDC_QTDE              -- QUANTIDADE DO PRODUTO
                    )
                    VALUES(
                        ${idTabelaSaib}, -- ID sequencial de acordo com o numero de produtos, começando em 0 
                        689, -- USUARIO QUE INSERIU O PEDIDO (COLOCAR 689 USUARIO APISAIB2000)     
                        SYSDATE, -- DATA DO PEDIDO (COLOCAR SYSDATE PARA PEGAR A DATA DO DIA QUE O PEDIDO ESTA CAINDO NO SISTEMA)
                        0, -- DEIXAR 0 - NORMAL       
                        1, -- DEIXAR 1 - PEDIDO COLETOR        
                        0, -- DEIXAR 0 - NORMAL  
                        TO_DATE('${dataPedidoOracle}','DD/MM/YYYY'), -- DATA QUE O PEDIDO ESTA CAINDO NO SISTEMA
                        ${cod_empresa}, -- CODIGO DA EMPRESA
                        ${numeroPedidoSaib},  -- NUMERO DO PEDIDO (MESMO NUMERO DA TABELA PEDIDO_COL - PEDC_NR_PEDIDO)  
                        920, -- GENERICA ROTA, DEIXAR 920  
                        ${cod_empresa}, -- CODIGO DA EMPRESA
                        ${rotaFuncionario(cod_empresa)},  -- CODIGO DA ROTA
                        ${cod_empresa},  -- CODIGO DA EMPRESA    
                        ${id_produto},    -- CODIGO DO PRODUTO  
                        ${cod_empresa},   -- CODIGO DA EMPRESA   
                        ${codigoDaOperacao(cod_empresa)},     -- CODIGO DA OPERAÇÃO, DEIXAR 1
                        ${cod_empresa},  -- CODIGO DA EMPRESA (TRAZER ESSAS DADOS DA TABELA DE PREÇO)
                        902,  -- DEIXAR 902 (TRAZER ESSAS DADOS DA TABELA DE PREÇO)
                        ${cod_empresa},   -- CODIGO DA EMPRESA (TRAZER ESSAS DADOS DA TABELA DE PREÇO)
                        15,    -- CODIGO DA TABELA DE PREÇO (TRAZER ESSAS DADOS DA TABELA DE PREÇO)
                        ${cod_empresa},  -- CODIGO DA EMPRESA (TRAZER ESSAS DADOS DA TABELA DE PREÇO)
                        ${id_produto},      -- CODIGO DO PRODUTO NA TABELA DE PREÇO (TRAZER ESSAS DADOS DA TABELA DE PREÇO)
                        TO_DATE('${dataVigenciaConvertida}','DD/MM/YYYY'), -- DATA DA VIGENCIA DA TABELA DE PREÇO (TRAZER ESSAS DADOS DA TABELA DE PREÇO)
                        0.0000,      -- DEIXAR 0.0000
                        NULL,     -- DEIXAR NULL
                        ${valor_unitario}, -- TRAZER ESSES DADOS DA TABELA DE PREÇO)
                        ${quantidade}   -- QUANTIDADE DO PRODUTO
                    ) 
                `;
                //executa a query, mas não persiste no banco. 
                await queryRunner.query(insertProdutosSql);

                //aumenta a sequencia do id
                idTabelaSaib++
            }

            //no supabase colocar o numero do pedido SAIB ao pedido do app
            const {error:pedidoAtualizadoError} = await DataSupabase
                .from("pedidos")
                .update({
                    numero_pedido_saib: numeroPedidoSaib, 
                    ped_status: "Em processamento"
                })
                .eq('id', id)
            
            if(pedidoAtualizadoError){
                throw new AppError('Linha 236 | Erro ao atualizar pedidos: ' + pedidoAtualizadoError.message);
            }

            // salvando os pedidos criados para retornar na api os pedidos criados
            pedidosCriados.push({
                cod_saib: ped_usr_cod_saib,
                nome: `${pedido.usuario.nome} ${pedido.usuario.sobrenome}`,
                pedido_app: id,
                pedido_saib: numeroPedidoSaib
            })

            pedidosParaCriarLoggins.push({
                mensagem: `Pedido criado do: ${ped_usr_cod_saib} - ${pedido.usuario.nome} ${pedido.usuario.sobrenome}`,
                stack_trace: null,
                usuario: uuidUsuario,
                stack: 'back-end',
                dados_adicionais: `Pedido app: ${id}, pedido saib: ${numeroPedidoSaib}, quantidade de produtos ${pedido_produtos.length}`,
                tipo_log: tipoLog.INFO
            })

        }

        //salvando todas as alterações no banco, persistindo todas elas.
        await queryRunner.commitTransaction();

        //loggin de sucesso, fazendo o loggin dos pedidos
        Logging.registrarLog(pedidosParaCriarLoggins);
        
        //loggin de sucesso geral de todos os pedidos
        Logging.registrarLog({
            mensagem: 'Pedidos inseridos no SAIB',
            stack_trace: null,
            usuario: uuidUsuario,
            stack: 'back-end',
            dados_adicionais: `Total de pedidos registrados: ${quantidadePedidos}, Pedidos puxados na data de ${dataInicio} à data de ${dataFim}`,
            tipo_log: tipoLog.INFO
        });

        // Agendamento para verificação do status do pedido após o faturamento
        agendarVerificacaoPedido(cod_empresa)

        
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error(error);
        
        // Log de erro
        Logging.registrarLog({
            mensagem: 'Erro na inserção dos pedidos no saib, rollback realizado',
            stack_trace: Logging.formatarObjStackTraceErro(error),
            usuario: uuidUsuario,
            stack: 'back-end',
            dados_adicionais: null,
            tipo_log: tipoLog.ERRO
        });

        throw new AppError('Nenhum pedido foi gerado, devido ao erro: ' + error.message, 404);
    } finally {
        // fechar conexao
        await queryRunner.release();
    }

    return {quantidade: quantidadePedidos, pedidos: pedidosCriados};
};

const rotaFuncionario = (idEmpresa: number): number => {
    const rotaPorEmpresa = {
        42: 603,
        43: 603,
        2: 53,
        6: 53,
        26: 53
    };
    return rotaPorEmpresa[idEmpresa];
};

const cidadeFuncionario = (idEmpresa: number): number => {
    const cidadePorEmpresa = {
        42: 2218, // Campo Grande
        43: 2230, // Dourados
        2: 3243, // Cambé
        6: 3285, // Curitiba
        26: 3260 // Cascavel
    };
    return cidadePorEmpresa[idEmpresa];
};

const codigoDaOperacao = (idEmpresa:number):number => {

    const codOperacaoPorEmpresa ={
        2: 851,
        26: 851,
        6: 851,
        42: 1,
        43: 1
    }

    return codOperacaoPorEmpresa[idEmpresa];
}

const agendarVerificacaoPedido = (codEmpresa:number):void =>{
    const dataAtual = new Date();
    // setando o proximo data/dia valido.
    dataAtual.setDate(dataAtual.getDate() + 1);
    const proximoDia = dataAtual.getDate();

    const verificacao = new PedidoVerificacao(proximoDia,codEmpresa);
    verificacao.agendar()
}

export { criarPedidoService };

