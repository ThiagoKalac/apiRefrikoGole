
interface IProdutoSaibResp {
    COD_PRODUTO: number;
    COD_EMP: number;
    NOME: string;
    FD_CX: string;
    PROD_COMPL_2: string;
    PROD_COMPL_3: string;
    TABELA: number;
    DATA_VIGENCIA: Date;
    DATA_VALIDADE: Date;
    VALOR: number;
    LITRAGEM: number;
    FATOR_CX: number;
    COD_MARCA: number;
    NOME_MARCA: string;
    SABOR: string;
}

interface IEmpresaProduto{
    cod_emp: number;
    valor: number;
    data_valida: boolean;
    nome: string;
}


interface IProdutoRespFormatada {
    cod: number;
    nome: string;
    id_categoria: number;
    categoria: string;
    fd_cx: string;
    litragem: number;
    sub_categoria: string;
    empresas: IEmpresaProduto[];
}

export {IProdutoSaibResp, IProdutoRespFormatada, IEmpresaProduto};