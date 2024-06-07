import { NextFunction, Request, Response } from "express";
import { DataSupabase } from "../data-source";


const validarCpfExistenteMiddleware= async (req:Request, res:Response, next:NextFunction) => {
    const cpf:string = req.body.cpf
    
    const {data:usuario, error} = await DataSupabase
                        .from('usuario')
                        .select('cpf')
                        .eq("cpf", cpf)
                        .maybeSingle()
                        
    if(error){
        return res.status(500).json({ mensagem: "Erro ao acessar supabase, validar CPF CADASTRO:", error });
    }

    if(usuario){
        return res.status(400).json({ mensagem: "CPF já cadastrado." });
    }
    
    next();
    
}





export {validarCpfExistenteMiddleware}