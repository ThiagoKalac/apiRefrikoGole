import { DataSupabase } from "../../data-source"
import { AppError } from "../../error/appError"
import { tipoLog } from "../../interface/log.interface"
import { Logging } from "../../log/loggin"


const deletarUsuarioService = async (idUsuario: string, usuarioAutenticado: string): Promise<void> => {
    try {
        const { data: usuario, error } = await DataSupabase
            .from('usuario')
            .update({
                ativado: false,
                desativado_em: new Date().toISOString(),
                token: null
            })
            .eq('id', idUsuario)
            .select('nome, cpf, sobrenome')
            .maybeSingle()
        
        if (error) {
            throw new AppError(`Erro ao tentar deletar o usuário: ${JSON.stringify(error)}`, 500);
        }

    
        // Registro do log após a exclusão
        Logging.registrarLog({
            mensagem: `Sucesso na rota rota usuario/deletar/:id`,
            stack: "back-end",
            tipo_log: tipoLog.INFO,
            usuario: usuarioAutenticado,
            dados_adicionais: `O usuário ${usuario.nome} ${usuario.sobrenome}, portador do ${usuario.cpf} foi desativado com sucesso`,
            stack_trace: null
        });

    } catch (error) {
        Logging.registrarLog({
            mensagem: "Erro na rota usuario/deletar/:id",
            stack: "back-end",
            tipo_log: tipoLog.CRITICO,
            usuario: usuarioAutenticado,
            dados_adicionais: `Erro original: ${JSON.stringify(error)}`,
            stack_trace: Logging.formatarObjStackTraceErro(error)
        });

        throw new AppError(`${error.message}`, 500);
    }
}



export {deletarUsuarioService}