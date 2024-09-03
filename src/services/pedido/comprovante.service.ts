import { IComprovante, TipoMensagemEnum } from "../../interface/mensageiro.interface";
import { Mensageiro } from "../../utils/enviarMsgWhatsapp";


const enviarComprovanteService = async (dadosMsg:IComprovante) => {
    
    const {idPedido, valorPedido, produtos, whatsapp, usuario,dataFaturamento} = dadosMsg;
    
    // Cria uma instância do Mensageiro
    const mensageiro = new Mensageiro(usuario, whatsapp, null, produtos,idPedido,dataFaturamento,valorPedido);

    // Envia a mensagem de comprovante de pedido
    try {
        await mensageiro.enviar(TipoMensagemEnum.COMPROVANTE_PEDIDO);
        console.log(`Mensagem de comprovante de pedido enviada com sucesso para ${usuario}`);
    } catch (error) {
        console.error(`Erro ao enviar mensagem: ${error.message}`);
    }
}

export {enviarComprovanteService};