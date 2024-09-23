import { Request, Response } from "express"
import { notificarUsuarioService } from "../../services/usuario/notificarUsuario.service"



const notificarUsuarioController = async (req:Request,res:Response) => {
    const uuidUsuario:string = req.usuario.id
    const quantidadeDeNotificacoes = await notificarUsuarioService(uuidUsuario)
    return res.status(200).json({mensagem: `Foram notificados ${quantidadeDeNotificacoes} usúarios`});
}

export {notificarUsuarioController}