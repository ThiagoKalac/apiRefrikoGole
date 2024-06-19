import { Request, Response } from "express"
import { IUsuarioAtualizacao } from "../../interface/usuario.interface"
import { atualizarUsuarioService } from "../../services/usuario/atualizarUsuario.service";


const atualizarUsuarioController = async (req:Request, res:Response) => {
    console.log('ola')
    const id:string = req.params.id;
    const dados:IUsuarioAtualizacao = req.body;
    const usuarioAtualizado = await atualizarUsuarioService(id, dados);
    return res.status(200).json({mensagem: 'usuário atualizado', usuario: usuarioAtualizado})
}

export {atualizarUsuarioController}