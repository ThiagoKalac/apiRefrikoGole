import { Logging } from "../log/loggin";
import { AtualizarPrecoProduto } from "./tasks/atualizarPrecoProduto.task";
import { AtulizarSalario } from "./tasks/atualizaSalario.task";
import { RestaurarCreditoMensalFuncionario } from "./tasks/restaurarCreditoMensal.task";


class Agenda {
    
    static iniciarTarefas() {
        RestaurarCreditoMensalFuncionario.agendar();
        AtulizarSalario.agendar();
        Logging.agendar();
        AtualizarPrecoProduto.agendar();
    }

}
export {Agenda};