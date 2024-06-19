import { enviarMensagemWhatsapp } from "../../utils/enviarMsgWhatsapp";
import { IUsuarioCPF } from "../../interface/usuario.interface";
import { gerarSenhaHash } from "../../utils/gerarSenhaHash"
import { DataSupabase } from "../../data-source";
import { AppError } from "../../error/appError";
import jwt from "jsonwebtoken";

const recuperacaoSenhaSoliciarService = async (cpf:IUsuarioCPF):Promise<void> => {

    const {data: usuario, error} = await DataSupabase
        .from('usuario')
        .select('*')
        .eq('cpf', cpf)
        .maybeSingle()
    
    if (error) {
        throw new AppError(`Erro interno supabse:${error.message} | ${error.details}`, 500);
    }

    if(!usuario){
        throw new AppError(`CPF não pertence a nenhuma usuario cadastrado na nossa base de dados`, 404);
    }

    const tokenJwt = jwt.sign(
        {admin: usuario.admin},
        process.env.SECRET_KEY,
        {
             subject: usuario.id,
             expiresIn: "20min"
        }
   )


    const numeroAleatorio = Math.floor(10000 + Math.random() * 90000).toString();
    const duracaoToken = 900000; // equivalente a 15 min
    const dataAtual = new Date();
    const expiracaoToken = new Date(dataAtual.getTime() + duracaoToken).toLocaleString();
    const tokenRecuperacao = numeroAleatorio + '|' + expiracaoToken + '|' + tokenJwt
    
    const {error: TokenRecuperacaoSenha} = await DataSupabase
        .from('usuario')
        .update({token_recuperacao: tokenRecuperacao})
        .eq("cpf", cpf)
    
    if (TokenRecuperacaoSenha) {
        throw new AppError(`Erro para salvar o token supabse:${error.message} | ${error.details} || contate o suporte `, 500);
    }

    const nome = usuario.nome[0].toLocaleUpperCase()+usuario.nome.substring(1)

    await enviarMensagemWhatsapp(numeroAleatorio, usuario.whatsapp, nome);

}

const recuperacaoSenhaValidarService = async (token: string, cpf: string):Promise<string> => {
    const {data: usuario, error} = await DataSupabase
        .from('usuario')
        .select('*')
        .eq('cpf', cpf)
        .maybeSingle()
    
       
    if (error) {
        throw new AppError(`Erro interno supabse:${error.message} | ${error.details}`, 500);
    }

    if(!usuario){
        throw new AppError(`Token Invalido ou CPF informado errado`, 404);
    }  
    
    const tokenUsuario = usuario.token_recuperacao.split("|")[0]
    const tokenExpiracao = usuario.token_recuperacao.split("|")[1]
    const tokenJwt = usuario.token_recuperacao.split("|")[2]
    
    if(tokenUsuario !== token){
        throw new AppError(`Token Invalido`, 401);
    }

    const dataAtual = new Date().toLocaleString()
    if(dataAtual > tokenExpiracao){
        throw new AppError(`Código Expirado, solicite um novo`, 401);
    }

    return tokenJwt;
}

const recuperacaoSenhaAtualizarService = async (idUsuario:string, senha:string):Promise<void> => {
    const senhaHash = await gerarSenhaHash(senha);
    
    const {error} = await DataSupabase
        .from('usuario')
        .update({senha: senhaHash, atualizado_em: new Date() , token_recuperacao: null })
        .eq('id', idUsuario)

    if (error) {
        throw new AppError(`Erro ao atualizar senha: ${error.message} | Contate o suporte!`, 500);
    }
}





export {recuperacaoSenhaSoliciarService, recuperacaoSenhaValidarService, recuperacaoSenhaAtualizarService};