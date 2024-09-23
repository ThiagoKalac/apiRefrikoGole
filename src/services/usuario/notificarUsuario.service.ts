import { DataSupabase } from "../../data-source"
import { AppError } from "../../error/appError"
import { ILog, tipoLog } from "../../interface/log.interface"
import { TipoMensagemEnum } from "../../interface/mensageiro.interface"
import { IUsuarioNotificar } from "../../interface/usuario.interface"
import { Logging } from "../../log/loggin"
import { Mensageiro } from "../../utils/enviarMsgWhatsapp"


const notificarUsuarioService = async (uuidUsuario:string = 'asd3sda545'):Promise<string> => {
    
    try {
        const listaPedidosNotificadosLoggin:ILog[] = []

        const {data ,error} = await DataSupabase
            .from('pedidos')
            .select(
                `*,
                usuario!inner (
                    nome,
                    sobrenome,
                    cod_empresa,
                    whatsapp
                )`
            )
            .eq('ped_status', 'Em separação')
            
        const listaPedidos = data as IUsuarioNotificar[]

        if(error){
            throw new AppError(`Erro para obter os pedidos no supabase, ${JSON.stringify(error)}`, 500)
        }
        

        if(listaPedidos.length === 0){
            throw new AppError(`Nenhum pedido encontrado, nenhum usúario foi notificado`, 404)
        }

        const listaIds: number[] = listaPedidos.map(pedidos => pedidos.id);
        await alterarStatusPedido(listaIds);
        
        for (const pedido of listaPedidos){
            
            const nomeUsuario = pedido.usuario.nome.charAt(0).toUpperCase()+pedido.usuario.nome.substring(1)
            const sobrenomeUsuario = pedido.usuario.sobrenome.split(" ")[0].charAt(0).toUpperCase() + pedido.usuario.sobrenome.substring(1)
            const usuario = `${nomeUsuario} ${sobrenomeUsuario}`

            const mensageiro = new Mensageiro(usuario, pedido.usuario.whatsapp, null, null, pedido.id,null,null);
            mensageiro.enviar(TipoMensagemEnum.LIBERADO_RETIRADA);
            
            listaPedidosNotificadosLoggin.push({
                mensagem: `Pedido notificado no whatsapp ${pedido.usuario.whatsapp}`,
                stack_trace: null,
                usuario: uuidUsuario,
                stack: 'back-end', 
                dados_adicionais: `Pedido ${pedido.id} do usuario:${pedido.usuario.nome} ${pedido.usuario.sobrenome}, pedido saib: ${pedido.numero_pedido_saib}, pedido fat: ${pedido.pedido_fat_saib}`,
                tipo_log: tipoLog.INFO
            })
        }


        await Logging.registrarLog(listaPedidosNotificadosLoggin);

        await Logging.registrarLog({
            mensagem: 'Sucesso rota /usuario/notificar',
            stack: 'back-end',
            tipo_log: tipoLog.INFO,
            usuario: null,
            dados_adicionais: `Notificado  ${listaPedidos.length} usuario`,
            stack_trace: null
        })
        
        return `${listaPedidos.length}`
        
    } catch (error) {
        if(error instanceof AppError){
            await Logging.registrarLog({
                mensagem: 'Rota /usuario/notificar',
                stack: 'back-end',
                tipo_log: tipoLog.INFO,
                usuario: null,
                dados_adicionais: `Sem pedidos para notificar: ${error.message}`,
                stack_trace: Logging.formatarObjStackTraceErro(error)
            })
            throw new AppError(`${error.message}`, 404);
        }else{
            await Logging.registrarLog({
                mensagem: 'Erro na rota /usuario/notificar',
                stack: 'back-end',
                tipo_log: tipoLog.ERRO,
                usuario: null,
                dados_adicionais: `Erro para obter os pedidos no supabase. Erro original: ${JSON.stringify(error)}`,
                stack_trace: Logging.formatarObjStackTraceErro(error)
            })
            throw new AppError(`${error.message}`, 500);
        }
    }
}


const alterarStatusPedido = async (listaIds:number[]):Promise<void> => {
    const {error} = await DataSupabase
        .from('pedidos')
        .update({
            ped_status: 'Liberado para retirada'
        })
        .in('id', listaIds)

    if(error){
        throw new AppError(`Erro na tentitva de troca de status, ${JSON.stringify(error)}`, 500);
    }
}


export {notificarUsuarioService}