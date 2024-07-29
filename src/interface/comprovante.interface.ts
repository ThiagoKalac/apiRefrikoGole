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
    COMPROVANTE_PEDIDO = "COMPROVANTE_PEDIDO"
}

export {IComprovante, IProdutoComprovante, TipoMensagemEnum};