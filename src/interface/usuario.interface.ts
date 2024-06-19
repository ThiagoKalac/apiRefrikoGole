interface IUsuario{
  id: string;
  cpf: string;
  nome: string;
  sobrenome: string;
  sexo: string;
  cargo: string;
  empresa: string;
  whatsapp: string;
  cod_empresa: number;
  admin: boolean;
  credito: number;
  senha: string;
  token: string;
  token_recuperacao: string;
  codigo_saib: number;
  criado_em: Date;
  atualizado_em: Date | null;
}

type IUsuarioCPF = Pick<IUsuario, 'cpf'>;
  
interface IUsuarioCriacao extends Omit<IUsuario, 'id' | 'admin' | 'token' |'criado_em'| 'atualizado_em' | 'token_recuperacao'> {
  confirma_senha: string;
}

interface IRespostaInfoUsuario extends Omit<IUsuarioCriacao, 'senha' | 'confirma_senha'> {}
  
interface IUsuarioAtualizacao {
  nome?: string;
  sobrenome?: string;
  whatsapp?: string;
  confirma_senha?: string;
  senha?: string;
  sexo?: string;
}

interface IUsuarioValidarRecuperacaoSenha {
  cpf: string,
  token: string
}

interface IUsuarioAtualizarRecuperacaoSenha {
  senha: string,
  confirma_senha: string
}

export {
  IUsuarioCPF,
  IUsuarioCriacao,
  IRespostaInfoUsuario, 
  IUsuario,
  IUsuarioValidarRecuperacaoSenha,
  IUsuarioAtualizarRecuperacaoSenha,
  IUsuarioAtualizacao
};