interface ILogin {
    cpf: string;
    senha: string;
}

interface ILoginResponse {
    token: string;
    id: string;
    cpf: string;
    nome: string;
    sobrenome: string;
    sexo: string;
    cargo: string;
    empresa: string;
    cod_empresa: number;
    credito: number;
    codigo_saib: number;

}

export {ILogin, ILoginResponse}