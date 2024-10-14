interface ICriarPedidoRequest{
    dataInicio: string;
    dataFim: string;
    cod_empresa: number;
    uuidUsuario: string;
} 

interface IPedidoCriado{
    cod_saib: number,
    nome: string,
    pedido_saib: number,
    pedido_app: number
}

interface IRetornoPedidoCriado {
    quantidade?: number,
    pedidos?: IPedidoCriado[],
    mensagem?: string
}

interface IUsuario {
    nome: string;
    sobrenome: string;
    cod_empresa: number;
    whatsapp?:string;
    credito?:number;
}

interface IProduto {
    pr_cod: number;
    pr_descricao: string;
}

interface IPedidoProduto {
    id: number;
    produto: IProduto;
    id_pedido: number;
    id_produto: number;
    quantidade: number;
    valor_total: number;
    valor_unitario: number;
    atendido: boolean;
    motivo_nao_atendimento: string | null;
    parcela?:number;
}

interface IPedidosSupabase {
    id: number;
    ped_data: Date;
    ped_data_alterado: Date | null;
    ped_status: string;
    ped_valor_total: number;
    ped_usr_cod_saib: number;
    id_usuario: string;
    observacao: string | null;
    liquidacao_id: number | null;
    numero_pedido_saib: number | null;
    ped_qtd_itens: number;
    usuario: IUsuario;
    pedido_produtos: IPedidoProduto[];
    pedido_fat_saib:number;
}

enum enumStatusPedidoSupabase {
    PENDENTE = 'Pendente',
    PROCESSAMENTO = 'Em processamento',
    FATURADO = 'Faturado',
    SEPARACAO = 'Em separação',
    RETIRADA = 'Liberado para retirada',
    CANCELADO = 'Cancelado',
    FINALIZADO = 'Finalizado'
}

interface ISituacaoPedidoSaib{
    PED_COLETOR: number,
    COD_CLIENTE: number,
    COD_EMP_CLIENTE: number,
    SITUACAO: number,
    PED_NOTA: number,
    LIQUIDACAO: number,
    NUMERO_PED_FAT: number
}

interface IProdutosSituacaoSaib{
    PEDIDO_COLETOR: number,
    COD_EMP: number,
    COD_PRODUTO: number,
    SITUACAO: number,
    VALOR_UN: number
}

interface IDownLoadRelatorioRequest{
    dataInicio: string,
    dataFim: string,
    cod_empresa: number
}

interface IPedidoRelatioRh{ 
    pedido_id: number,
    nome: string,
    ped_status: string,
    ped_data: string,
    usuario_pj: boolean,
    cod_empresa: number,
    nome_empresa_senior: string,
    cnpj_empresa: string,
    id_usuario_senior: number,
    id_empresa_senior: number,
    ped_valor_total: number,
    valor_outros: number,
    valor_bebidas: number,
    parcela: number
}

export {
    ICriarPedidoRequest, 
    IPedidosSupabase, 
    IRetornoPedidoCriado, 
    IPedidoCriado, 
    enumStatusPedidoSupabase,
    ISituacaoPedidoSaib,
    IProdutosSituacaoSaib,
    IDownLoadRelatorioRequest,
    IPedidoRelatioRh
};



