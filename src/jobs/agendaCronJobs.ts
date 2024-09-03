import { Logging } from "../log/loggin";
import { AtulizarSalario } from "./tasks/atualizaSalario.task";
import { RestaurarCreditoMensalFuncionario } from "./tasks/restaurarCreditoMensal.task";


class Agenda {
    
    static iniciarTarefas() {
        RestaurarCreditoMensalFuncionario.agendar();
        AtulizarSalario.agendar();
        Logging.agendar();
    }

}
export {Agenda};