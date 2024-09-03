interface IProdutoComprovante {
    nome_produto: string;
    qtd: number;
    valor_uni: number;
    valor_total: number;
}

interface IComprovante {
    whatsapp: string;
    idPedido: number;
    valorPedido: number;
    produtos: IProdutoComprovante[];
    usuario: string;
    dataFaturamento: string;
}


enum TipoMensagemEnum {
    RECUPERACAO_SENHA = "RECUPERACAO_SENHA",
    COMPROVANTE_PEDIDO = "COMPROVANTE_PEDIDO",
    PEDIDO_NAO_ATENDIDO = "PEDIDO_NAO_ANTENDIDO",
    PEDIDO_PARCIAL = "PEDIDO_ATENDIDO_PARCIAL"
}

interface IProdutosNaoAtendidosDetalhes{
    cod_produto: number;
    nome: string;
}

export {IComprovante, IProdutoComprovante, TipoMensagemEnum,IProdutosNaoAtendidosDetalhes};