import cron from 'node-cron';
import { DataSourcePostGree, DataSupabase } from '../../../data-source';
import { IUsuarioCPF } from '../../../interface/usuario.interface';
import { Funcionarios } from '../../../entity/Funcionarios';
import { AppError } from '../../../error/appError';

class restaurarCreditoMensalFuncionario {
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
            
            listaCpfsApp.map(async (cpf) => {
            
                const funcionario = await funcionariosRepositorio.findOne({
                    where:{
                        cpf: cpf.cpf
                    },
                    select: {
                        limite: true
                    }
                 })
                
                const salarioConvertido = Number(parseFloat(funcionario.limite).toFixed(2))
                
                if (funcionario) {
                    await DataSupabase
                        .from('usuario')
                        .update({ credito: salarioConvertido })
                        .eq('cpf', cpf.cpf);
                }
                 
            })
            
        } catch (error) {
            console.error('Erro ao executar a restauração de crédito mensal:', error);
            throw new AppError(`Erro linha 46 | tarefa restaurarCreditoMensalFuncionario ${error}`,500)
        }
    }

    static agendar(){
        // agendador para todo dia 21 de cada mes, atualizar salario do colaborador
        cron.schedule('* * 21 * *', async () => {
            this.executar()    
        }, {
            scheduled: true,
            timezone: "America/Sao_Paulo"
        });
    }

}

export {restaurarCreditoMensalFuncionario};



