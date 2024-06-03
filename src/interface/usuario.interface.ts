interface IUsuarioCPF {
    cpf: string;
  }
  
  interface IUsuarioCriacao extends IUsuarioCPF {
    nome: string;
    sobrenome: string;
    sexo: string;
    cargo: string;
    empresa: string;
    cod_empresa: number;
    credito: number;
    codigo_saib: number;
    senha: string;
    confirma_senha: string;
  }
  






export {IUsuarioCPF,IUsuarioCriacao};