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
    quantidade: number,
    pedidos: IPedidoCriado[]
}

interface IUsuario {
    nome: string;
    sobrenome: string;
    cod_empresa: number;
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
}

export {ICriarPedidoRequest, IPedidosSupabase, IRetornoPedidoCriado, IPedidoCriado};



