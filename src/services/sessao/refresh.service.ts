import { DataSupabase } from "../../data-source";
import { AppError } from "../../error/appError";
import jwt, { VerifyErrors } from "jsonwebtoken";
import "dotenv/config";
import { IAutorizacaoResponse } from "../../interface/sessao.interface";

const refreshService = async (token:string):Promise<IAutorizacaoResponse> => {
    if(!token){
        throw new AppError("Necesário passar o token de acesso", 403);
    }

    const tokenAcesso = token.split(" ")[1];
    const decode = jwt.decode(tokenAcesso);
    if (!decode) throw new AppError("Token invalido", 403);
    const idUsuario = decode.sub

    const {data: usuario, error} = await DataSupabase
                    .from("usuario")
                    .select("*")
                    .eq("id", idUsuario)
                    .maybeSingle()
            
    if(error){
        throw new AppError(`Erro para buscar Token: ${error.message}`, 500);
    }

    if(!usuario){
        throw new AppError(`Esse token não pertence a nossa base de dados`, 403);
    }

    let novoTokenAcesso;
    jwt.verify(usuario.token, process.env.SECRET_KEY as jwt.Secret, (erro:VerifyErrors | null, decode: any) => {
        if(erro){
            throw new AppError(`Token invalido ou expirado`, 401);
        }

        novoTokenAcesso = jwt.sign(
            {
                admin: decode.admin
            },
            process.env.SECRET_KEY as jwt.Secret,
            { expiresIn: "5h", subject: idUsuario as string }
        );

    })
    
    
    return {
        id: usuario.id,
        cpf: usuario.cpf,
        sexo: usuario.sexo,
        nome: usuario.nome,
        sobrenome: usuario.sobrenome,
        whatsapp: usuario.whatsapp,
        cargo: usuario.cargo,
        empresa: usuario.empresa,
        cod_empresa: usuario.cod_empresa,
        codigo_saib: usuario.codigo_saib,
        credito: usuario.credito,
        admin: usuario.admin,
        token: novoTokenAcesso
    };

}

export {refreshService};