
import { DataSupabase } from "../data-source";
import cron from "node-cron";
import { ILog } from "../interface/log.interface";

class Logging  {
    static async registrarLog (dadosLog:ILog | ILog[]):Promise<void>{
        
        try {
             // Se dadosLog não for um array, transforma em um array com um único elemento
             const logsArray = Array.isArray(dadosLog) ? dadosLog : [dadosLog];

            const {error} = await DataSupabase
                .from('log')
                .insert(logsArray);
            
            if(error){
                console.error("Erro ao registrar log na linha 23, classe Logging:", error);
            }
            
        } catch (error) {
            console.error('Falha ao registrar erro na classe Logging: ', error)
        }

    }

    static formatarObjStackTraceErro(error:Error){
        return {
            mensagem: error.message,
            nome: error.name,
            stack: error.stack
        }
    }

    private static async apagarLogsAntigos ():Promise<void>{
        // logica utilizada para apagar registro com 30 de existencia.
        // Ou seja, todo registro criado com mais de 30 dias, será apagado no dia 30 de cada mês.
        const dataCorte = new Date();
        dataCorte.setDate(dataCorte.getDate() - 30); 

        try {
            const {error} = await DataSupabase
                .from('log')
                .delete()
                .lt('data', dataCorte.toISOString())
            
            if(error){
                console.error("Erro ao apagar logs antigos na linha 53, classe Logging:", error);
            }
            
        } catch (error) {
            console.error('Falha ao apagar logs antigos na classe Logging: ', error)
        }
    }

    static agendar(){
        // agendado para to dia 30 de cade mes às 00:00  
        cron.schedule("0 0 30 * *", async () => {
            this.apagarLogsAntigos()    
        }, {
            scheduled: true,
            timezone: "America/Sao_Paulo"
        });
    }

}

export {Logging}