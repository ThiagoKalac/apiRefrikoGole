import { AppError } from "../error/appError";
import { IProdutoComprovante, IProdutosNaoAtendidosDetalhes, TipoMensagemEnum } from "../interface/mensageiro.interface";
import { tipoLog } from "../interface/log.interface";
import { Logging } from "../log/loggin";


const enviarMensagemWhatsapp = async (token:string, whatsapp:string, usuario:string):Promise<void> => {
    const url = "https://api.kompleto.com.br/v3/bot/6Sn77B58DA2A9MLDc8SZGwTm/sendtext"
   
    try {
        const resposta = await fetch(url,{
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "chatId" : whatsapp,
                "text": `Olá *${usuario}* 😊, como está você?\n\nAqui é a equipe da *Refriko Gole* 🍹 e você solicitou uma recuperação de senha.\n\n🔐 Aqui está seu código de verificação *_${token}_*, coloque-o no aplicativo no local solicitado.\n\n⏳ Validação desse código é de 10 minutos.\n\n*_Por favor, não responda essa mensagem, pois é automática._* 🤖`,
                "inreply": null
            })
        })

        const data = await resposta.json();

        if (data.success != true) {
            throw new AppError(`Erro ao enviar mensagem: ${data.message}`, 400);
        }

    } catch (error) {
        console.log(error);
        throw new AppError(`Erro ao enviar mensagem, procurar o suporte: ${error.message}`, 500);
    }
}


class Mensageiro {
    whatsapp: string;
    usuario: string;
    token?: string | null;
    listaProdutos?: IProdutoComprovante[] | IProdutosNaoAtendidosDetalhes[] | null;
    idPedido?: number | null;
    dataFaturamento?: string | null;
    valorPedido?: number | null

    constructor (
        usuario:string, 
        whatsapp:string, 
        token?:string | null , 
        listaProdutos?: IProdutoComprovante[] | IProdutosNaoAtendidosDetalhes[] |null,
        idPedido?: number | null,
        dataFaturamento?: string | null,
        valorPedido?: number | null
    ){
        this.usuario = usuario;
        this.whatsapp = whatsapp;
        this.token = token;
        this.listaProdutos = listaProdutos;
        this.idPedido = idPedido;
        this.dataFaturamento = dataFaturamento;
        this.valorPedido = valorPedido;
    }
   
    async enviar (tipoMsg:TipoMensagemEnum): Promise<void>{
        const url = "https://api.kompleto.com.br/v3/bot/6Sn77B58DA2A9MLDc8SZGwTm/sendtext"
        let mensagem: string;

        switch (tipoMsg) {
            case TipoMensagemEnum.RECUPERACAO_SENHA:
                mensagem = this.recuperacaoSenha(this.token);
                break;
            case TipoMensagemEnum.COMPROVANTE_PEDIDO:
                mensagem = this.comprovantePedido();
                break;
            case TipoMensagemEnum.PEDIDO_NAO_ATENDIDO:
                mensagem = this.pedidoNaoAtendido();
                break;
            case TipoMensagemEnum.PEDIDO_PARCIAL:
                mensagem = this.pedidoAtendidoParcial();
                break;
            default:
                throw new AppError(`Tipo de mensagem desconhecido: ${tipoMsg}`, 400);
        }


        try {
            const resposta = await fetch(url,{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "chatId" : this.whatsapp,
                    "text": mensagem,
                    "inreply": null
                })
            })
    
            const data = await resposta.json();
            
            if (data.success != true) {
                throw new AppError(`Erro ao enviar mensagem: ${data.message}`, 400);
            }

