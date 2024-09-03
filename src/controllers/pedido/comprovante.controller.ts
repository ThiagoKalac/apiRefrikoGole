import { Request, Response } from "express";
import { IComprovante } from "../../interface/mensageiro.interface";
import { enviarComprovanteService } from "../../services/pedido/comprovante.service";


const enviarComprovanteController = async (req:Request, res: Response) => {
    const dados:IComprovante = req.body; 
    await enviarComprovanteService(dados)
    return res.status(200).json({mensagem: 'Comprovante enviado'})
}

export {enviarComprovanteController};