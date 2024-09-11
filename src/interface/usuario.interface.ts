import { IAutorizacaoResponse } from "./sessao.interface";

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
  perfil: string | null;
  nome_empresa_senior: string;
  cnpj_empresa: string;
  id_usuario_senior: number;
  id_empresa_senior: number;
  usuario_pj: boolean;
  ativado: boolean;
  desativado_em: Date | null;
  ativado_em: Date | null;

}

type IUsuarioCPF = Pick<IUsuario, 'cpf'>;
  
interface IUsuarioCriacao extends Omit<IUsuario, 'id' | 'admin' | 'token' |'criado_em'| 'atualizado_em' | 'token_recuperacao' | 'perfil' | 'ativado' | 'desativado_em' | 'ativado_em'> {
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
  perfil?: string;
}

interface IUsuarioValidarRecuperacaoSenha {
  cpf: string,
  token: string
}

interface IUsuarioAtualizarRecuperacaoSenha {
  senha: string,
  confirma_senha: string
}

interface IUsuarioAtualizacaoResposta extends Omit<IAutorizacaoResponse, 'token'>{}

export {
  IUsuarioCPF,
  IUsuarioCriacao,
  IRespostaInfoUsuario, 
  IUsuario,
  IUsuarioValidarRecuperacaoSenha,
  IUsuarioAtualizarRecuperacaoSenha,
  IUsuarioAtualizacao,
  IUsuarioAtualizacaoResposta
};