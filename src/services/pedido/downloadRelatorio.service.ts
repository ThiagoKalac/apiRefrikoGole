import { DataSupabase } from "../../data-source";
import { AppError } from "../../error/appError";
import { IDownLoadRelatorioRequest, IPedidoRelatioRh } from "../../interface/pedido.interface";
import Excel from 'exceljs';
import { Logging } from "../../log/loggin";
import { tipoLog } from "../../interface/log.interface";

const downloadRelatorioService = async (idUsuario:string, dados:IDownLoadRelatorioRequest):Promise<string> => {
    const {cod_empresa,dataFim,dataInicio} = dados;
    const workbook = new Excel.Workbook()
    const sheet1 = workbook.addWorksheet('relatorio-bebidas');
    const sheet2 = workbook.addWorksheet('relatorio-outros');
    
    // criacao dos cabecalhos das colunas 
    // relatorio dos colaborares clt , apenas bebidas
    sheet1.columns = [
        { header: 'NUMERO EMPRESA', key: 'id_empresa_senior' },
        { header: 'TIPO COLABORADOR', key: 'tipo_colaborador' },
        { header: 'NUMERO DE CADASTRO', key: 'id_usuario_senior' },
        { header: 'CODCAL', key: 'codcal' },
        { header: 'CODIGO EVENTO', key: 'codigo_evento' },
        { header: 'REFEVE', key: 'refeve' },
        { header: 'VALOR VALE', key: 'valor_bebidas' }
    ]
    // relatorio dos colaborares clt , categoria outros(mesa, roupas)
    sheet2.columns = [
        { header: 'NUMERO EMPRESA', key: 'id_empresa_senior' },
        { header: 'TIPO COLABORADOR', key: 'tipo_colaborador' },
        { header: 'NUMERO DE CADASTRO', key: 'id_usuario_senior' },
        { header: 'CODCAL', key: 'codcal' },
        { header: 'CODIGO EVENTO', key: 'codigo_evento' },
        { header: 'REFEVE', key: 'refeve' },
        { header: 'VALOR VALE', key: 'valor_outros' },
        { header: 'PARCELA', key: 'parcela' }
    ]

    // conexão com o supabase
    try {
        const {data, error} = await DataSupabase
            .from('relatorio_pedido_rh')
            .select('*')
            .eq('usuario_pj',false)
            .eq('cod_empresa', cod_empresa)
            .gte('ped_data', `${dataInicio}T00:00:00.000`)
            .lte('ped_data', `${dataFim}T23:59:59.999`)

        
        if(error){
            throw new AppError('Erro ao puxar pedido da view de relatorio rh',500)
        }

        const pedidosRelatorios = data as IPedidoRelatioRh[]

        pedidosRelatorios.forEach(pedido => {
            if(pedido.valor_outros > 0){
                sheet2.addRow({
                    id_empresa_senior: pedido.id_empresa_senior,
                    tipo_colaborador: 1,
                    id_usuario_senior: pedido.id_usuario_senior,
                    codcal: 0,
                    codigo_evento: '',
                    refeve: 1,
                    valor_outros: pedido.valor_outros,
                    parcela: pedido.parcela
                })
            }

            sheet1.addRow({
                id_empresa_senior: pedido.id_empresa_senior,
                tipo_colaborador: 1,
                id_usuario_senior: pedido.id_usuario_senior,
                codcal: 0,
                codigo_evento: 2474,
                refeve: 1,
                valor_bebidas: pedido.valor_bebidas,
            })


        })

        // Gera o arquivo Excel em buffer (para enviar como resposta)
        const buffer = await workbook.xlsx.writeBuffer();
        
        //converter para Buffer do node.js e depois para base64
        const base64String = Buffer.from(buffer).toString('base64');
        

        return base64String; // Retorna o base64String

    } catch (error) {
       if(error instanceof AppError){
            Logging.registrarLog({
                mensagem: 'Erro controlado, rota de download do relatorio do rh',
                usuario: idUsuario,
                tipo_log: tipoLog.CRITICO,
                stack: 'back-end',
                stack_trace: Logging.formatarObjStackTraceErro(error),
                dados_adicionais: `mensagem original do erro ${JSON.stringify(error)}`
            })

            throw new AppError(error.message, error.statusCode || 500);
    
       }else{
            Logging.registrarLog({
                mensagem: 'Erro rota de download do relatorio do rh',
                usuario: idUsuario,
                tipo_log: tipoLog.ERRO,
                stack: 'back-end',
                stack_trace: Logging.formatarObjStackTraceErro(error),
                dados_adicionais: `Erro na tentativa de gerar relatorio em excel`
            })

            throw new AppError('Erro interno no servidor. Tente novamente mais tarde.', 500);
       }
    }
}



export{downloadRelatorioService};