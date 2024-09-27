import { Request, Response } from "express";
import { downloadRelatorioService } from "../../services/pedido/downloadRelatorio.service";
import { IDownLoadRelatorioRequest } from "../../interface/pedido.interface";


const downloadRelatorioController = async (req:Request, res:Response) =>{
    const idUsuario = req.usuario.id;
    const dados:IDownLoadRelatorioRequest = req.body;
    const excelBase64 = await downloadRelatorioService(idUsuario,dados);
    
       
     return res.status(200).json({
        fileData: excelBase64,
        fileName: 'relatorio.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
}

export {downloadRelatorioController};