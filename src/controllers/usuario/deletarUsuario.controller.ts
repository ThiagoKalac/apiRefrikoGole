import { Request, Response } from "express";
import { deletarUsuarioService } from "../../services/usuario/deletarUsuario.service";


const deletarUsuarioController = async (req:Request, res:Response) => {
    const idUsuario:string = req.params.id;
    const usuarioAutenticado:string = req.usuario.id;
    await deletarUsuarioService(idUsuario, usuarioAutenticado);
    return res.status(204).json()
};


export {deletarUsuarioController}