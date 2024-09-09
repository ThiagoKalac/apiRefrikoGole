import  bcrypt  from  "bcrypt" 
import { DataSupabase } from "../../data-source"
import { IUsuarioCriacao } from "../../interface/usuario.interface"
import { AppError } from "../../error/appError"
import { gerarSenhaHash } from "../../utils/gerarSenhaHash"
import "dotenv/config"
import { Logging } from "../../log/loggin"
import { tipoLog } from "../../interface/log.interface"

const cadastroUsuarioService = async (dados: IUsuarioCriacao): Promise<boolean> => {
    const {
        cpf, 
        cargo, 
        cod_empresa, 
        codigo_saib, 
        whatsapp ,
        senha, 
        empresa, 
        credito, 
        nome , 
        sobrenome, 
        sexo, 
        cnpj_empresa,
        id_empresa_senior,
        id_usuario_senior,
        nome_empresa_senior,
        usuario_pj 
    } = dados;
    
    const senhaHash = await gerarSenhaHash(senha)
    try {
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
                senha: senhaHash,
                cnpj_empresa,
                id_empresa_senior,
                id_usuario_senior,
                nome_empresa_senior,
                usuario_pj
            })


        if (error) {
            throw new AppError(`Erro interno supabse:${error.message} | ${error.details}`, 500)
        }

        if (status !== 201) {
            throw new AppError(`Falha ao cadastrar usuário:${error}`, 400)
        }

        await Logging.registrarLog({
            mensagem: "Sucesso na rota - usuario/cadastro",
            stack: "back-end",
            tipo_log: tipoLog.INFO,
            usuario: null,
            dados_adicionais: `Novo usuario ${cpf}-${nome} ${sobrenome} da empresa ${cod_empresa}`,
            stack_trace: null
        });


    return true;
    } catch (error) {
        await Logging.registrarLog({
            mensagem: "Erro na rota - usuario/cadastro",
            stack: "back-end",
            tipo_log: tipoLog.ERRO,
            usuario: null,
            dados_adicionais: `
                Erro ao tentar cadastrar o usuario ${cpf}-${nome} ${sobrenome} da empresa ${cod_empresa}
            `,
            stack_trace: Logging.formatarObjStackTraceErro(error)
        });

        throw error instanceof AppError ? error : new AppError("Erro inesperado no servidor", 500);
    }
    
}



export {cadastroUsuarioService}