              // Log de sucesso
            Logging.registrarLog({
                mensagem: `Mensagem de ${tipoMsg} enviada com sucesso para ${this.usuario}`,
                stack_trace: data,
                usuario: null, // ou o UUID do usuário se disponível
                stack: 'back-end',
                dados_adicionais: `Pedido: ${this.idPedido}, WhatsApp: ${this.whatsapp}, resposta da API foi alocada na coluna stack_trace`,
                tipo_log: tipoLog.INFO
            });

        } catch (error) {
            console.log(error);
            //log de erro
            Logging.registrarLog({
                mensagem: `Erro ao enviar mensagem de ${tipoMsg} no whatsapp para ${this.usuario}`,
                stack_trace: Logging.formatarObjStackTraceErro(error),
                usuario: null, // ou o UUID do usuário se disponível
                stack: 'back-end',
                dados_adicionais: `Pedido: ${this.idPedido}, WhatsApp: ${this.whatsapp}`,
                tipo_log: tipoLog.ERRO
            });
            throw new AppError(`Erro ao enviar mensagem, procurar o suporte: ${error.message}`, 500);
        }
    }

    private recuperacaoSenha(token:string = null):string{
        return `Olá *${this.usuario}* 😊, como está você?\n\nAqui é a equipe da *Refriko Gole* 🍹 e você solicitou uma recuperação de senha.\n\n🔐 Aqui está seu código de verificação *_${token}_*, coloque-o no aplicativo no local solicitado.\n\n⏳ Validação desse código é de 10 minutos.\n\n*_Por favor, não responda essa mensagem, pois é automática._* 🤖`
    }

    private comprovantePedido(): string {
        if (!this.listaProdutos || this.listaProdutos.length === 0) {
            throw new AppError(`Lista de produtos está vazia ou não foi fornecida.`, 400);
        }
        
        let mensagem = `Olá *${this.usuario}* 😊, como está você?,\n\n Aqui é a equipe da *Refriko Gole* 🍹 e aqui está o comprovante do seu pedido:\n\n`;
        mensagem += `*Pedido:* ${this.idPedido}\n*Valor do Pedido:* R$${this.valorPedido}\n*Status:* Pendente\n*Faturamento previsto:* ${this.dataFaturamento}:\n\n`;
        mensagem += `🍻 Produtos:\n`
        this.listaProdutos.forEach(produto => {
            mensagem += `- *${produto.nome_produto}* - *qtd*:${produto.qtd} - *valor*:R$${produto.valor_uni} - *total*: R$${produto.valor_total}\n`;
        });
        mensagem += `\n\n ⚠️ *AVISO IMPORTANTE* ⚠️!\n\n`;
        mensagem += `> _O faturamento do seu pedido será submetido a uma análise de estoque e, caso algum item não esteja disponível, o pedido poderá ser cancelado. No entanto, fique tranquilo, você será notificado._\n\n`;
        mensagem += `📃 _Você pode acompanhar o status do seu pedido na seção *"Meus Pedidos"* do menu._\n\n`
        mensagem += `😄 *Obrigado por comprar conosco!.*\n`
        mensagem += `\n⚠️ *Por favor, não responda essa mensagem, pois é automática.* 🤖`
        return mensagem;
    }

    private pedidoNaoAtendido():string {
        
        return `Olá *${this.usuario}* 😊, como está você?\n
        \nAqui é a equipe da *Refriko Gole* 🍹.\n
        \nInfelizmente, não conseguimos atender ao seu pedido de número *${this.idPedido}*. 😔
        \nPara mais informações, por favor, procure a recepção.
        \nAgradecemos a sua compreensão.\n
        \n🍹 *Equipe Refriko Gole* 🍹\n
        \n⚠️ *Por favor, não responda essa mensagem, pois é automática.* 🤖`;
    }

    private pedidoAtendidoParcial():string{
        if (!this.listaProdutos || this.listaProdutos.length === 0) {
            throw new AppError(`Lista de produtos está vazia ou não foi fornecida.`, 400);
        }

        let mensagem = `Olá *${this.usuario}* 😊, tudo bem?,\n\n`;
        mensagem += `Aqui é a equipe da *Refriko Gole* 🍹. Estamos entrando em contato para informar que o seu pedido número *${this.idPedido}* está faturado, porém alguns produtos não puderam ser *atendidos*\n`;
        mensagem += `*motivo*: Falta de estoque.\n`;
        mensagem += `Os seguintes itens não foram atendidos:\n`;
        
        this.listaProdutos.forEach(produto => {
            mensagem += `cod: 🍺 *${produto.cod_produto}* - *_${produto.nome}_*\n`
        })

        mensagem += `\n\nO valor total desses produtos foi *devolvido* ao seu crédito.💸\n`;
        mensagem += `Você pode usar esse valor para realizar novos pedidos a qualquer momento.😁\n\n`
        mensagem += `Lamentamos pelo inconveniente e agradecemos pela sua compreensão.\n\n`;
        mensagem += `🍹 *Equipe Refriko Gole* 🍹\n\n`;
        mensagem += `⚠️ *Por favor, não responda essa mensagem, pois ela é automática.* 🤖`;

        return mensagem;
    }
}

 
export {enviarMensagemWhatsapp, Mensageiro};

