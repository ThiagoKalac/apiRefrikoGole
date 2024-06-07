import { Request, Response } from "express";
import { IUsuarioCriacao } from "../../interface/usuario.interface";
import { cadastroUsuarioService } from "../../services/usuario/cadastroUsuario.service";


const cadastroUsuarioController = async (req:Request, res:Response) => {
    const dadosParaCadastro : IUsuarioCriacao = req.body
    const criado : boolean = await cadastroUsuarioService(dadosParaCadastro)
    return res.status(201).json({mensagem: 'Cadastro realizado', criado})
}

export {cadastroUsuarioController}