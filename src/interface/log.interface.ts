
enum tipoLog {
    CRITICO = "Crítico",
    INFO = "Informação",
    ERRO = "Urgente"
}

interface ILog {
    mensagem: string;
    stack_trace?: { [key: string]: any } | null;
    usuario?: string | null;
    stack: string;
    dados_adicionais?: string | null;
    tipo_log: tipoLog;
}


export {ILog, tipoLog}