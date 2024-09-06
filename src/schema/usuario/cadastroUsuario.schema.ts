import * as yup from 'yup';
import { IUsuarioCriacao } from '../../interface/usuario.interface';

const cadastroUsuarioSchema: yup.ObjectSchema<IUsuarioCriacao> = yup.object().shape({
    cpf: yup.string().required('cpf: CPF é obrigatório'),
    nome: yup.string().max(50,'O número maximo de caracteres é 50').required('nome: é obrigatório'),
    sobrenome: yup.string().max(100,'O número maximo de caracteres é 100').required('sobrenome:  é obrigatório'),
    sexo: yup.string().oneOf(['masculino', 'feminino'], 'Sexo inválido').required('sexo: é obrigatório'),
    cargo: yup.string().required('cargo: é obrigatório'),
    empresa: yup.string().required('empresa: é obrigatório'),
    whatsapp: yup.string()
      .min(14,'Numero Invalido, passar numero nesse formato ex: +5511999991111')
      .max(14,'Numero Invalido, passar numero nesse formato ex: +5511999991111')
      .required('whatsapp: é obrigatório'),
    cod_empresa: yup.number().required("cod_empresa:  é obrigatório"),
    credito: yup.number().required("credito:  é obrigatório"),
    codigo_saib: yup.number().required("codigo_saib: é obrigatório"),
    nome_empresa_senior: yup.string().required('nome_empresa: é obrigatório o nome da empresa cadastrado na senior'),
    cnpj_empresa: yup.string().required('cnpn_empresa: CNPJ da empresa que o funcionario está contratado é obrigatório'),
    id_usuario_senior: yup.number().required('id_usuario_senior: ID do usuario na SENIOR é obrigatório'),
    id_empresa_senior: yup.number().required('id_empresa_senior: ID da empresa na SENIOR é obrigatório'), 
    usuario_pj: yup.boolean().required('usuario_pj: Obrigatório passar a informação BOOLEAN, se o usuário é PJ'),
    senha: yup.string().min(5, 'A senha deve ter pelo menos 5 caracteres').required('senha: é obrigatória'),
    confirma_senha: yup.string()
      .oneOf([yup.ref('senha'), null], 'As senhas devem coincidir')
      .required('confirma_senha: é obrigatória')
});

export {cadastroUsuarioSchema};


