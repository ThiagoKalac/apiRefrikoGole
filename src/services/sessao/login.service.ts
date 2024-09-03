import { DataSupabase } from "../../data-source";
import { ILogin, IAutorizacaoResponse } from "../../interface/sessao.interface";
import { IUsuario } from "../../interface/usuario.interface";
import { AppError } from "../../error/appError";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import "dotenv/config"

const loginService = async (dadosLogin:ILogin):Promise<IAutorizacaoResponse> => {
    const {cpf , senha } = dadosLogin;
    let usuario: IUsuario

    const {data, error} = await DataSupabase
                .from('usuario')
                .select('*')
                .eq('cpf', cpf)
                .maybeSingle()
    
    if(error){
        throw new AppError(`Erro Supabase ao tentar realizar login: ${error.message}`, 500)
    }
    
    
    if(!data){
        throw new AppError("CPF ou senha incorretos", 400)
    }     

    usuario = data as IUsuario;
    const validacaoSenha = await bcrypt.compare(senha + process.env.Bcrypt_Chave, usuario.senha)
    if(!validacaoSenha){
        throw new AppError("CPF ou senha incorretos", 400)
    }


    const tokenAcesso = jwt.sign(
        {
            admin: usuario.admin
        },
        process.env.SECRET_KEY,
        {expiresIn: "5h", subject: usuario.id}
    )

    const tokenRefresh = jwt.sign({admin: usuario.admin}, process.env.SECRET_KEY, {expiresIn: '7d' , subject: usuario.id})

    const { error: updateError } = await DataSupabase
        .from('usuario')
        .update({ token: tokenRefresh })
        .eq('cpf', cpf); 

    if (updateError) {
        throw new AppError(`Erro Supabase ao tentar atualizar o token: ${updateError.message}`, 500);
    }



    return {
        token: tokenAcesso,
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
        perfil: usuario.perfil
    }
}

export {loginService};