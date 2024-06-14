import  bcrypt  from  "bcrypt" 
import { DataSupabase } from "../../data-source"
import { IUsuarioCriacao } from "../../interface/usuario.interface"
import { AppError } from "../../error/appError"
import { gerarSenhaHash } from "../../utils/gerarSenhaHash"
import "dotenv/config"

const cadastroUsuarioService = async (dados: IUsuarioCriacao): Promise<boolean> => {
    const {cpf, cargo, cod_empresa, codigo_saib, whatsapp ,senha, empresa, credito, nome , sobrenome, sexo } = dados;
    
    const senhaHash = await gerarSenhaHash(senha)

    const {error, status} = await DataSupabase
            .from('usuario')
            .insert({
                cpf,
                nome,
                sobrenome,
                sexo,
                cargo,
                empresa,
                cod_empresa,
                codigo_saib,
                credito,
                whatsapp,
                senha: senhaHash
            })


    if (error) {
        throw new AppError(`Erro interno supabse:${error.message} | ${error.details}`, 500)
    }

    if (status !== 201) {
        throw new AppError(`Falha ao cadastrar usuário:${error}`, 400)
    }

    return true;
}



export {cadastroUsuarioService}