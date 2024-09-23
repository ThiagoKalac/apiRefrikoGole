import { DataSupabase } from "../../data-source";
import { AppError } from "../../error/appError";
import { tipoLog } from "../../interface/log.interface";
import { IUsuario, IUsuarioAtualizacao, IUsuarioAtualizacaoResposta } from "../../interface/usuario.interface"
import { Logging } from "../../log/loggin";
import { gerarSenhaHash } from "../../utils/gerarSenhaHash";


const atualizarUsuarioService = async (id:string, dados:IUsuarioAtualizacao):Promise<IUsuarioAtualizacaoResposta> => {
    const {confirma_senha, ...dadosAtualizar} = dados;

    try {
    
        if(dadosAtualizar.senha){
            dadosAtualizar.senha = await gerarSenhaHash(dadosAtualizar.senha);
        }
        
        const {data, error} = await DataSupabase
            .from('usuario')
            .update({
                ...dadosAtualizar,
                atualizado_em: new Date()
            })
            .eq('id', id)
            .select('*')
            .single()
        
        const usuario = data as IUsuario

        if (error) {
            throw new AppError(`Erro ao atualizar usuário: ${error.message}`,500);
        }
        
        await Logging.registrarLog({
            mensagem: "Sucesso rota usuario/atualizar/:id",
            stack: "back-end",
            tipo_log: tipoLog.INFO,
            usuario: id,
            stack_trace: null,
            dados_adicionais: `Usuario atualziado ${usuario.cpf} - ${usuario.nome} ${usuario.sobrenome} na empresa ${usuario.empresa}`
        })

        return {
            id: usuario.id,
            nome: usuario.nome,
            sobrenome: usuario.sobrenome,
            sexo: usuario.sexo,
            cpf: usuario.cpf,
            whatsapp: usuario.whatsapp,
            admin: usuario.admin,
            cargo: usuario.cargo,
            cod_empresa: usuario.cod_empresa,
            codigo_saib: usuario.codigo_saib,
            credito: usuario.credito,
            empresa: usuario.empresa,
            perfil: usuario.perfil,
            usuario_pj: usuario.usuario_pj
        };


      

    } catch (error) {
        console.log(error)
        
        await Logging.registrarLog({
            mensagem: "Erro na rota usuario/atualizar/:id",
            stack: "back-end",
            tipo_log: tipoLog.ERRO,
            usuario: id,
            stack_trace: Logging.formatarObjStackTraceErro(error),
            dados_adicionais: "Erro no service de atualização de dados do usuario"
        })

        throw new AppError("Erro interno ao atualizar o usuário", 500);
    }


    
        
   
   

}


export {atualizarUsuarioService}