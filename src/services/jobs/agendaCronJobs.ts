import { AtulizarSalario } from "./tasks/atualizaSalario.task";
import { restaurarCreditoMensalFuncionario } from "./tasks/restaurarCreditoMensal.task";


class Agenda {
    
    static iniciarTarefas() {
        restaurarCreditoMensalFuncionario.agendar()
        AtulizarSalario.agendar()
    }
}
export {Agenda};