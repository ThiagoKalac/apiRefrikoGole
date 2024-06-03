import { NextFunction, Request, Response } from "express";


const validarCpfMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    const cpf:string = req.params.cpf ?  req.params.cpf :  req.body.cpf? req.body.cpf : null
   
    if(!cpf){
        return res.status(400).json({mensagem: "Informar o CPF"})
    }

    if(cpf.length < 11) return res.status(400).json({mensagem: "CPF tem menos de 11 caracteres"});
    if(cpf.length > 11) return res.status(400).json({mensagem: "CPF com mais de 11 caracteres, digite somente os números"});
    
    const numerosCpf:number[] = cpf.split("").map(string => parseInt(string));
    const validarNumerosIguais = numerosCpf.every((numero) => numero === numerosCpf[0]);
    if(validarNumerosIguais){
        return res.status(401).json({mensagem: "CPF inválido. Números todos iguais"});
    } else{
        const validarDigito1 = validarDigito(numerosCpf, numerosCpf[9],10);
        const validarDigito2 = validarDigito(numerosCpf, numerosCpf[10],11);

        if(validarDigito1 && validarDigito2){
            next()
        }else{
            return res.status(401).json({mensagem: "Atenção!! Número do CPF inválido"});
        }
    }
    
}


const validarDigito = (listaNumerosCpf:number[], digitoASerValdiado:number, decrecenteSoma:number): boolean => {
    let soma = 0;
    const contadorDigito = decrecenteSoma - 1;
    for(let i = 0; i < contadorDigito; i++){
        soma += listaNumerosCpf[i] * decrecenteSoma
        decrecenteSoma--
    }

    let restoDivisao = (soma * 10) % 11;
    restoDivisao = restoDivisao == 10 || restoDivisao == 11 ? 0 : restoDivisao;
    
    return restoDivisao == digitoASerValdiado
}


export {validarCpfMiddleware}