import cron from 'node-cron';
import { DataSourcePostGree, DataSupabase } from '../../data-source';
import { Funcionarios } from '../../entity/Funcionarios';
import { AppError } from '../../error/appError';
import { Logging } from '../../log/loggin';
import { tipoLog } from '../../interface/log.interface';

class AtulizarSalario {
    private static async executar(): Promise<void>{
        try {
            const listaTodosFuncionarios = await this.usuariosSenior();
            const listaUsuarios = this.usuariosComSalarioAlterado(listaTodosFuncionarios);
         

            if(listaUsuarios.length > 0){
                const {peridoInicio, periodoFim} = this.obterPeriodosFiltroParaData();

                for(const usuario of listaUsuarios){
                   
                    const idUsuarioApp = await this.usuarioIdApp(usuario.cpf);
                    const valorDosPedidos = await this.somaDosValoresDosPedidos(peridoInicio,periodoFim,idUsuarioApp);

                    const novoCredito = +usuario.limite - valorDosPedidos;
                    
                    const {error} = await DataSupabase
                        .from('usuario')
                        .update({credito: novoCredito})
                        .eq('cpf', usuario.cpf)
                        .eq('id', idUsuarioApp)
                    
                    if(error){        
                        throw new AppError('Erro para buscar Id do usuario || AtualizarSalario.executar', 500)
                    }
                }

                Logging.registrarLog({
                    mensagem: 'Salario(s) atualizado com sucesso',
                    stack_trace: null,
                    usuario: null,
                    stack: 'back-end',
                    dados_adicionais: `Atualizados dos usuários: ${listaUsuarios.map(elt => elt.nome).join(', ')}`,
                    tipo_log: tipoLog.INFO
                })
            }

        } catch (error) {
            console.error('Erro ao executar a restauração de crédito mensal:', error);

            Logging.registrarLog({
                mensagem: "Erro ao executar a atualização de salário",
                stack_trace: Logging.formatarObjStackTraceErro(error),
                usuario: null,
                stack: "back-end",
                dados_adicionais: 'cron job/services/jobs/tasks/atualizarSalario',
                tipo_log: tipoLog.ERRO
            });

            throw new AppError(`Erro linha 46 | tarefa AtulizarSalario ${error}`,500)
        }
    }

    private static async usuariosSenior():Promise<Funcionarios[]>{
        const funcionariosRepositorio = DataSourcePostGree.getRepository(Funcionarios);
        const listaFuncionario = await funcionariosRepositorio.find()

        // Log de consulta de funcionários
        Logging.registrarLog({
            mensagem: "Consulta de todos os funcionários realizada",
            stack_trace: null,
            usuario: null,
            stack: "back-end",
            dados_adicionais: `Total de funcionários consultados: ${listaFuncionario.length}`,
            tipo_log: tipoLog.INFO
        });

        return listaFuncionario;
    }

    private static usuariosComSalarioAlterado(listaFuncionario:Funcionarios[]):Funcionarios[]{
        return listaFuncionario.filter(funcionario => funcionario.salario_alterado === true);
    }

    private static obterPeriodosFiltroParaData():{peridoInicio:string, periodoFim:string}{
        const dataAtual = new Date();
        const dia = dataAtual.getDate();
        const mes = dataAtual.getMonth();
        const ano = dataAtual.getFullYear();

        // Período inicial: 21 do mês corrente ou anterior
        const filtroPeriodoInicio = new Date(ano, mes - (dia >= 21 ? 0 : 1), 21, 0, 0, 0, 0);

        // Período final: 20 do mês corrente ou seguinte
        const filtroPeriodoFim = new Date(ano, mes + (dia >= 21 ? 1 : 0), 20, 23, 59, 59, 999);

        // Ajuste para manter a hora local correta sem o impacto do fuso horário
        const inicioISO = new Date(filtroPeriodoInicio.getTime() - filtroPeriodoInicio.getTimezoneOffset() * 60000).toISOString().replace('Z', '');
        const fimISO = new Date(filtroPeriodoFim.getTime() - filtroPeriodoFim.getTimezoneOffset() * 60000).toISOString().replace('Z', '');
      
        return {peridoInicio:inicioISO, periodoFim:fimISO}
       
    }

    private static async usuarioIdApp(cpf:string):Promise<string>{
        const {data, error} = await DataSupabase
            .from('usuario') 
            .select('id')
            .eq('cpf', cpf)
            .maybeSingle()
        
        if(error){
            throw new AppError('Erro para buscar Id do usuario || AtualizarSalario.usuarioIdApp', 500)
        }    
        return data.id;
    }

    private static async somaDosValoresDosPedidos(peridoInicio:string,periodoFim:string,idUsuarioApp:string):Promise<number>{
        const {data, error} = await DataSupabase
            .from('pedidos')
            .select('*')
            .eq('id_usuario', idUsuarioApp)
            .gte('ped_data', peridoInicio)
            .lte('ped_data', periodoFim)

        if(error){
            if(error){
                throw new AppError('Erro para buscar Id do usuario || AtualizarSalario.somaDosValoresDosPedidos', 500)
            }   
        }
       
        const total = data.reduce((acc, pedido) => acc + pedido.ped_valor_total, 0);

        return total;
    }

    static agendar(){
          // agendado para executar todos dia 30 de cada mês|  0 0 30 * * 
        cron.schedule('0 0 30 * *', async () => {
            this.executar()    
        }, {
            scheduled: true,
            timezone: "America/Sao_Paulo"
        });
    }
}

export {AtulizarSalario}