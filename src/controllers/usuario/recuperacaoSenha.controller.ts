import { Request, Response } from "express"
import { IUsuarioAtualizarRecuperacaoSenha, IUsuarioCPF, IUsuarioValidarRecuperacaoSenha } from "../../interface/usuario.interface"
import { recuperacaoSenhaSoliciarService, recuperacaoSenhaValidarService, recuperacaoSenhaAtualizarService } from "../../services/usuario/recuperacaoSenha.service";


const recuperacaoSenhaSoliciarController = async (req:Request, res:Response) => {
    const cpf:IUsuarioCPF = req.body.cpf;
    await recuperacaoSenhaSoliciarService(cpf)
    return res.status(200).json({mensagem: "Enviamos um código de verificação de 5 dígitos para o seu WhatsApp"})
}

const recuperacaoSenhaValidarController = async (req:Request, res:Response) =>{
    const {token, cpf}  = req.body as IUsuarioValidarRecuperacaoSenha
    const tokenAcesso:string = await recuperacaoSenhaValidarService(token, cpf)
    return res.status(200).json({mensagem: "token valido", token: tokenAcesso})
   
}

const recuperacaoSenhaAtualizarController = async (req:Request, res:Response) =>{
    const {senha} = req.body as IUsuarioAtualizarRecuperacaoSenha
    const usuarioId:string = req.usuario.id
    await recuperacaoSenhaAtualizarService(usuarioId, senha);
    return res.status(200).json({ mensagem: "Senha atualizada com sucesso" });
}

export {recuperacaoSenhaSoliciarController, recuperacaoSenhaValidarController, recuperacaoSenhaAtualizarController}