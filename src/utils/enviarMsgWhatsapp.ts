import { AppError } from "../error/appError";


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

export {enviarMensagemWhatsapp};