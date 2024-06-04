import  bcrypt  from  "bcrypt" 
import { DataSupabase } from "../../data-source"
import { IUsuarioCriacao } from "../../interface/usuario.interface"
import { AppError } from "../../error/appError"
import "dotenv/config"

const cadastroUsuarioService = async (dados: IUsuarioCriacao): Promise<boolean> => {
    const {cpf, cargo, cod_empresa, codigo_saib, senha, empresa, credito, nome , sobrenome, sexo } = dados;
    
    const numeroSalt = gerarSalt();
    const salt = await bcrypt.genSalt(numeroSalt);
    const senhaHash = await bcrypt.hash(senha + process.env.Bcrypt_Chave, salt)

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


const gerarSalt = () => {
    const saltOpcoes = [8,10,12];
    const indexAleatorio = Math.floor(Math.random() * saltOpcoes.length)
    return saltOpcoes[indexAleatorio];
}

export {cadastroUsuarioService}