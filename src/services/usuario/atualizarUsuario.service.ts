import { DataSupabase } from "../../data-source";
import { AppError } from "../../error/appError";
import { IUsuarioAtualizacao } from "../../interface/usuario.interface"
import { gerarSenhaHash } from "../../utils/gerarSenhaHash";


const atualizarUsuarioService = async (id:string, dados:IUsuarioAtualizacao) => {
    const {confirma_senha, ...dadosAtualizar} = dados
    
    if(dadosAtualizar.senha){
        dadosAtualizar.senha = await gerarSenhaHash(dadosAtualizar.senha);
    }


    const {data:usuarioAtualizado, error} = await DataSupabase
        .from('usuario')
        .update({
            ...dadosAtualizar,
            atualizado_em: new Date()
        })
        .eq('id', id)
        .select('id, nome, sobrenome, sexo, whatsapp, cpf')
        .single()
        
    if (error) {
        throw new AppError(`Erro ao atualizar usuário: ${error.message}`,500);
    }
    
    console.log('ola')
    console.log(usuarioAtualizado)

    return usuarioAtualizado

}


export {atualizarUsuarioService}