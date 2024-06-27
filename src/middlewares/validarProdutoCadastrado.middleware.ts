import { NextFunction, Request, Response } from "express";
import { DataSupabase } from "../data-source";


const validarProdutoCadastradoMiddleware= async (req:Request, res:Response, next:NextFunction) => {
    const codigo:string = req.params.codigo;
    
    const {data:produto, error} = await DataSupabase
                        .from('produto')
                        .select('pr_cod')
                        .eq("pr_cod", +codigo)
                        .maybeSingle()
                        
    if(error){
        return res.status(500).json({ mensagem: "Erro ao acessar supabase:", error });
    }

    if(!produto){
        return res.status(400).json({ mensagem: "Produto não está cadastrado." });
    }
    
    next();
    
}





export {validarProdutoCadastradoMiddleware}