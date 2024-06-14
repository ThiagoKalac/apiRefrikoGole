interface ILogin {
    cpf: string;
    senha: string;
}

interface IAutorizacaoResponse {
    token: string;
    id: string;
    cpf: string;
    nome: string;
    sobrenome: string;
    whatsapp: string;
    sexo: string;
    cargo: string;
    empresa: string;
    cod_empresa: number;
    credito: number;
    codigo_saib: number;

}

export {ILogin, IAutorizacaoResponse}