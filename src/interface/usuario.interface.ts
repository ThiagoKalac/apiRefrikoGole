interface IUsuarioCPF {
    cpf: string;
  }
  
  interface IUsuarioCriacao extends IUsuarioCPF {
    nome: string;
    sobrenome: string;
    sexo: string;
    setor: string;
    cargo: string;
    empresa: string;
    senha: string;
    confirma_senha: string;
  }
  




export {IUsuarioCPF,IUsuarioCriacao};