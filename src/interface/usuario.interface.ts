interface IUsuario{
  id: string;
  cpf: string;
  nome: string;
  sobrenome: string;
  sexo: string;
  cargo: string;
  empresa: string;
  cod_empresa: number;
  admin: boolean;
  credito: number;
  senha: string;
  token: string;
  codigo_saib: number;
  criado_em: Date;
}

type IUsuarioCPF = Pick<IUsuario, 'cpf'>;
  
interface IUsuarioCriacao extends Omit<IUsuario, 'id' | 'admin' | 'token' |'criado_em'> {
  confirma_senha: string;
}

interface IRespostaInfoUsuario extends Omit<IUsuarioCriacao, 'senha' | 'confirma_senha'> {}
  




export {IUsuarioCPF,IUsuarioCriacao,IRespostaInfoUsuario, IUsuario};