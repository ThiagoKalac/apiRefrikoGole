import cron from 'node-cron';
import { DataSourcePostGree, DataSupabase } from '../../data-source';
import { IUsuarioCPF } from '../../interface/usuario.interface';
import { Funcionarios } from '../../entity/Funcionarios';
import { AppError } from '../../error/appError';
import { Logging } from '../../log/loggin';
import { tipoLog } from '../../interface/log.interface';

class RestaurarCreditoMensalFuncionario {

    private static async valorDescontoParcelaPendente (idUsuario:string):Promise<number>{
        const {data:listaParcelas, error} = await DataSupabase
            .from('parcela')
            .select('*')
            .eq('id_usuario', idUsuario)
            .eq('pago_todas', false)
       
        if(error) throw error

        if (listaParcelas.length == 0) return 0;

       
        let totalDesc = 0;
        for(const parcelaDetalhe of listaParcelas){
            const {id, qtd_parcela, valor_parcela } = parcelaDetalhe;
            let {parcela_atual} = parcelaDetalhe;

            totalDesc = totalDesc + valor_parcela;
            parcela_atual++
            
            
            const {error} = await DataSupabase
                .from('parcela')
                .update({
                    parcela_atual,
                    pago_todas: qtd_parcela == parcela_atual ? true: false
                })
                .eq('id', id)
             
            if(error){
                throw error;
            }
            
        }
        const descontoConvertido = Number(parseFloat(totalDesc.toFixed(2)))
        return descontoConvertido;
    }


    private static async executar(): Promise<void>{
        try {
            const {data: listaDadosUsuariosApp, error} = await DataSupabase
                .from("usuario")
                .select('cpf, id')

            listaDadosUsuariosApp as IUsuarioCPF[]

            if(error){
                throw new AppError(`Erro linha 17 | tarefa restaurarCreditoMensalFuncionario ${error}`,500)
            }

            const funcionariosRepositorio = DataSourcePostGree.getRepository(Funcionarios);
                
            Promise.all(listaDadosUsuariosApp.map(async (usuario) => {
            
                const limiteFuncionario = await funcionariosRepositorio.findOne({
                    where:{
                        cpf: usuario.cpf
                    },
                    select: {
                        limite: true
                    }
                 })
                
                const valorDesconto = await this.valorDescontoParcelaPendente(usuario.id)
                
                 if (limiteFuncionario) {
                    const salarioConvertido = Number(parseFloat(limiteFuncionario.limite).toFixed(2))

                    await DataSupabase
                        .from('usuario')
                        .update({ credito: salarioConvertido - valorDesconto})
                        .eq('cpf', usuario.cpf);
                }
                 
            }))

            Logging.registrarLog({
                mensagem: "Restauração de crédito mensal realizado com sucesso",
                stack_trace: null,
                usuario: null,
                stack: "back-end",
                dados_adicionais: `Atualizados de ${listaDadosUsuariosApp.length} usuários`,
                tipo_log: tipoLog.INFO
            })
            
        } catch (error) {
            console.error('Erro ao executar a restauração de crédito mensal:', error);
            

            Logging.registrarLog({
                mensagem: "Erro ao executar a restauração de crédito mensal",
                stack_trace: Logging.formatarObjStackTraceErro(error),
                usuario: null,
                stack: "back-end",
                dados_adicionais: 'cron job/services/jobs/tasks/restaurarCreditoMensal',
                tipo_log: tipoLog.ERRO
            })

            throw new AppError(`Erro linha 46 | tarefa restaurarCreditoMensalFuncionario ${error}`,500)
        }
    }

    static agendar(){
        // agendador para todo dia 21 de cada mes, atualizar salario do colaborador 0 0 21 * *
        cron.schedule('0 0 21 * *', async () => {
            await this.executar()    
        }, {
            scheduled: true,
            timezone: "America/Sao_Paulo"
        });
    }

}

export {RestaurarCreditoMensalFuncionario};



