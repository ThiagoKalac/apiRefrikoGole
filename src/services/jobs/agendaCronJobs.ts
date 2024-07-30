import { restaurarCreditoMensalFuncionario } from "./tasks/restaurarCreditoMensal.task";


class Agenda {
    
    static iniciarTarefas() {
        restaurarCreditoMensalFuncionario.agendar()
    }
}
export {Agenda};