import cron from 'node-cron';
import { DataSourcePostGree, DataSupabase } from '../../data-source';
import { IUsuarioCPF } from '../../interface/usuario.interface';
import { Funcionarios } from '../../entity/Funcionarios';
import { AppError } from '../../error/appError';
import { Logging } from '../../log/loggin';
import { tipoLog } from '../../interface/log.interface';

class RestaurarCreditoMensalFuncionario {
    private static async executar(): Promise<void>{
        try {
            const {data: listaCpfsApp, error} = await DataSupabase
                .from("usuario")
                .select('cpf')

            listaCpfsApp as IUsuarioCPF[]

            if(error){
                throw new AppError(`Erro linha 17 | tarefa restaurarCreditoMensalFuncionario ${error}`,500)
            }

            const funcionariosRepositorio = DataSourcePostGree.getRepository(Funcionarios);
            
            Promise.all(listaCpfsApp.map(async (cpf) => {
            
                const funcionario = await funcionariosRepositorio.findOne({
                    where:{
                        cpf: cpf.cpf
                    },
                    select: {
                        limite: true
                    }
                 })
                
                 
                 if (funcionario) {
                    const salarioConvertido = Number(parseFloat(funcionario.limite).toFixed(2))

                    await DataSupabase
                        .from('usuario')
                        .update({ credito: salarioConvertido })
                        .eq('cpf', cpf.cpf);
                }
                 
            }))

            Logging.registrarLog({
                mensagem: "Restauração de crédito mensal realizado com sucesso",
                stack_trace: null,
                usuario: null,
                stack: "back-end",
                dados_adicionais: `Atualizados de ${listaCpfsApp.length} usuários`,
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
        // agendador para todo dia 21 de cada mes, atualizar salario do colaborador
        cron.schedule('0 0 21 * *', async () => {
            await this.executar()    
        }, {
            scheduled: true,
            timezone: "America/Sao_Paulo"
        });
    }

}

export {RestaurarCreditoMensalFuncionario};



