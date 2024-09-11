
import { NextFunction, Request, Response } from "express";
import { DataSupabase } from "../data-source";


const validarExistenciaIdMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    const id:string = req.params.id
    
    const {data:usuario, error} = await DataSupabase
                        .from('usuario')
                        .select('id, cpf, nome')
                        .eq("id", id)
                        .maybeSingle()
                 
    if(error){
        return res.status(500).json({ mensagem: "Erro ao buscar ID supabase:", error });
    }

    if(!usuario){
        return res.status(400).json({ mensagem: "ID inexistente | Dados do usuário não foram encontrados" });
    }
    
    next();
    
}





export {validarExistenciaIdMiddleware}