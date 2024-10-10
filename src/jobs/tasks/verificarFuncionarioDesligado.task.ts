import cron from 'node-cron';
import { DataSourcePostGree, DataSupabase } from '../../data-source';
import { Funcionarios } from '../../entity/Funcionarios';
import { AppError } from '../../error/appError';
import { Logging } from '../../log/loggin';
import { tipoLog } from '../../interface/log.interface';

class VerificarFuncionarioDesligado {
    private static async executar(): Promise<void>{
        try {
            const listaCpfsFuncionarios = await this.obterListaCpfsFuncioanariosSenior();
            const listaTodosUsuariosApp = await this.obterListaUsuariosApp();
            
            if(listaTodosUsuariosApp != null){

                const cpfFuncionariosSet = new Set(listaCpfsFuncionarios);
                const usuariosDemitidos = listaTodosUsuariosApp.filter(usuario => !cpfFuncionariosSet.has(usuario.cpf));
                
                if(usuariosDemitidos.length > 0){
                    for(const usuario of usuariosDemitidos){
                        await this.cancelarPedidos(usuario.id);
                        await this.desativarUsuario(usuario.id, usuario.cpf);
    
                    }
                }
                Logging.registrarLog({
                    mensagem: 'Verificacao de Usuarios(s) desativado com sucesso',
                    stack_trace: null,
                    usuario: null,
                    stack: 'back-end',
                    dados_adicionais: `Desativados usuários: ${usuariosDemitidos.length} e cancelados os pedidos com status de Pendente e Aguardando Pagamento `,
                    tipo_log: tipoLog.INFO
                })

            }
            

        } catch (error) {
            console.error('Erro ao executar a verificao de desligamento de funcionario:', error);

            Logging.registrarLog({
                mensagem: "Erro ao executar a verificao de desligamento de funcionario",
                stack_trace: Logging.formatarObjStackTraceErro(error),
                usuario: null,
                stack: "back-end",
                dados_adicionais: 'cron job/services/jobs/tasks/VerificarFuncionarioDesligado',
                tipo_log: tipoLog.ERRO
            });

            throw new AppError(`tarefa VerificarFuncionarioDesligado ${error}`,500)
        }
    }

    private static async obterListaCpfsFuncioanariosSenior():Promise<string[]>{
        const funcionariosRepositorio = DataSourcePostGree.getRepository(Funcionarios);
        const listaFuncionario = await funcionariosRepositorio.find(({
            select: {
                cpf: true
            }
        }))

        const listaCpfs = listaFuncionario.map(funcionario => funcionario.cpf);
        
        

        // Log de consulta de funcionários
        Logging.registrarLog({
            mensagem: "Consulta de todos os funcionários realizada",
            stack_trace: null,
            usuario: null,
            stack: "back-end",
            dados_adicionais: `Total de funcionários consultados, tarega para verificar desligamento: ${listaFuncionario.length}`,
            tipo_log: tipoLog.INFO
        });

        return listaCpfs;
    }

    private static async obterListaUsuariosApp():Promise<{id: string, cpf:string}[] | null>{
        
        const {data, error} = await DataSupabase
            .from('usuario') 
            .select('id, cpf')
            .neq('ativado', false)
        
    
        if(error){
            throw new AppError('Erro para buscar Id do usuario || AtualizarSalario.usuarioIdApp', 500)
        }    
     
        return data.length == 0 ?  null: data;
    }

    private static async cancelarPedidos(id:string):Promise<void>{
        const {error} = await DataSupabase
            .from('pedidos') 
            .update({
                ped_status: "Cancelado",
                observacao: "Funcionário desligado do quadro de colaboradores",
                ped_data_alterado: new Date()
            })
            .in("ped_status",["Aguardando Pagamento", "Pendente"])
            .eq("id_usuario", id)
        
    
        if(error){
            throw new AppError('Erro para cancelar o pedido do usuario || verificarFuncionarioDesligado.cancelarPedidos', 500)
        }    
     
        
    }

    private static async desativarUsuario(id:string, cpf:string):Promise<void>{
        const {error} = await DataSupabase
        .from('usuario') 
        .update({
            token: null,
            credito: -1,
            perfil: null,
            ativado: false,
            desativado_em: new Date()
            
        })
        .eq("id", id)
        .eq("cpf", cpf)
        
        if(error){
            throw new AppError('Erro para desativar usuario || verificarFuncionarioDesligado.desativarUsuario', 500)
        }    
 
    }
 

    static agendar(){
          // agendado para executar todos os as 18h|  0 18 * * * 
        cron.schedule('0 18 * * *', async () => {
            this.executar()    
        }, {
            scheduled: true,
            timezone: "America/Sao_Paulo"
        });
    }
}

export {VerificarFuncionarioDesligado}