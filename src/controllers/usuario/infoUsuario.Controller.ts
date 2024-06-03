import { Response, Request } from "express";
import { infoUsuarioService } from "../../services/usuario/infoUsuario.Service";



const infoUsuarioController = async (req:Request, res:Response) => {
    const cpf:string = req.params.cpf;
    const informaçõesUsuario = await infoUsuarioService(cpf);
    return res.status(200).json({dado: informaçõesUsuario})
}

export {infoUsuarioController};